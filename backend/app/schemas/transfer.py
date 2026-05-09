"""
Transfer Schemas
Schemas for inter-pond transfer operations
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class TransferValidateRequest(BaseModel):
    batch_id: int = Field(..., description="Batch ID to transfer")
    from_pond_id: int = Field(..., description="Source pond ID")
    to_pond_id: int = Field(..., description="Destination pond ID")
    transfer_count: int = Field(..., gt=0, description="Number of fish to transfer")
    
    @validator('to_pond_id')
    def validate_different_ponds(cls, v, values):
        if 'from_pond_id' in values and v == values['from_pond_id']:
            raise ValueError('Source and destination ponds must be different')
        return v

class TransferCreate(TransferValidateRequest):
    transferred_by: str = Field(..., description="User performing transfer")
    notes: Optional[str] = Field(None, description="Optional notes")

class TransferResponse(BaseModel):
    id: int
    batch_id: int
    from_pond_id: int
    to_pond_id: int
    transfer_count: int
    avg_weight: float
    stage_at_transfer: Optional[str] = None
    transferred_by: str
    notes: Optional[str] = None
    transferred_at: datetime
    
    class Config:
        from_attributes = True

class TransferWithDetailsResponse(TransferResponse):
    """Transfer response with batch and pond details"""
    batch_code: str
    from_pond_code: str
    to_pond_code: str
    biomass_transferred_kg: float

class TransferValidationResponse(BaseModel):
    """Response for transfer validation"""
    is_valid: bool
    message: str
    batch_code: Optional[str] = None
    current_count: Optional[int] = None
    from_pond_code: Optional[str] = None
    to_pond_code: Optional[str] = None
