"""
Harvest API Routes
Endpoints for harvest operations and management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.models.harvest import Harvest
from app.models.pond import Batch, Pond
from app.models.user import User
from app.schemas.harvest import (
    HarvestCreate,
    HarvestUpdate,
    HarvestResponse,
    HarvestDetailResponse,
    HarvestSummary,
    HarvestReadyBatch
)
from app.services.harvest_manager import HarvestManager

router = APIRouter()
harvest_manager = HarvestManager()


@router.post("/", response_model=HarvestResponse, status_code=status.HTTP_201_CREATED)
def create_harvest(
    harvest_data: HarvestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new harvest record
    
    - Validates batch is ready for harvest
    - Calculates harvest metrics
    - Updates batch status to 'harvested'
    - Records harvest in history
    """
    # Get batch
    batch = db.query(Batch).filter(Batch.id == harvest_data.batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch with id {harvest_data.batch_id} not found"
        )
    
    # Validate harvest
    is_valid, error_msg = harvest_manager.validate_harvest(
        batch,
        harvest_data.harvest_count,
        db
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Execute harvest
    try:
        harvest = harvest_manager.execute_harvest(
            batch,
            harvest_data.dict(),
            db
        )
        return harvest
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create harvest: {str(e)}"
        )


@router.get("/", response_model=List[HarvestResponse])
def get_harvests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all harvest records with optional filtering
    
    - Supports pagination
    - Filter by status, date range
    - Returns list of harvests
    """
    query = db.query(Harvest)
    
    # Apply filters
    if status_filter:
        query = query.filter(Harvest.status == status_filter)
    
    if start_date:
        query = query.filter(Harvest.harvest_date >= start_date)
    
    if end_date:
        query = query.filter(Harvest.harvest_date <= end_date)
    
    # Order by harvest date (most recent first)
    query = query.order_by(Harvest.harvest_date.desc())
    
    # Apply pagination
    harvests = query.offset(skip).limit(limit).all()
    
    return harvests


@router.get("/ready", response_model=List[HarvestReadyBatch])
def get_harvest_ready_batches(
    min_weight: Optional[float] = Query(None, description="Minimum weight filter"),
    max_weight: Optional[float] = Query(None, description="Maximum weight filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all batches ready for harvest
    
    - Filters batches in fattening stage
    - Weight between 350-600g (or custom range)
    - Returns readiness score for each batch
    - Sorted by readiness score
    """
    try:
        ready_batches = harvest_manager.get_harvest_ready_batches(
            db,
            min_weight=min_weight,
            max_weight=max_weight
        )
        return ready_batches
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get harvest-ready batches: {str(e)}"
        )


@router.get("/summary", response_model=HarvestSummary)
def get_harvest_summary(
    start_date: Optional[datetime] = Query(None, description="Start date for summary"),
    end_date: Optional[datetime] = Query(None, description="End date for summary"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get harvest summary statistics
    
    - Total harvests, fish, biomass
    - Average weight, FCR, survival rate
    - Quality grade distribution
    - Total revenue
    """
    try:
        summary = harvest_manager.get_harvest_summary(
            db,
            start_date=start_date,
            end_date=end_date
        )
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get harvest summary: {str(e)}"
        )


@router.get("/{harvest_id}", response_model=HarvestDetailResponse)
def get_harvest(
    harvest_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed harvest information by ID
    
    - Includes batch and pond information
    - Full harvest metrics
    """
    harvest = db.query(Harvest).filter(Harvest.id == harvest_id).first()
    
    if not harvest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Harvest with id {harvest_id} not found"
        )
    
    # Get related data
    batch = db.query(Batch).filter(Batch.id == harvest.batch_id).first()
    pond = db.query(Pond).filter(Pond.id == harvest.pond_id).first()
    
    # Create detailed response
    harvest_dict = {
        **harvest.__dict__,
        "batch_code": batch.batch_code if batch else None,
        "pond_code": pond.pond_code if pond else None,
        "unit_type": pond.unit_type if pond else None
    }
    
    return harvest_dict


@router.get("/batch/{batch_id}", response_model=HarvestResponse)
def get_harvest_by_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get harvest record for a specific batch
    
    - Returns harvest if batch has been harvested
    - Returns 404 if no harvest found
    """
    harvest = db.query(Harvest).filter(Harvest.batch_id == batch_id).first()
    
    if not harvest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No harvest found for batch {batch_id}"
        )
    
    return harvest


@router.patch("/{harvest_id}", response_model=HarvestResponse)
def update_harvest(
    harvest_id: int,
    harvest_update: HarvestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update harvest record
    
    - Update status, price, buyer, notes
    - Cannot update harvest metrics
    """
    harvest = db.query(Harvest).filter(Harvest.id == harvest_id).first()
    
    if not harvest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Harvest with id {harvest_id} not found"
        )
    
    # Update fields
    update_data = harvest_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(harvest, field, value)
    
    # Recalculate revenue if price changed
    if "price_per_kg" in update_data and update_data["price_per_kg"]:
        harvest.total_revenue = harvest.total_harvest_weight * update_data["price_per_kg"]
    
    try:
        db.commit()
        db.refresh(harvest)
        return harvest
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update harvest: {str(e)}"
        )


@router.delete("/{harvest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_harvest(
    harvest_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete harvest record
    
    - Also reverts batch status back to 'active'
    - Use with caution!
    """
    harvest = db.query(Harvest).filter(Harvest.id == harvest_id).first()
    
    if not harvest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Harvest with id {harvest_id} not found"
        )
    
    # Revert batch status
    batch = db.query(Batch).filter(Batch.id == harvest.batch_id).first()
    if batch:
        batch.status = "active"
        batch.harvest_date = None
    
    try:
        db.delete(harvest)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete harvest: {str(e)}"
        )
