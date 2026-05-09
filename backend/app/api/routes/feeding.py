"""
Feeding Calculation API Routes
Endpoints for daily feed calculations and feeding schedules
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.api.deps import get_db, get_current_user
from app.models.pond import Batch
from app.models.user import User
from app.services.calculators import FeedingCalculator
from pydantic import BaseModel

router = APIRouter()


class FeedingScheduleResponse(BaseModel):
    """Response schema for feeding schedule"""
    batch_id: int
    batch_code: str
    stage: str
    biomass_kg: float
    daily_feed_min_kg: float
    daily_feed_max_kg: float
    recommended_feed_kg: float
    meals_per_day: int
    feed_per_meal_min_kg: float
    feed_per_meal_max_kg: float
    feed_type: Optional[str]


class DailyFeedCalculation(BaseModel):
    """Response schema for daily feed calculation"""
    biomass_kg: float
    stage: str
    daily_feed_min_kg: float
    daily_feed_max_kg: float
    recommended_feed_kg: float
    feeding_rate_min: float
    feeding_rate_max: float


@router.get("/calculate/{batch_id}", response_model=DailyFeedCalculation)
def calculate_daily_feed(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Calculate recommended daily feed amount for a batch
    
    - Returns min, max, and recommended daily feed amounts
    - Based on current biomass and lifecycle stage
    - Includes feeding rate percentages
    """
    # Get batch
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch with id {batch_id} not found"
        )
    
    if not batch.biomass:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch biomass not calculated. Please update batch data."
        )
    
    # Calculate daily feed
    biomass_kg = batch.biomass / 1000.0
    min_feed, max_feed = FeedingCalculator.calculate_daily_feed(biomass_kg, batch.stage)
    
    # Get feeding rates
    rates = FeedingCalculator.FEEDING_RATES.get(batch.stage, (0.03, 0.05))
    
    return {
        "biomass_kg": round(biomass_kg, 2),
        "stage": batch.stage,
        "daily_feed_min_kg": min_feed,
        "daily_feed_max_kg": max_feed,
        "recommended_feed_kg": round((min_feed + max_feed) / 2, 2),
        "feeding_rate_min": rates[0],
        "feeding_rate_max": rates[1]
    }


@router.get("/schedule/{batch_id}", response_model=FeedingScheduleResponse)
def get_feeding_schedule(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get complete feeding schedule for a batch
    
    - Returns daily feed amounts
    - Number of meals per day
    - Feed amount per meal
    - Recommended feed type
    """
    # Get batch
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch with id {batch_id} not found"
        )
    
    if not batch.biomass:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch biomass not calculated. Please update batch data."
        )
    
    # Get feeding schedule
    schedule = FeedingCalculator.get_feeding_schedule(batch, db)
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate feeding schedule"
        )
    
    return schedule


@router.get("/validate-feed-type/{batch_id}")
def validate_feed_type(
    batch_id: int,
    feed_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Validate if feed type is appropriate for batch stage
    
    - Returns validation result
    - Includes recommended feed type
    """
    # Get batch
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch with id {batch_id} not found"
        )
    
    # Validate feed type
    is_valid = FeedingCalculator.validate_feed_type(batch.stage, feed_type)
    recommended_type = FeedingCalculator.FEED_TYPES.get(batch.stage)
    
    return {
        "batch_id": batch.id,
        "batch_code": batch.batch_code,
        "stage": batch.stage,
        "provided_feed_type": feed_type,
        "recommended_feed_type": recommended_type,
        "is_valid": is_valid,
        "message": "Feed type is appropriate" if is_valid else f"Recommended feed type for {batch.stage} stage is '{recommended_type}'"
    }


@router.get("/rates")
def get_feeding_rates(
    current_user: User = Depends(get_current_user)
):
    """
    Get feeding rates reference for all stages
    
    - Returns feeding rates for each lifecycle stage
    - Includes meals per day and feed types
    """
    stages_info = []
    
    for stage in ["eggs", "fry", "fingerlings", "juveniles", "young_fish", "fattening"]:
        rates = FeedingCalculator.FEEDING_RATES.get(stage, (0, 0))
        meals = FeedingCalculator.MEALS_PER_DAY.get(stage, 0)
        feed_type = FeedingCalculator.FEED_TYPES.get(stage)
        
        stages_info.append({
            "stage": stage,
            "feeding_rate_min": rates[0],
            "feeding_rate_max": rates[1],
            "meals_per_day": meals,
            "recommended_feed_type": feed_type
        })
    
    return {
        "stages": stages_info,
        "note": "Feeding rates are percentage of biomass per day"
    }
