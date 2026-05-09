from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PondBase(BaseModel):
    pond_code: str
    unit_type: str
    capacity: Optional[float] = None

class PondCreate(PondBase):
    pass

class PondUpdate(BaseModel):
    capacity: Optional[float] = None
    status: Optional[str] = None

class Pond(PondBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class BatchBase(BaseModel):
    batch_code: str
    pond_id: int
    stocking_date: datetime
    initial_count: int
    current_count: int
    avg_weight: float
    stage: str
    source: Optional[str] = None
    supplier: Optional[str] = None
    created_by: Optional[str] = None

class BatchCreate(BatchBase):
    pass

class BatchUpdate(BaseModel):
    current_count: Optional[int] = None
    avg_weight: Optional[float] = None
    status: Optional[str] = None

class Batch(BatchBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class UnitSummaryResponse(BaseModel):
    """Aggregate KPIs for one unit type (hatchery / growout / fattening)."""
    unit_type: str
    pond_count: int
    active_batch_count: int
    total_biomass_kg: float
    avg_weight_g: Optional[float] = None

    # Hatchery-specific
    total_eggs: Optional[int] = None
    avg_hatch_rate: Optional[float] = None  # 0..1

    # Grow-out / fattening biofloc maintenance
    avg_floc_level: Optional[float] = None
    molasses_consumption_kg_7d: Optional[float] = None

    # Fattening readiness
    harvest_ready_count: Optional[int] = None
