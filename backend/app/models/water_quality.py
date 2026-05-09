from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class WaterQuality(Base):
    __tablename__ = "water_quality"
    
    id = Column(Integer, primary_key=True, index=True)
    pond_id = Column(Integer, ForeignKey("ponds.id"), nullable=False)
    
    # Parameters
    do = Column(Float, nullable=False)  # Dissolved Oxygen (mg/L)
    ph = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)  # °C
    tan = Column(Float)  # Total Ammonia Nitrogen (mg/L)
    alkalinity = Column(Float)  # Total Alkalinity (mg/L)
    floc = Column(Float)  # Floc Level
    ammonia = Column(Float)  # NH3 (mg/L)
    
    # Metadata
    measured_by = Column(String, nullable=False)
    notes = Column(Text)
    measured_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    pond = relationship("Pond", back_populates="water_quality_records")
