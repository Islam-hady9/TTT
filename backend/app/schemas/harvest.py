"""
Harvest Schemas
Pydantic models for harvest API requests and responses
"""
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional


class HarvestCreate(BaseModel):
    """Schema for creating a new harvest record"""
    batch_id: int = Field(..., description="ID of the batch being harvested")
    harvest_count: int = Field(..., gt=0, description="Number of fish harvested")
    avg_weight: float = Field(..., gt=0, description="Average weight at harvest (grams)")
    
    # Quality grading (optional)
    grade_a_count: Optional[int] = Field(0, ge=0, description="Premium quality count (400-600g)")
    grade_b_count: Optional[int] = Field(0, ge=0, description="Standard quality count (350-400g)")
    grade_c_count: Optional[int] = Field(0, ge=0, description="Below standard count (<350g)")
    
    # Financial data (optional)
    price_per_kg: Optional[float] = Field(None, ge=0, description="Sale price per kg")
    buyer_name: Optional[str] = Field(None, max_length=200, description="Buyer/customer name")
    
    # Metadata
    harvested_by: str = Field(..., max_length=100, description="Person who performed harvest")
    notes: Optional[str] = Field(None, description="Additional notes")
    harvest_date: datetime = Field(..., description="Date and time of harvest")
    
    @validator('avg_weight')
    def validate_harvest_weight(cls, v):
        """Validate that harvest weight is reasonable"""
        if v < 100:  # Less than 100g is too small for harvest
            raise ValueError('Average weight too low for harvest (minimum 100g)')
        if v > 1000:  # More than 1kg is unusually large
            raise ValueError('Average weight unusually high (maximum 1000g)')
        return v
    
    @validator('harvest_count')
    def validate_harvest_count(cls, v):
        """Validate harvest count is reasonable"""
        if v < 10:
            raise ValueError('Harvest count too low (minimum 10 fish)')
        return v


class HarvestUpdate(BaseModel):
    """Schema for updating harvest record"""
    status: Optional[str] = Field(None, description="Harvest status")
    price_per_kg: Optional[float] = Field(None, ge=0, description="Sale price per kg")
    buyer_name: Optional[str] = Field(None, max_length=200, description="Buyer name")
    notes: Optional[str] = Field(None, description="Additional notes")


class HarvestResponse(BaseModel):
    """Schema for harvest response"""
    id: int
    batch_id: int
    pond_id: int
    
    # Harvest data
    harvest_count: int
    avg_weight: float
    total_harvest_weight: float
    
    # Quality metrics
    grade_a_count: int
    grade_b_count: int
    grade_c_count: int
    
    # Production metrics
    cycle_duration: Optional[int]
    final_fcr: Optional[float]
    survival_rate: Optional[float]
    total_feed_consumed: Optional[float]
    
    # Financial data
    price_per_kg: Optional[float]
    total_revenue: Optional[float]
    buyer_name: Optional[str]
    
    # Status
    status: str
    
    # Metadata
    harvested_by: str
    notes: Optional[str]
    harvest_date: datetime
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class HarvestDetailResponse(HarvestResponse):
    """Detailed harvest response with related data"""
    batch_code: Optional[str] = None
    pond_code: Optional[str] = None
    unit_type: Optional[str] = None


class HarvestSummary(BaseModel):
    """Summary statistics for harvest operations"""
    total_harvests: int
    total_fish_harvested: int
    total_biomass_kg: float
    avg_weight_g: float
    avg_fcr: float
    avg_survival_rate: float
    total_revenue: float
    
    # Quality distribution
    grade_a_percentage: float
    grade_b_percentage: float
    grade_c_percentage: float


class HarvestReadyBatch(BaseModel):
    """Schema for batches ready for harvest"""
    id: int
    batch_code: str
    pond_id: int
    pond_code: Optional[str]
    unit_type: Optional[str]
    
    # Current status
    current_count: int
    avg_weight: float
    biomass: float
    stage: str
    
    # Performance metrics
    fcr: Optional[float]
    sgr: Optional[float]
    mortality_rate: float
    survival_rate: float
    
    # Timing
    stocking_date: datetime
    days_old: int
    
    # Harvest readiness
    harvest_status: str  # optimal, ready, not_ready
    harvest_readiness_score: float  # 0-100
    
    class Config:
        from_attributes = True


class HarvestPrediction(BaseModel):
    """Prediction for when batch will be ready for harvest"""
    batch_id: int
    batch_code: str
    current_avg_weight: float
    target_weight: float
    days_remaining: int
    predicted_harvest_date: datetime
    confidence_level: str  # high, medium, low
    sgr_used: float
