"""
Sampling Endpoints
Weight sampling and SGR calculation API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.pond import Batch
from app.models.sampling import Sampling
from app.schemas.sampling import SamplingCreate, SamplingResponse, SamplingWithBatchResponse
from app.services.lifecycle_manager import LifecycleManager
from app.services.calculators import BiomassCalculator, SGRCalculator
from app.services.history_tracker import HistoryTracker
from app.services.alert_generator import AlertGenerator

router = APIRouter()

# Initialize services
lifecycle_manager = LifecycleManager()
biomass_calculator = BiomassCalculator()
sgr_calculator = SGRCalculator()
history_tracker = HistoryTracker()
alert_generator = AlertGenerator()


@router.post("", response_model=SamplingResponse, status_code=status.HTTP_201_CREATED)
def create_sampling(
    sampling_data: SamplingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Record a new weight sampling
    
    Process:
    1. Validates batch exists and is active
    2. Validates sample count >= 30
    3. Calculates average weight from sample
    4. Calculates SGR if previous sampling exists
    5. Updates batch avg_weight
    6. Updates batch stage if weight threshold crossed
    7. Recalculates biomass
    8. Records in history
    9. Checks for alerts (SGR low, transfer ready, harvest ready)
    """
    # Validate batch exists
    batch = db.query(Batch).filter(Batch.id == sampling_data.batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch {sampling_data.batch_id} not found"
        )
    
    if batch.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch {batch.batch_code} is not active"
        )
    
    # Calculate average weight from sample
    calculated_avg_weight = sampling_data.total_sample_weight / sampling_data.sample_count
    
    # Get previous weight for SGR calculation
    previous_avg_weight = batch.avg_weight
    
    # Calculate SGR if we have previous sampling data
    sgr = None
    days_since_last = None
    
    if batch.last_sampling_date:
        days_since_last = (datetime.now() - batch.last_sampling_date).days
        
        if days_since_last > 0:
            sgr = sgr_calculator.calculate_sgr(
                previous_avg_weight,
                calculated_avg_weight,
                days_since_last
            )
    
    # Create sampling record
    sampling = Sampling(
        batch_id=sampling_data.batch_id,
        sample_count=sampling_data.sample_count,
        total_sample_weight=sampling_data.total_sample_weight,
        calculated_avg_weight=calculated_avg_weight,
        previous_avg_weight=previous_avg_weight,
        sgr=sgr,
        days_since_last=days_since_last,
        sampled_by=sampling_data.sampled_by,
        notes=sampling_data.notes,
        sampled_at=datetime.now()
    )
    
    db.add(sampling)
    
    # Update batch
    batch.previous_avg_weight = previous_avg_weight
    batch.avg_weight = calculated_avg_weight
    batch.last_sampling_date = datetime.now()
    
    if sgr is not None:
        batch.sgr = sgr
    
    # Update stage based on new weight
    stage_changed, old_stage, new_stage = lifecycle_manager.update_stage(batch, db)
    
    # Recalculate biomass
    batch.biomass = biomass_calculator.calculate_biomass(
        batch.current_count,
        batch.avg_weight
    )
    
    db.commit()
    db.refresh(sampling)
    db.refresh(batch)
    
    # Record in history
    history_tracker.record_sampling(
        batch_id=batch.id,
        sample_count=sampling_data.sample_count,
        new_avg_weight=calculated_avg_weight,
        previous_avg_weight=previous_avg_weight,
        sampled_by=sampling_data.sampled_by,
        notes=sampling_data.notes,
        db=db
    )
    
    # Check for alerts
    alert_generator.check_all_alerts(batch, db)
    
    return sampling


@router.get("/batch/{batch_id}", response_model=List[SamplingResponse])
def get_batch_samplings(
    batch_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all samplings for a batch
    
    Returns samplings ordered by date (newest first)
    """
    # Validate batch exists
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch {batch_id} not found"
        )
    
    samplings = db.query(Sampling).filter(
        Sampling.batch_id == batch_id
    ).order_by(
        Sampling.sampled_at.desc()
    ).limit(limit).all()
    
    return samplings


@router.get("/{sampling_id}", response_model=SamplingWithBatchResponse)
def get_sampling(
    sampling_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get sampling details with batch information"""
    sampling = db.query(Sampling).filter(Sampling.id == sampling_id).first()
    
    if not sampling:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sampling {sampling_id} not found"
        )
    
    # Get batch info
    batch = db.query(Batch).filter(Batch.id == sampling.batch_id).first()
    
    # Create response with batch info
    response = SamplingWithBatchResponse(
        **sampling.__dict__,
        batch_code=batch.batch_code,
        batch_stage=batch.stage,
        batch_current_count=batch.current_count
    )
    
    return response
