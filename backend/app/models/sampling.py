from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Sampling(Base):
    __tablename__ = "samplings"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False, index=True)
    
    # Sampling data
    sample_count = Column(Integer, nullable=False)  # number of fish sampled (minimum 30)
    total_sample_weight = Column(Float, nullable=False)  # grams
    calculated_avg_weight = Column(Float, nullable=False)  # grams
    previous_avg_weight = Column(Float)  # grams
    
    # Calculated metrics
    sgr = Column(Float)  # Specific Growth Rate (%)
    days_since_last = Column(Integer)  # days since last sampling
    
    # Metadata
    sampled_by = Column(String, nullable=False)
    notes = Column(Text)
    sampled_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    batch = relationship("Batch", back_populates="samplings")
