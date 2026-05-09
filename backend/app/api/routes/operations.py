from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.water_quality import WaterQuality
from app.models.feeding import Feeding
from app.models.mortality import Mortality, Additive
from app.schemas.operations import (
    WaterQualityCreate, WaterQuality as WaterQualitySchema,
    FeedingCreate, Feeding as FeedingSchema,
    MortalityCreate, Mortality as MortalitySchema,
    AdditiveCreate, Additive as AdditiveSchema
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
