"""
Harvest Model
Tracks harvest operations and completed production cycles
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Harvest(Base):
    """Harvest record for completed batches"""
    __tablename__ = "harvests"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    pond_id = Column(Integer, ForeignKey("ponds.id"), nullable=False)
    
    # Harvest data
    harvest_count = Column(Integer, nullable=False)  # Number of fish harvested
    avg_weight = Column(Float, nullable=False)  # Average weight at harvest (grams)
    total_harvest_weight = Column(Float, nullable=False)  # Total weight (kg)
    
    # Quality metrics
    grade_a_count = Column(Integer, default=0)  # Premium quality (400-600g)
    grade_b_count = Column(Integer, default=0)  # Standard quality (350-400g)
    grade_c_count = Column(Integer, default=0)  # Below standard (<350g)
    
    # Production metrics (copied from batch at harvest time)
    cycle_duration = Column(Integer)  # Days from stocking to harvest
    final_fcr = Column(Float)  # Final Feed Conversion Ratio
    survival_rate = Column(Float)  # Final survival rate (%)
    total_feed_consumed = Column(Float)  # Total feed used (kg)
    
    # Financial data (optional)
    price_per_kg = Column(Float)  # Sale price per kg
    total_revenue = Column(Float)  # Total revenue
    buyer_name = Column(String)  # Buyer/customer name
    
    # Status
    status = Column(String, default="completed")  # completed, sold, delivered
    
    # Metadata
    harvested_by = Column(String, nullable=False)
    notes = Column(Text)
    harvest_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    batch = relationship("Batch", back_populates="harvest")
    pond = relationship("Pond")


# Add harvest relationship to Batch model
# This should be added to backend/app/models/pond.py in the Batch class:
# harvest = relationship("Harvest", back_populates="batch", uselist=False)
