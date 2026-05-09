from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Mortality(Base):
    __tablename__ = "mortality"
    
    id = Column(Integer, primary_key=True, index=True)
    pond_id = Column(Integer, ForeignKey("ponds.id"), nullable=False)
    
    # Mortality data
    mortality_count = Column(Integer, nullable=False)
    mortality_rate = Column(Float)  # percentage
    cause = Column(String, nullable=False)
    other_cause = Column(String)
    
    # Metadata
    recorded_by = Column(String, nullable=False)
    notes = Column(Text)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    pond = relationship("Pond", back_populates="mortality_records")

class Additive(Base):
    __tablename__ = "additives"
    
    id = Column(Integer, primary_key=True, index=True)
    pond_id = Column(Integer, ForeignKey("ponds.id"), nullable=False)
    
    # Additive data
    type = Column(String, nullable=False)  # molasses, probiotics, calcium_carbonate, medicine, disinfectant
    amount = Column(Float, nullable=False)
    reason = Column(String, nullable=False)
    
    # Metadata
    added_by = Column(String, nullable=False)
    notes = Column(Text)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

class RoutineTask(Base):
    __tablename__ = "routine_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    pond_id = Column(Integer, ForeignKey("ponds.id"), nullable=False)
    
    # Task data
    task_type = Column(String, nullable=False)  # waste_removal, diffuser_cleaning, water_change, sorting
    status = Column(String, default="completed")
    performed_by = Column(String, nullable=False)
    
    # Optional values (e.g. amount of water changed, or number of diffusers)
    value = Column(Float)
    unit = Column(String)
    
    # Metadata
    notes = Column(Text)
    performed_at = Column(DateTime(timezone=True), server_default=func.now())
