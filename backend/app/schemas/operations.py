from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Water Quality
class WaterQualityBase(BaseModel):
    pond_id: int
    do: float
    ph: float
    temperature: float
    tan: Optional[float] = None
    alkalinity: Optional[float] = None
    floc: Optional[float] = None
    ammonia: Optional[float] = None
    measured_by: str
    notes: Optional[str] = None

class WaterQualityCreate(WaterQualityBase):
    pass

class WaterQualityBulkCreate(BaseModel):
    records: List[WaterQualityCreate]

class WaterQuality(WaterQualityBase):
    id: int
    measured_at: datetime
    
    class Config:
        from_attributes = True

# Feeding
class FeedingBase(BaseModel):
    pond_id: int
    feed_amount: float
    feed_type: str
    feeding_time: str
    duration: Optional[int] = None
    consumption: Optional[str] = None
    fed_by: str
    notes: Optional[str] = None

class FeedingCreate(FeedingBase):
    pass

class FeedingBulkCreate(BaseModel):
    records: List[FeedingCreate]

class Feeding(FeedingBase):
    id: int
    fed_at: datetime
    
    class Config:
        from_attributes = True

# Mortality
class MortalityBase(BaseModel):
    pond_id: int
    mortality_count: int
    mortality_rate: Optional[float] = None
    cause: str
    other_cause: Optional[str] = None
    recorded_by: str
    notes: Optional[str] = None

class MortalityCreate(MortalityBase):
    pass

class Mortality(MortalityBase):
    id: int
    recorded_at: datetime
    
    class Config:
        from_attributes = True

# Additives
class AdditiveBase(BaseModel):
    pond_id: int
    type: str
    amount: float
    reason: str
    added_by: str
    notes: Optional[str] = None

class AdditiveCreate(AdditiveBase):
    pass

class Additive(AdditiveBase):
    id: int
    added_at: datetime
    
    class Config:
        from_attributes = True

# Routine Tasks
class RoutineTaskBase(BaseModel):
    pond_id: int
    task_type: str
    status: str = "completed"
    performed_by: str
    value: Optional[float] = None
    unit: Optional[str] = None
    notes: Optional[str] = None

class RoutineTaskCreate(RoutineTaskBase):
    pass

class RoutineTaskBulkCreate(BaseModel):
    tasks: List[RoutineTaskCreate]

class RoutineTask(RoutineTaskBase):
    id: int
    performed_at: datetime

    class Config:
        from_attributes = True
