"""
Sampling Schemas
Schemas for weight sampling operations
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class SamplingCreate(BaseModel):
    batch_id: int = Field(..., description="Batch ID to sample")
    sample_count: int = Field(..., ge=30, description="Number of fish sampled (minimum 30)")
    total_sample_weight: float = Field(..., gt=0, description="Total weight of sample in grams")
    sampled_by: str = Field(..., description="User performing sampling")
    notes: Optional[str] = Field(None, description="Optional notes")
    
    @validator('sample_count')
    def validate_sample_count(cls, v):
        if v < 30:
            raise ValueError('Sample count must be at least 30 fish for statistical accuracy')
        return v

class SamplingResponse(BaseModel):
    id: int
    batch_id: int
    sample_count: int
    total_sample_weight: float
    calculated_avg_weight: float
    previous_avg_weight: Optional[float] = None
    sgr: Optional[float] = None
    days_since_last: Optional[int] = None
    sampled_by: str
    notes: Optional[str] = None
    sampled_at: datetime
    
    class Config:
        from_attributes = True

class SamplingWithBatchResponse(SamplingResponse):
    """Sampling response with batch information"""
    batch_code: str
    batch_stage: str
    batch_current_count: int
