"""
Prediction Schemas
Schemas for weight and harvest date predictions
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class WeightPredictionRequest(BaseModel):
    batch_id: int = Field(..., description="Batch ID to predict")
    days_ahead: int = Field(..., ge=1, le=365, description="Number of days to predict ahead")

class WeightPredictionResponse(BaseModel):
    batch_id: int
    batch_code: str
    current_avg_weight: float
    predicted_weight: float
    days_ahead: int
    sgr_used: float
    confidence_level: str  # high, medium, low
    prediction_date: date
    
    class Config:
        from_attributes = True

class HarvestPredictionRequest(BaseModel):
    batch_id: int = Field(..., description="Batch ID to predict")
    target_weight: float = Field(450.0, ge=300, le=800, description="Target harvest weight in grams")

class HarvestPredictionResponse(BaseModel):
    batch_id: int
    batch_code: str
    current_avg_weight: float
    target_weight: float
    days_remaining: int
    predicted_harvest_date: date
    sgr_used: float
    confidence_level: str  # high, medium, low
    is_ready: bool  # True if already at target weight
    
    class Config:
        from_attributes = True

class BatchPredictionsResponse(BaseModel):
    """Combined predictions for a batch"""
    batch_id: int
    batch_code: str
    stage: str
    current_avg_weight: float
    sgr: Optional[float] = None
    
    # Weight predictions
    weight_7_days: Optional[float] = None
    weight_14_days: Optional[float] = None
    weight_30_days: Optional[float] = None
    
    # Harvest predictions
    harvest_prediction: Optional[HarvestPredictionResponse] = None
    
    # Confidence
    confidence_level: str
    last_sampling_date: Optional[date] = None
