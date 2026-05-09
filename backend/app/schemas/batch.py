"""
Batch Schemas
Enhanced schemas for batch management with lifecycle tracking
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date

# Batch History Schemas
class BatchHistoryResponse(BaseModel):
    id: int
    batch_id: int
    action_type: str
    from_pond_id: Optional[int] = None
    to_pond_id: Optional[int] = None
    count: Optional[int] = None
    avg_weight: Optional[float] = None
    biomass: Optional[float] = None
    notes: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Batch Schemas
class BatchCreate(BaseModel):
    batch_code: str = Field(..., description="Unique batch code")
    pond_id: int = Field(..., description="Pond ID where batch is stocked")
    stocking_date: datetime = Field(..., description="Date of stocking")
    initial_count: int = Field(..., gt=0, description="Initial fish count")
    avg_weight: float = Field(..., gt=0, description="Initial average weight in grams")
    stage: str = Field(..., description="Lifecycle stage")
    source: Optional[str] = Field(None, description="Source (internal/external)")
    supplier: Optional[str] = Field(None, description="Supplier name")
    created_by: str = Field(..., description="User creating the batch")

class BatchUpdate(BaseModel):
    current_count: Optional[int] = Field(None, gt=0)
    avg_weight: Optional[float] = Field(None, gt=0)
    stage: Optional[str] = None
    status: Optional[str] = None

class BatchResponse(BaseModel):
    id: int
    batch_code: str
    pond_id: int
    stocking_date: datetime
    initial_count: int
    current_count: int
    avg_weight: float
    stage: str
    status: str
    source: Optional[str] = None
    supplier: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
    
    # Calculated fields
    biomass: Optional[float] = None
    total_feed_consumed: Optional[float] = None
    fcr: Optional[float] = None
    sgr: Optional[float] = None
    mortality_rate: Optional[float] = None
    survival_rate: Optional[float] = None
    
    # Tracking fields
    previous_avg_weight: Optional[float] = None
    last_sampling_date: Optional[datetime] = None
    harvest_date: Optional[datetime] = None
    cycle_duration: Optional[int] = None
    
    class Config:
        from_attributes = True

class BatchDetailResponse(BatchResponse):
    """Extended batch response with related data"""
    history: List[BatchHistoryResponse] = []
    
    class Config:
        from_attributes = True

class BatchMetricsResponse(BaseModel):
    """Batch KPIs and metrics"""
    batch_id: int
    batch_code: str
    stage: str
    
    # Current status
    current_count: int
    avg_weight: float
    biomass_kg: float
    
    # Performance metrics
    fcr: Optional[float] = None
    fcr_classification: Optional[str] = None
    sgr: Optional[float] = None
    sgr_classification: Optional[str] = None
    mortality_rate: float
    survival_rate: float
    hatch_rate: Optional[float] = None  # ratio 0..1, populated only while stage in {eggs, fry}
    
    # Feeding
    daily_feed_recommended_kg: Optional[float] = None
    feed_type: Optional[str] = None
    meals_per_day: Optional[int] = None
    
    # Predictions
    days_to_harvest: Optional[int] = None
    predicted_harvest_date: Optional[date] = None
    predicted_harvest_weight: Optional[float] = None
    
    # Alerts
    active_alerts_count: int = 0
    critical_alerts_count: int = 0
