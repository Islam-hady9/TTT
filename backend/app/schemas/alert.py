"""
Alert Schemas
Schemas for automatic alert notifications
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AlertResponse(BaseModel):
    id: int
    batch_id: Optional[int] = None
    pond_id: Optional[int] = None
    alert_type: str
    severity: str  # info, warning, critical
    message: str
    is_read: bool
    is_resolved: bool
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AlertWithDetailsResponse(AlertResponse):
    """Alert response with batch and pond details"""
    batch_code: Optional[str] = None
    pond_code: Optional[str] = None
    batch_stage: Optional[str] = None

class AlertMarkReadRequest(BaseModel):
    alert_ids: list[int] = Field(..., description="List of alert IDs to mark as read")

class AlertResolveRequest(BaseModel):
    alert_id: int = Field(..., description="Alert ID to resolve")
    resolved_by: str = Field(..., description="User resolving the alert")
    notes: Optional[str] = Field(None, description="Resolution notes")

class AlertSummaryResponse(BaseModel):
    """Summary of alerts"""
    total_alerts: int
    unread_alerts: int
    critical_alerts: int
    warning_alerts: int
    info_alerts: int
    unresolved_alerts: int
    
    # By type
    fcr_alerts: int = 0
    sgr_alerts: int = 0
    mortality_alerts: int = 0
    transfer_alerts: int = 0
    harvest_alerts: int = 0
    water_quality_alerts: int = 0
