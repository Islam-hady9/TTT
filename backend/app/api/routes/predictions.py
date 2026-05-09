"""
Prediction Endpoints
Weight and harvest date prediction API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.pond import Batch
from app.schemas.prediction import (
    WeightPredictionRequest, WeightPredictionResponse,
    HarvestPredictionRequest, HarvestPredictionResponse,
    BatchPredictionsResponse
)
from app.services.calculators import WeightPredictor, HarvestPredictor

router = APIRouter()

# Initialize services
weight_predictor = WeightPredictor()
harvest_predictor = HarvestPredictor()


@router.post("/weight", response_model=WeightPredictionResponse)
def predict_weight(
    prediction_request: WeightPredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Predict future fish weight based on current SGR
    
    Formula: predicted_weight = current_weight × e^(SGR × days / 100)
    
    Requires:
    - Batch must have SGR data (from previous samplings)
    - SGR should be recent for accurate predictions
    
    Returns:
    - Predicted weight
    - Confidence level (high/medium/low based on data recency)
    """
    # Get batch
    batch = db.query(Batch).filter(Batch.id == prediction_request.batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch {prediction_request.batch_id} not found"
        )
    
    # Check if SGR data exists
    if not batch.sgr:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch {batch.batch_code} has no SGR data. Perform weight sampling first."
        )
    
    # Predict weight
    predicted_weight = weight_predictor.predict_weight(
        current_weight=batch.avg_weight,
        sgr=batch.sgr,
        days_ahead=prediction_request.days_ahead
    )
    
    if predicted_weight is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to calculate weight prediction"
        )
    
    # Get confidence level
    confidence = weight_predictor.get_prediction_confidence(batch, db)
    
    # Calculate prediction date
    prediction_date = (datetime.now() + timedelta(days=prediction_request.days_ahead)).date()
    
    return WeightPredictionResponse(
        batch_id=batch.id,
        batch_code=batch.batch_code,
        current_avg_weight=batch.avg_weight,
        predicted_weight=predicted_weight,
        days_ahead=prediction_request.days_ahead,
        sgr_used=batch.sgr,
        confidence_level=confidence,
        prediction_date=prediction_date
    )


@router.post("/harvest", response_model=HarvestPredictionResponse)
def predict_harvest(
    prediction_request: HarvestPredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Predict harvest date based on target weight and current SGR
    
    Formula: days = (ln(target_weight) - ln(current_weight)) / (SGR / 100)
    
    Requires:
    - Batch must have SGR data
    - Target weight must be > current weight
    
    Returns:
    - Days remaining until harvest
    - Predicted harvest date
    - Confidence level
    """
    # Get batch
    batch = db.query(Batch).filter(Batch.id == prediction_request.batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch {prediction_request.batch_id} not found"
        )
    
    # Check if SGR data exists
    if not batch.sgr:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch {batch.batch_code} has no SGR data. Perform weight sampling first."
        )
    
    # Get harvest prediction
    harvest_pred = harvest_predictor.get_harvest_prediction(
        batch=batch,
        target_weight=prediction_request.target_weight,
        db=db
    )
    
    if not harvest_pred:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to calculate harvest prediction"
        )
    
    # Check if already at target weight
    is_ready = batch.avg_weight >= prediction_request.target_weight
    
    return HarvestPredictionResponse(
        batch_id=harvest_pred["batch_id"],
        batch_code=harvest_pred["batch_code"],
        current_avg_weight=harvest_pred["current_avg_weight"],
        target_weight=harvest_pred["target_weight"],
        days_remaining=harvest_pred["days_remaining"],
        predicted_harvest_date=harvest_pred["predicted_harvest_date"],
        sgr_used=harvest_pred["sgr_used"],
        confidence_level=harvest_pred["confidence_level"],
        is_ready=is_ready
    )


@router.get("/batch/{batch_id}", response_model=BatchPredictionsResponse)
def get_batch_predictions(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all predictions for a batch
    
    Returns:
    - Weight predictions for 7, 14, and 30 days
    - Harvest prediction for default target weight (450g)
    - Confidence level
    """
    # Get batch
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch {batch_id} not found"
        )
    
    # Initialize response
    response = BatchPredictionsResponse(
        batch_id=batch.id,
        batch_code=batch.batch_code,
        stage=batch.stage,
        current_avg_weight=batch.avg_weight,
        sgr=batch.sgr,
        confidence_level="low",
        last_sampling_date=batch.last_sampling_date.date() if batch.last_sampling_date else None
    )
    
    # If no SGR data, return early
    if not batch.sgr:
        return response
    
    # Get confidence level
    confidence = weight_predictor.get_prediction_confidence(batch, db)
    response.confidence_level = confidence
    
    # Weight predictions
    response.weight_7_days = weight_predictor.predict_weight(batch.avg_weight, batch.sgr, 7)
    response.weight_14_days = weight_predictor.predict_weight(batch.avg_weight, batch.sgr, 14)
    response.weight_30_days = weight_predictor.predict_weight(batch.avg_weight, batch.sgr, 30)
    
    # Harvest prediction
    harvest_pred = harvest_predictor.get_harvest_prediction(batch, 450.0, db)
    if harvest_pred:
        is_ready = batch.avg_weight >= 450.0
        response.harvest_prediction = HarvestPredictionResponse(
            batch_id=harvest_pred["batch_id"],
            batch_code=harvest_pred["batch_code"],
            current_avg_weight=harvest_pred["current_avg_weight"],
            target_weight=harvest_pred["target_weight"],
            days_remaining=harvest_pred["days_remaining"],
            predicted_harvest_date=harvest_pred["predicted_harvest_date"],
            sgr_used=harvest_pred["sgr_used"],
            confidence_level=harvest_pred["confidence_level"],
            is_ready=is_ready
        )
    
    return response
