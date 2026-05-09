from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.pond import Pond, Batch
from app.models.water_quality import WaterQuality
from app.models.mortality import Additive
from app.schemas.pond import (
    PondCreate, Pond as PondSchema,
    BatchCreate, Batch as BatchSchema,
    UnitSummaryResponse,
)
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

VALID_UNIT_TYPES = {"hatchery", "growout", "fattening"}

@router.get("/", response_model=List[PondSchema])
def get_ponds(
    skip: int = 0,
    limit: int = 100,
    unit_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all ponds"""
    query = db.query(Pond)
    if unit_type:
        query = query.filter(Pond.unit_type == unit_type)
    ponds = query.offset(skip).limit(limit).all()
    return ponds

@router.post("/", response_model=PondSchema, status_code=status.HTTP_201_CREATED)
def create_pond(
    pond: PondCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new pond"""
    # Check if pond code exists
    if db.query(Pond).filter(Pond.pond_code == pond.pond_code).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pond code already exists"
        )
    
    db_pond = Pond(**pond.dict())
    db.add(db_pond)
    db.commit()
    db.refresh(db_pond)
    return db_pond

@router.get("/{pond_id}", response_model=PondSchema)
def get_pond(
    pond_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get pond by ID"""
    pond = db.query(Pond).filter(Pond.id == pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail="Pond not found")
    return pond

@router.get("/{pond_id}/batches", response_model=List[BatchSchema])
def get_pond_batches(
    pond_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all batches for a pond"""
    batches = db.query(Batch).filter(Batch.pond_id == pond_id).all()
    return batches

@router.get("/unit-summary/{unit_type}", response_model=UnitSummaryResponse)
def get_unit_summary(
    unit_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Aggregate KPIs for an entire unit (hatchery / growout / fattening)."""
    if unit_type not in VALID_UNIT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid unit_type. Expected one of {sorted(VALID_UNIT_TYPES)}",
        )

    ponds = db.query(Pond).filter(Pond.unit_type == unit_type).all()
    pond_ids = [p.id for p in ponds]
    pond_count = len(ponds)

    # Defaults for empty-unit case
    active_batches: list[Batch] = []
    if pond_ids:
        active_batches = (
            db.query(Batch)
            .filter(Batch.pond_id.in_(pond_ids), Batch.status == "active")
            .all()
        )

    total_biomass_g = sum((b.biomass or 0) for b in active_batches)
    total_biomass_kg = total_biomass_g / 1000.0

    avg_weight_g = None
    if active_batches:
        weights = [b.avg_weight for b in active_batches if b.avg_weight]
        if weights:
            avg_weight_g = sum(weights) / len(weights)

    response = UnitSummaryResponse(
        unit_type=unit_type,
        pond_count=pond_count,
        active_batch_count=len(active_batches),
        total_biomass_kg=round(total_biomass_kg, 2),
        avg_weight_g=round(avg_weight_g, 1) if avg_weight_g is not None else None,
    )

    if unit_type == "hatchery":
        egg_batches = [b for b in active_batches if b.stage in ("eggs", "fry")]
        response.total_eggs = sum((b.initial_count or 0) for b in egg_batches) or None
        rates = [
            b.current_count / b.initial_count
            for b in egg_batches
            if b.initial_count
        ]
        response.avg_hatch_rate = (sum(rates) / len(rates)) if rates else None

    if unit_type in ("growout", "fattening") and pond_ids:
        # Latest floc reading per pond, averaged.
        latest_per_pond = (
            db.query(
                WaterQuality.pond_id.label("pond_id"),
                func.max(WaterQuality.measured_at).label("latest"),
            )
            .filter(WaterQuality.pond_id.in_(pond_ids))
            .group_by(WaterQuality.pond_id)
            .subquery()
        )
        latest_floc_rows = (
            db.query(WaterQuality.floc)
            .join(
                latest_per_pond,
                (WaterQuality.pond_id == latest_per_pond.c.pond_id)
                & (WaterQuality.measured_at == latest_per_pond.c.latest),
            )
            .all()
        )
        floc_values = [r[0] for r in latest_floc_rows if r[0] is not None]
        response.avg_floc_level = (
            round(sum(floc_values) / len(floc_values), 2) if floc_values else None
        )

        # Molasses consumed across this unit's ponds in the last 7 days.
        since = datetime.utcnow() - timedelta(days=7)
        molasses_total = (
            db.query(func.coalesce(func.sum(Additive.amount), 0.0))
            .filter(
                Additive.pond_id.in_(pond_ids),
                Additive.type == "molasses",
                Additive.added_at >= since,
            )
            .scalar()
        )
        response.molasses_consumption_kg_7d = round(float(molasses_total or 0.0), 2)

    if unit_type == "fattening":
        ready = [
            b for b in active_batches
            if b.stage == "fattening" and 350 <= (b.avg_weight or 0) <= 600
        ]
        response.harvest_ready_count = len(ready)

    return response


@router.post("/batches", response_model=BatchSchema, status_code=status.HTTP_201_CREATED)
def create_batch(
    batch: BatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new batch"""
    # Check if batch code exists
    if db.query(Batch).filter(Batch.batch_code == batch.batch_code).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch code already exists"
        )
    
    # Check if pond exists
    pond = db.query(Pond).filter(Pond.id == batch.pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail="Pond not found")
    
    db_batch = Batch(**batch.dict())
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch
