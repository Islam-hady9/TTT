from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Transfer(Base):
    __tablename__ = "transfers"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False, index=True)
    
    # Transfer data
    from_pond_id = Column(Integer, ForeignKey("ponds.id"), nullable=False)
    to_pond_id = Column(Integer, ForeignKey("ponds.id"), nullable=False)
    transfer_count = Column(Integer, nullable=False)
    avg_weight = Column(Float, nullable=False)  # grams at transfer
    stage_at_transfer = Column(String)
    
    # Metadata
    transferred_by = Column(String, nullable=False)
    notes = Column(Text)
    transferred_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    batch = relationship("Batch", back_populates="transfers")
    from_pond = relationship("Pond", foreign_keys=[from_pond_id])
    to_pond = relationship("Pond", foreign_keys=[to_pond_id])
