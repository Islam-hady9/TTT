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
