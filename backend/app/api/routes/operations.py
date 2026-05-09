from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.water_quality import WaterQuality
from app.models.feeding import Feeding
from app.models.mortality import Mortality, Additive, RoutineTask
from app.models.pond import Pond
from app.schemas.operations import (
    WaterQualityCreate, WaterQualityBulkCreate, WaterQuality as WaterQualitySchema,
    FeedingCreate, FeedingBulkCreate, Feeding as FeedingSchema,
    MortalityCreate, Mortality as MortalitySchema,
    AdditiveCreate, Additive as AdditiveSchema,
    RoutineTaskCreate, RoutineTaskBulkCreate, RoutineTask as RoutineTaskSchema
)
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

# Water Quality Routes
@router.post("/water-quality", response_model=WaterQualitySchema, status_code=status.HTTP_201_CREATED)
def create_water_quality(
    data: WaterQualityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Record water quality measurement"""
    db_record = WaterQuality(**data.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.post("/water-quality/bulk", response_model=List[WaterQualitySchema], status_code=status.HTTP_201_CREATED)
def create_water_quality_bulk(
    payload: WaterQualityBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Bulk-create water-quality readings (one row per pond)"""
    db_records = [WaterQuality(**r.dict()) for r in payload.records]
    db.add_all(db_records)
    db.commit()
    for r in db_records:
        db.refresh(r)
    return db_records

@router.get("/water-quality/pond/{pond_id}", response_model=List[WaterQualitySchema])
def get_water_quality_by_pond(
    pond_id: int,
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get water quality records for a pond"""
    since = datetime.utcnow() - timedelta(days=days)
    records = db.query(WaterQuality).filter(
        WaterQuality.pond_id == pond_id,
        WaterQuality.measured_at >= since
    ).order_by(WaterQuality.measured_at.desc()).all()
    return records

# Feeding Routes
@router.post("/feeding", response_model=FeedingSchema, status_code=status.HTTP_201_CREATED)
def create_feeding(
    data: FeedingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Record feeding operation"""
    db_record = Feeding(**data.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.post("/feeding/bulk", response_model=List[FeedingSchema], status_code=status.HTTP_201_CREATED)
def create_feeding_bulk(
    payload: FeedingBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Bulk-create feeding records (one row per pond)"""
    db_records = [Feeding(**r.dict()) for r in payload.records]
    db.add_all(db_records)
    db.commit()
    for r in db_records:
        db.refresh(r)
    return db_records

@router.get("/feeding/pond/{pond_id}", response_model=List[FeedingSchema])
def get_feeding_by_pond(
    pond_id: int,
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get feeding records for a pond"""
    since = datetime.utcnow() - timedelta(days=days)
    records = db.query(Feeding).filter(
        Feeding.pond_id == pond_id,
        Feeding.fed_at >= since
    ).order_by(Feeding.fed_at.desc()).all()
    return records

# Mortality Routes
@router.post("/mortality", response_model=MortalitySchema, status_code=status.HTTP_201_CREATED)
def create_mortality(
    data: MortalityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Record mortality"""
    db_record = Mortality(**data.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.get("/mortality/pond/{pond_id}", response_model=List[MortalitySchema])
def get_mortality_by_pond(
    pond_id: int,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get mortality records for a pond"""
    since = datetime.utcnow() - timedelta(days=days)
    records = db.query(Mortality).filter(
        Mortality.pond_id == pond_id,
        Mortality.recorded_at >= since
    ).order_by(Mortality.recorded_at.desc()).all()
    return records

# Additives Routes
@router.post("/additives", response_model=AdditiveSchema, status_code=status.HTTP_201_CREATED)
def create_additive(
    data: AdditiveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Record additive addition"""
    db_record = Additive(**data.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.get("/additives/pond/{pond_id}", response_model=List[AdditiveSchema])
def get_additives_by_pond(
    pond_id: int,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get additive records for a pond"""
    since = datetime.utcnow() - timedelta(days=days)
    records = db.query(Additive).filter(
        Additive.pond_id == pond_id,
        Additive.added_at >= since
    ).order_by(Additive.added_at.desc()).all()
    return records

# Routine Task Routes
@router.post("/routine-tasks", response_model=RoutineTaskSchema, status_code=status.HTTP_201_CREATED)
def create_routine_task(
    data: RoutineTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Record a routine task (waste_removal, diffuser_cleaning, water_change, sorting)"""
    db_record = RoutineTask(**data.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.post("/routine-tasks/bulk", response_model=List[RoutineTaskSchema], status_code=status.HTTP_201_CREATED)
def create_routine_tasks_bulk(
    payload: RoutineTaskBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Bulk-create routine tasks (used by the daily-task checklist)"""
    db_records = [RoutineTask(**t.dict()) for t in payload.tasks]
    db.add_all(db_records)
    db.commit()
    for r in db_records:
        db.refresh(r)
    return db_records

@router.get("/routine-tasks/pond/{pond_id}", response_model=List[RoutineTaskSchema])
def get_routine_tasks_by_pond(
    pond_id: int,
    task_type: Optional[str] = None,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get routine task records for a pond, optionally filtered by task_type"""
    since = datetime.utcnow() - timedelta(days=days)
    q = db.query(RoutineTask).filter(
        RoutineTask.pond_id == pond_id,
        RoutineTask.performed_at >= since,
    )
    if task_type:
        q = q.filter(RoutineTask.task_type == task_type)
    return q.order_by(RoutineTask.performed_at.desc()).all()

@router.get("/routine-tasks/today/{unit_type}", response_model=List[RoutineTaskSchema])
def get_routine_tasks_today_by_unit(
    unit_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get today's routine tasks for every pond in a unit (used by the daily checklist)."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return (
        db.query(RoutineTask)
        .join(Pond, RoutineTask.pond_id == Pond.id)
        .filter(
            Pond.unit_type == unit_type,
            RoutineTask.performed_at >= today_start,
        )
        .order_by(RoutineTask.performed_at.desc())
        .all()
    )
