from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class BatchHistory(Base):
    __tablename__ = "batch_history"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False, index=True)
    action_type = Column(String, nullable=False, index=True)  # created, transfer, sampling, mortality, feeding, water_quality, harvest
    
    # Transfer fields
    from_pond_id = Column(Integer, ForeignKey("ponds.id"))
    to_pond_id = Column(Integer, ForeignKey("ponds.id"))
    
    # Common fields
    count = Column(Integer)  # fish count for the event
    avg_weight = Column(Float)  # grams
    biomass = Column(Float)  # grams
    
    # Metadata
    notes = Column(Text)
    created_by = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    batch = relationship("Batch", back_populates="history")
    from_pond = relationship("Pond", foreign_keys=[from_pond_id])
    to_pond = relationship("Pond", foreign_keys=[to_pond_id])
