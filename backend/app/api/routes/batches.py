"""
Batch Management Endpoints
Complete batch lifecycle management API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.pond import Batch, Pond
from app.models.alert import Alert
from app.schemas.batch import (
    BatchCreate, BatchUpdate, BatchResponse, 
    BatchDetailResponse, BatchMetricsResponse
)
from app.services.lifecycle_manager import LifecycleManager
from app.services.calculators import (
    BiomassCalculator, FCRCalculator, SGRCalculator,
    HarvestPredictor, FeedingCalculator
)
from app.services.history_tracker import HistoryTracker
from app.services.alert_generator import AlertGenerator

router = APIRouter()

# Initialize services
lifecycle_manager = LifecycleManager()
biomass_calculator = BiomassCalculator()
fcr_calculator = FCRCalculator()
sgr_calculator = SGRCalculator()
harvest_predictor = HarvestPredictor()
feeding_calculator = FeedingCalculator()
history_tracker = HistoryTracker()
alert_generator = AlertGenerator()


@router.post("", response_model=BatchResponse, status_code=status.HTTP_201_CREATED)
def create_batch(
    batch_data: BatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new batch
    
    - Validates pond exists and is active
    - Determines lifecycle stage based on weight
    - Calculates initial biomass
    - Records creation in history
    """
    # Validate pond exists
    pond = db.query(Pond).filter(Pond.id == batch_data.pond_id).first()
    if not pond:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pond {batch_data.pond_id} not found"
        )
    
    if pond.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pond {pond.pond_code} is not active"
        )
    
    # Check if batch code already exists
    existing_batch = db.query(Batch).filter(Batch.batch_code == batch_data.batch_code).first()
    if existing_batch:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch code {batch_data.batch_code} already exists"
        )
    
    # Determine stage based on weight
    stage = lifecycle_manager.determine_stage(batch_data.avg_weight)
    
    # Calculate initial biomass
    biomass = biomass_calculator.calculate_biomass(
        batch_data.initial_count,
        batch_data.avg_weight
    )
    
    # Create batch
    batch = Batch(
        batch_code=batch_data.batch_code,
        pond_id=batch_data.pond_id,
        stocking_date=batch_data.stocking_date,
        initial_count=batch_data.initial_count,
        current_count=batch_data.initial_count,
        avg_weight=batch_data.avg_weight,
        stage=stage,
        source=batch_data.source,
        supplier=batch_data.supplier,
        status="active",
        created_by=batch_data.created_by,
        biomass=biomass,
        survival_rate=100.0,
        mortality_rate=0.0
    )
    
    db.add(batch)
    db.commit()
    db.refresh(batch)
    
    # Record creation in history
    history_tracker.record_batch_creation(
        batch_id=batch.id,
        pond_id=batch.pond_id,
        initial_count=batch.initial_count,
        avg_weight=batch.avg_weight,
        created_by=batch_data.created_by,
        db=db
    )
    
    return batch


@router.get("", response_model=List[BatchResponse])
def list_batches(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    stage: Optional[str] = None,
    pond_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all batches with optional filters
    
    - Filter by status (active, transferred, harvested)
    - Filter by stage
    - Filter by pond
    """
    query = db.query(Batch)
    
    if status:
        query = query.filter(Batch.status == status)
    
    if stage:
        query = query.filter(Batch.stage == stage)
    
    if pond_id:
        query = query.filter(Batch.pond_id == pond_id)
    
    batches = query.offset(skip).limit(limit).all()
    return batches


@router.get("/active", response_model=List[BatchResponse])
def get_active_batches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all active batches"""
    batches = db.query(Batch).filter(Batch.status == "active").all()
    return batches


@router.get("/by-stage/{stage}", response_model=List[BatchResponse])
def get_batches_by_stage(
    stage: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all batches in a specific lifecycle stage"""
    batches = db.query(Batch).filter(
        Batch.stage == stage,
        Batch.status == "active"
    ).all()
    return batches


@router.get("/{batch_id}", response_model=BatchDetailResponse)
def get_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get batch details with complete history
    
    Returns batch with:
    - All calculated metrics
    - Complete history
    - Related samplings, transfers, alerts
    """
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch {batch_id} not found"
        )
    
    return batch


@router.patch("/{batch_id}", response_model=BatchResponse)
def update_batch(
    batch_id: int,
    batch_update: BatchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update batch information
    
    - Updates specified fields
    - Recalculates biomass if count or weight changed
    - Updates stage if weight changed
    - Checks for alerts
    """
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch {batch_id} not found"
        )
    
    # Update fields
    if batch_update.current_count is not None:
        batch.current_count = batch_update.current_count
        
        # Recalculate survival and mortality rates
        batch.survival_rate = (batch.current_count / batch.initial_count) * 100
        batch.mortality_rate = 100 - batch.survival_rate
    
    if batch_update.avg_weight is not None:
        batch.avg_weight = batch_update.avg_weight
    
    if batch_update.stage is not None:
        batch.stage = batch_update.stage
    
    if batch_update.status is not None:
        batch.status = batch_update.status
    
    # Recalculate biomass
    batch.biomass = biomass_calculator.calculate_biomass(
        batch.current_count,
        batch.avg_weight
    )
    
    # Update stage based on weight
    lifecycle_manager.update_stage(batch, db)
    
    db.commit()
    db.refresh(batch)
    
    # Check for alerts
    alert_generator.check_all_alerts(batch, db)
    
    return batch


@router.delete("/{batch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a batch
    
    Note: This will cascade delete all related records (history, samplings, transfers, alerts)
    """
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch {batch_id} not found"
        )
    
    db.delete(batch)
    db.commit()
    
    return None


@router.get("/{batch_id}/history", response_model=List)
def get_batch_history(
    batch_id: int,
    action_type: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get complete batch history
    
    - Optional filter by action type
    - Returns history ordered by date (newest first)
    """
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch {batch_id} not found"
        )
    
    history = history_tracker.get_batch_history(
        batch_id=batch_id,
        db=db,
        action_type=action_type,
        limit=limit
    )
    
    return history


@router.get("/{batch_id}/metrics", response_model=BatchMetricsResponse)
def get_batch_metrics(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive batch KPIs and metrics
    
    Returns:
    - Current status (count, weight, biomass)
    - Performance metrics (FCR, SGR, mortality)
    - Feeding recommendations
    - Harvest predictions
    - Active alerts count
    """
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch {batch_id} not found"
        )
    
    # Get feeding schedule
    feeding_schedule = feeding_calculator.get_feeding_schedule(batch, db)
    
    # Get harvest prediction
    harvest_prediction = None
    days_to_harvest = None
    predicted_harvest_date = None
    predicted_harvest_weight = None
    
    if batch.sgr:
        harvest_pred = harvest_predictor.get_harvest_prediction(batch, 450.0, db)
        if harvest_pred:
            days_to_harvest = harvest_pred["days_remaining"]
            predicted_harvest_date = harvest_pred["predicted_harvest_date"]
            predicted_harvest_weight = 450.0
    
    # Get alerts count
    active_alerts = db.query(Alert).filter(
        Alert.batch_id == batch_id,
        Alert.is_resolved == False
    ).all()
    
    critical_alerts = [a for a in active_alerts if a.severity == "critical"]
    
    # FCR classification
    fcr_classification = None
    if batch.fcr:
        fcr_classification = fcr_calculator.classify_fcr(batch.fcr)
    
    # SGR classification
    sgr_classification = None
    if batch.sgr:
        sgr_classification = sgr_calculator.classify_sgr(batch.sgr)

    # Hatch rate is only meaningful while the batch is at egg or fry stage.
    # current_count / initial_count gives the proportion that survived hatching.
    hatch_rate = None
    if batch.stage in ("eggs", "fry") and batch.initial_count:
        hatch_rate = batch.current_count / batch.initial_count

    return BatchMetricsResponse(
        batch_id=batch.id,
        batch_code=batch.batch_code,
        stage=batch.stage,
        current_count=batch.current_count,
        avg_weight=batch.avg_weight,
        biomass_kg=batch.biomass / 1000 if batch.biomass else 0,
        fcr=batch.fcr,
        fcr_classification=fcr_classification,
        sgr=batch.sgr,
        sgr_classification=sgr_classification,
        mortality_rate=batch.mortality_rate,
        survival_rate=batch.survival_rate,
        hatch_rate=hatch_rate,
        daily_feed_recommended_kg=feeding_schedule.get("recommended_feed_kg"),
        feed_type=feeding_schedule.get("feed_type"),
        meals_per_day=feeding_schedule.get("meals_per_day"),
        days_to_harvest=days_to_harvest,
        predicted_harvest_date=predicted_harvest_date,
        predicted_harvest_weight=predicted_harvest_weight,
        active_alerts_count=len(active_alerts),
        critical_alerts_count=len(critical_alerts)
    )
