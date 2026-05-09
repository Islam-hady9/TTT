"""
History Tracker Service
Tracks complete batch history for audit trail
"""

from typing import List, Dict, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.batch_history import BatchHistory

class HistoryTracker:
    """Tracks complete batch history"""
    
    @staticmethod
    def record_event(
        batch_id: int,
        action_type: str,
        data: Dict,
        db: Session
    ) -> BatchHistory:
        """
        Record a lifecycle event
        
        Args:
            batch_id: Batch ID
            action_type: Type of action (created, transfer, sampling, mortality, feeding, water_quality, harvest)
            data: Dictionary with event data
            db: Database session
            
        Returns:
            Created BatchHistory record
        """
        history = BatchHistory(
            batch_id=batch_id,
            action_type=action_type,
            from_pond_id=data.get("from_pond_id"),
            to_pond_id=data.get("to_pond_id"),
            count=data.get("count"),
            avg_weight=data.get("avg_weight"),
            biomass=data.get("biomass"),
            notes=data.get("notes"),
            created_by=data.get("created_by"),
            created_at=data.get("created_at", datetime.now())
        )
        
        db.add(history)
        db.commit()
        db.refresh(history)
        
        return history
    
    @staticmethod
    def get_batch_history(
        batch_id: int,
        db: Session,
        action_type: Optional[str] = None,
        limit: Optional[int] = None
    ) -> List[BatchHistory]:
        """
        Get complete batch history ordered by date
        
        Args:
            batch_id: Batch ID
            db: Database session
            action_type: Optional filter by action type
            limit: Optional limit number of records
            
        Returns:
            List of BatchHistory records
        """
        query = db.query(BatchHistory).filter(BatchHistory.batch_id == batch_id)
        
        if action_type:
            query = query.filter(BatchHistory.action_type == action_type)
        
        query = query.order_by(BatchHistory.created_at.desc())
        
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    @staticmethod
    def record_batch_creation(
        batch_id: int,
        pond_id: int,
        initial_count: int,
        avg_weight: float,
        created_by: str,
        db: Session
    ) -> BatchHistory:
        """
        Record batch creation event
        
        Args:
            batch_id: Batch ID
            pond_id: Pond ID
            initial_count: Initial fish count
            avg_weight: Initial average weight
            created_by: User who created the batch
            db: Database session
            
        Returns:
            Created BatchHistory record
        """
        biomass = initial_count * avg_weight
        
        return HistoryTracker.record_event(
            batch_id=batch_id,
            action_type="created",
            data={
                "to_pond_id": pond_id,
                "count": initial_count,
                "avg_weight": avg_weight,
                "biomass": biomass,
                "notes": f"Batch created with {initial_count} fish at {avg_weight}g average weight",
                "created_by": created_by
            },
            db=db
        )
    
    @staticmethod
    def record_sampling(
        batch_id: int,
        sample_count: int,
        new_avg_weight: float,
        previous_avg_weight: float,
        sampled_by: str,
        notes: Optional[str],
        db: Session
    ) -> BatchHistory:
        """
        Record sampling event
        
        Args:
            batch_id: Batch ID
            sample_count: Number of fish sampled
            new_avg_weight: New average weight
            previous_avg_weight: Previous average weight
            sampled_by: User who performed sampling
            notes: Optional notes
            db: Database session
            
        Returns:
            Created BatchHistory record
        """
        weight_change = new_avg_weight - previous_avg_weight
        
        return HistoryTracker.record_event(
            batch_id=batch_id,
            action_type="sampling",
            data={
                "count": sample_count,
                "avg_weight": new_avg_weight,
                "notes": notes or f"Sampling: {sample_count} fish, avg weight {new_avg_weight}g (change: +{weight_change:.2f}g)",
                "created_by": sampled_by
            },
            db=db
        )
    
    @staticmethod
    def record_mortality(
        batch_id: int,
        mortality_count: int,
        remaining_count: int,
        avg_weight: float,
        recorded_by: str,
        cause: Optional[str],
        db: Session
    ) -> BatchHistory:
        """
        Record mortality event
        
        Args:
            batch_id: Batch ID
            mortality_count: Number of fish died
            remaining_count: Remaining fish count
            avg_weight: Current average weight
            recorded_by: User who recorded mortality
            cause: Optional cause of mortality
            db: Database session
            
        Returns:
            Created BatchHistory record
        """
        biomass = remaining_count * avg_weight
        notes = f"Mortality: {mortality_count} fish died"
        if cause:
            notes += f" (cause: {cause})"
        
        return HistoryTracker.record_event(
            batch_id=batch_id,
            action_type="mortality",
            data={
                "count": remaining_count,
                "avg_weight": avg_weight,
                "biomass": biomass,
                "notes": notes,
                "created_by": recorded_by
            },
            db=db
        )
    
    @staticmethod
    def record_feeding(
        batch_id: int,
        feed_amount: float,
        feed_type: str,
        fed_by: str,
        db: Session
    ) -> BatchHistory:
        """
        Record feeding event
        
        Args:
            batch_id: Batch ID
            feed_amount: Amount of feed in kg
            feed_type: Type of feed
            fed_by: User who performed feeding
            db: Database session
            
        Returns:
            Created BatchHistory record
        """
        return HistoryTracker.record_event(
            batch_id=batch_id,
            action_type="feeding",
            data={
                "notes": f"Fed {feed_amount}kg of {feed_type} feed",
                "created_by": fed_by
            },
            db=db
        )
    
    @staticmethod
    def record_harvest(
        batch_id: int,
        harvest_count: int,
        avg_weight: float,
        total_weight: float,
        harvested_by: str,
        notes: Optional[str],
        db: Session
    ) -> BatchHistory:
        """
        Record harvest event
        
        Args:
            batch_id: Batch ID
            harvest_count: Number of fish harvested
            avg_weight: Average weight at harvest
            total_weight: Total harvest weight
            harvested_by: User who performed harvest
            notes: Optional notes
            db: Database session
            
        Returns:
            Created BatchHistory record
        """
        return HistoryTracker.record_event(
            batch_id=batch_id,
            action_type="harvest",
            data={
                "count": harvest_count,
                "avg_weight": avg_weight,
                "biomass": total_weight * 1000,  # convert kg to grams
                "notes": notes or f"Harvested {harvest_count} fish, total weight {total_weight}kg",
                "created_by": harvested_by
            },
            db=db
        )
