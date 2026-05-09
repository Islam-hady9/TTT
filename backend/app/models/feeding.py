from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Time
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Feeding(Base):
    __tablename__ = "feeding"
    
    id = Column(Integer, primary_key=True, index=True)
    pond_id = Column(Integer, ForeignKey("ponds.id"), nullable=False)
    
    # Feeding data
    feed_amount = Column(Float, nullable=False)  # kg
    feed_type = Column(String, nullable=False)  # starter, grower, finisher, fattening
    feeding_time = Column(String, nullable=False)  # HH:MM format
    duration = Column(Integer)  # minutes
    consumption = Column(String)  # full, partial, poor
    
    # Metadata
    fed_by = Column(String, nullable=False)
    notes = Column(Text)
    fed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    pond = relationship("Pond", back_populates="feeding_records")
