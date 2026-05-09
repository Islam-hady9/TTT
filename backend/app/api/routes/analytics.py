"""
Analytics API Routes
Endpoints for water quality correlation and batch comparison analytics
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.models.pond import Batch
from app.models.user import User
from app.services.water_quality_analyzer import WaterQualityAnalyzer
from pydantic import BaseModel


router = APIRouter()


# ==================== Water Quality Correlation ====================

@router.get("/water-quality/batch/{batch_id}")
def analyze_batch_water_quality(
    batch_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze water quality for a batch's pond
    
    - Returns water quality summary statistics
    - Shows optimal, warning, and critical days
    - Includes average parameter values
    """
    # Get batch
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch with id {batch_id} not found"
        )
    
    # Get water quality summary
    summary = WaterQualityAnalyzer.get_batch_water_quality_summary(batch, db, days)
    
    return summary


@router.get("/water-quality/correlation/{batch_id}")
def correlate_water_quality_with_growth(
    batch_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Correlate water quality with growth performance
    
    - Analyzes relationship between water quality and SGR/FCR
    - Provides impact assessment (high, moderate, low)
    - Includes actionable recommendations
    """
    # Get batch
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch with id {batch_id} not found"
        )
    
    # Get correlation analysis
    correlation = WaterQualityAnalyzer.correlate_with_growth(batch, db, days)
    
    return correlation


# ==================== Batch Comparison ====================

class BatchComparisonRequest(BaseModel):
    """Request schema for batch comparison"""
    batch_ids: List[int]
    include_water_quality: bool = False


@router.post("/compare/batches")
def compare_batches(
    request: BatchComparisonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compare performance across multiple batches
    
    - Compares FCR, SGR, survival rate, cycle duration
    - Highlights best and worst performers
    - Optionally includes water quality data
    """
    if len(request.batch_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 batches are required for comparison"
        )
    
    if len(request.batch_ids) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 batches can be compared at once"
        )
    
    # Get all batches
    batches = db.query(Batch).filter(Batch.id.in_(request.batch_ids)).all()
    
    if len(batches) != len(request.batch_ids):
        found_ids = [b.id for b in batches]
        missing_ids = [bid for bid in request.batch_ids if bid not in found_ids]
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batches not found: {missing_ids}"
        )
    
    # Prepare comparison data
    comparisons = []
    
    for batch in batches:
        # Calculate cycle duration
        if batch.stocking_date:
            if batch.status == "harvested" and hasattr(batch, 'harvest') and batch.harvest:
                cycle_duration = (batch.harvest.harvest_date - batch.stocking_date).days
            else:
                cycle_duration = (datetime.now().date() - batch.stocking_date).days
        else:
            cycle_duration = None
        
        # Calculate survival rate
        survival_rate = (batch.current_count / batch.initial_count * 100) if batch.initial_count > 0 else 0
        
        # Basic comparison data
        comparison = {
            "batch_id": batch.id,
            "batch_code": batch.batch_code,
            "pond_code": batch.pond.pond_code if batch.pond else None,
            "stage": batch.stage,
            "status": batch.status,
            "stocking_date": batch.stocking_date,
            "initial_count": batch.initial_count,
            "current_count": batch.current_count,
            "survival_rate": round(survival_rate, 2),
            "avg_weight": batch.avg_weight,
            "biomass": batch.biomass,
            "fcr": batch.fcr,
            "sgr": batch.sgr,
            "cycle_duration_days": cycle_duration,
            "total_feed_consumed": batch.total_feed_consumed
        }
        
        # Add water quality data if requested
        if request.include_water_quality:
            wq_summary = WaterQualityAnalyzer.get_batch_water_quality_summary(batch, db, 30)
            comparison["water_quality"] = {
                "optimal_percentage": wq_summary.get("optimal_percentage"),
                "averages": wq_summary.get("averages")
            }
        
        comparisons.append(comparison)
    
    # Calculate averages
    valid_fcrs = [c["fcr"] for c in comparisons if c["fcr"] is not None]
    valid_sgrs = [c["sgr"] for c in comparisons if c["sgr"] is not None]
    valid_survival = [c["survival_rate"] for c in comparisons]
    valid_durations = [c["cycle_duration_days"] for c in comparisons if c["cycle_duration_days"] is not None]
    
    averages = {
        "fcr": round(sum(valid_fcrs) / len(valid_fcrs), 2) if valid_fcrs else None,
        "sgr": round(sum(valid_sgrs) / len(valid_sgrs), 2) if valid_sgrs else None,
        "survival_rate": round(sum(valid_survival) / len(valid_survival), 2) if valid_survival else None,
        "cycle_duration": round(sum(valid_durations) / len(valid_durations), 0) if valid_durations else None
    }
    
    # Find best and worst performers
    best_fcr = min(comparisons, key=lambda x: x["fcr"] if x["fcr"] else float('inf'))
    worst_fcr = max(comparisons, key=lambda x: x["fcr"] if x["fcr"] else 0)
    best_sgr = max(comparisons, key=lambda x: x["sgr"] if x["sgr"] else 0)
    worst_sgr = min(comparisons, key=lambda x: x["sgr"] if x["sgr"] else float('inf'))
    best_survival = max(comparisons, key=lambda x: x["survival_rate"])
    worst_survival = min(comparisons, key=lambda x: x["survival_rate"])
    
    return {
        "total_batches": len(comparisons),
        "comparisons": comparisons,
        "averages": averages,
        "best_performers": {
            "fcr": {
                "batch_id": best_fcr["batch_id"],
                "batch_code": best_fcr["batch_code"],
                "value": best_fcr["fcr"]
            },
            "sgr": {
                "batch_id": best_sgr["batch_id"],
                "batch_code": best_sgr["batch_code"],
                "value": best_sgr["sgr"]
            },
            "survival_rate": {
                "batch_id": best_survival["batch_id"],
                "batch_code": best_survival["batch_code"],
                "value": best_survival["survival_rate"]
            }
        },
        "worst_performers": {
            "fcr": {
                "batch_id": worst_fcr["batch_id"],
                "batch_code": worst_fcr["batch_code"],
                "value": worst_fcr["fcr"]
            },
            "sgr": {
                "batch_id": worst_sgr["batch_id"],
                "batch_code": worst_sgr["batch_code"],
                "value": worst_sgr["sgr"]
            },
            "survival_rate": {
                "batch_id": worst_survival["batch_id"],
                "batch_code": worst_survival["batch_code"],
                "value": worst_survival["survival_rate"]
            }
        }
    }


@router.get("/compare/by-stage/{stage}")
def compare_batches_by_stage(
    stage: str,
    limit: int = Query(10, ge=2, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compare all batches in a specific lifecycle stage
    
    - Automatically selects batches in the specified stage
    - Returns comparison metrics
    - Useful for stage-specific performance analysis
    """
    # Get batches in the stage
    batches = db.query(Batch).filter(
        Batch.stage == stage
    ).order_by(Batch.stocking_date.desc()).limit(limit).all()
    
    if len(batches) < 2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Not enough batches found in stage '{stage}' for comparison"
        )
    
    # Use the batch comparison logic
    batch_ids = [b.id for b in batches]
    request = BatchComparisonRequest(batch_ids=batch_ids, include_water_quality=False)
    
    return compare_batches(request, db, current_user)


@router.get("/compare/by-date-range")
def compare_batches_by_date_range(
    start_date: datetime,
    end_date: datetime,
    limit: int = Query(10, ge=2, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compare batches stocked within a date range
    
    - Useful for seasonal or time-based performance analysis
    - Returns comparison metrics
    """
    # Get batches in the date range
    batches = db.query(Batch).filter(
        Batch.stocking_date.between(start_date.date(), end_date.date())
    ).order_by(Batch.stocking_date.desc()).limit(limit).all()
    
    if len(batches) < 2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Not enough batches found in date range for comparison"
        )
    
    # Use the batch comparison logic
    batch_ids = [b.id for b in batches]
    request = BatchComparisonRequest(batch_ids=batch_ids, include_water_quality=False)
    
    return compare_batches(request, db, current_user)
