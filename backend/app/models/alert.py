from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), index=True)
    pond_id = Column(Integer, ForeignKey("ponds.id"), index=True)
    
    # Alert data
    alert_type = Column(String, nullable=False, index=True)  # fcr_high, sgr_low, mortality_high, transfer_ready, harvest_ready, water_quality
    severity = Column(String, nullable=False, index=True)  # info, warning, critical
    message = Column(Text, nullable=False)
    
    # Status
    is_read = Column(Boolean, default=False, index=True)
    is_resolved = Column(Boolean, default=False, index=True)
    resolved_by = Column(String)
    resolved_at = Column(DateTime(timezone=True))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    batch = relationship("Batch", back_populates="alerts")
    pond = relationship("Pond")
