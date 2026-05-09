from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Pond(Base):
    __tablename__ = "ponds"
    
    id = Column(Integer, primary_key=True, index=True)
    pond_code = Column(String, unique=True, index=True, nullable=False)
    unit_type = Column(String, nullable=False)  # hatchery, growout, fattening
    capacity = Column(Float)  # m³
    status = Column(String, default="active")  # active, inactive, maintenance
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    batches = relationship("Batch", back_populates="pond")
    water_quality_records = relationship("WaterQuality", back_populates="pond")
    feeding_records = relationship("Feeding", back_populates="pond")
    mortality_records = relationship("Mortality", back_populates="pond")

class Batch(Base):
    __tablename__ = "batches"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_code = Column(String, unique=True, index=True, nullable=False)
    pond_id = Column(Integer, ForeignKey("ponds.id"))
    stocking_date = Column(DateTime(timezone=True), nullable=False)
    initial_count = Column(Integer, nullable=False)
    current_count = Column(Integer, nullable=False)
    avg_weight = Column(Float, nullable=False)  # grams
    stage = Column(String, nullable=False)  # eggs, fry, fingerlings, juveniles, young_fish, fattening
    source = Column(String)  # internal, external
    supplier = Column(String)
    status = Column(String, default="active")  # active, transferred, harvested
    created_by = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # NEW: Calculated fields
    biomass = Column(Float)  # grams (current_count * avg_weight)
    total_feed_consumed = Column(Float, default=0.0)  # kg
    fcr = Column(Float)  # Feed Conversion Ratio
    sgr = Column(Float)  # Specific Growth Rate (%)
    mortality_rate = Column(Float, default=0.0)  # percentage
    survival_rate = Column(Float, default=100.0)  # percentage
    
    # NEW: Tracking fields
    previous_avg_weight = Column(Float)  # for SGR calculation
    last_sampling_date = Column(DateTime(timezone=True))
    harvest_date = Column(DateTime(timezone=True))
    cycle_duration = Column(Integer)  # days
    
    # Relationships
    pond = relationship("Pond", back_populates="batches")
    history = relationship("BatchHistory", back_populates="batch", cascade="all, delete-orphan")
    samplings = relationship("Sampling", back_populates="batch", cascade="all, delete-orphan")
    transfers = relationship("Transfer", back_populates="batch", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="batch", cascade="all, delete-orphan")
    harvest = relationship("Harvest", back_populates="batch", uselist=False, cascade="all, delete-orphan")
