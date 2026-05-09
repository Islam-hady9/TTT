"""
Transfer Manager Service
Manages inter-pond transfers with validation and history tracking
"""

from typing import Tuple, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.pond import Batch, Pond
from app.models.transfer import Transfer
from app.models.batch_history import BatchHistory

class TransferManager:
    """Manages inter-pond transfers"""
    
    @staticmethod
    def validate_transfer(
        batch: Batch,
        from_pond_id: int,
        to_pond_id: int,
        transfer_count: int,
        db: Session
    ) -> Tuple[bool, str]:
        """
        Validate transfer request
        
        Args:
            batch: Batch object to transfer
            from_pond_id: Source pond ID
            to_pond_id: Destination pond ID
            transfer_count: Number of fish to transfer
            db: Database session
            
        Returns:
            Tuple of (is_valid: bool, message: str)
        """
        # Validate batch exists
        if not batch:
            return False, "Batch not found"
        
        # Validate batch is active
        if batch.status != "active":
            return False, f"Batch status is '{batch.status}', cannot transfer"
        
        # Validate from_pond matches batch.pond_id
        if batch.pond_id != from_pond_id:
            return False, f"Batch is in pond {batch.pond_id}, not pond {from_pond_id}"
        
        # Validate transfer count
        if transfer_count <= 0:
            return False, "Transfer count must be positive"
        
        if transfer_count > batch.current_count:
            return False, f"Transfer count ({transfer_count}) exceeds current count ({batch.current_count})"
        
        # Validate from_pond and to_pond are different
        if from_pond_id == to_pond_id:
            return False, "Source and destination ponds must be different"
        
        # Validate to_pond exists
        to_pond = db.query(Pond).filter(Pond.id == to_pond_id).first()
        if not to_pond:
            return False, f"Destination pond {to_pond_id} not found"
        
        # Validate to_pond is active
        if to_pond.status != "active":
            return False, f"Destination pond status is '{to_pond.status}', cannot transfer"
        
        return True, "Transfer is valid"
    
    @staticmethod
    def execute_transfer(
        batch_id: int,
        from_pond_id: int,
        to_pond_id: int,
        transfer_count: int,
        transferred_by: str,
        notes: Optional[str],
        db: Session
    ) -> Tuple[bool, str, Optional[Transfer]]:
        """
        Execute transfer and update all related records
        
        Args:
            batch_id: Batch ID to transfer
            from_pond_id: Source pond ID
            to_pond_id: Destination pond ID
            transfer_count: Number of fish to transfer
            transferred_by: User performing transfer
            notes: Optional notes
            db: Database session
            
        Returns:
            Tuple of (success: bool, message: str, transfer: Transfer)
        """
        # Get batch
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        
        # Validate transfer
        is_valid, message = TransferManager.validate_transfer(
            batch, from_pond_id, to_pond_id, transfer_count, db
        )
        
        if not is_valid:
            return False, message, None
        
        try:
            # Create transfer record
            transfer = Transfer(
                batch_id=batch_id,
                from_pond_id=from_pond_id,
                to_pond_id=to_pond_id,
                transfer_count=transfer_count,
                avg_weight=batch.avg_weight,
                stage_at_transfer=batch.stage,
                transferred_by=transferred_by,
                notes=notes,
                transferred_at=datetime.now()
            )
            db.add(transfer)
            
            # Update batch
            batch.pond_id = to_pond_id
            batch.current_count = transfer_count
            
            # Recalculate biomass
            batch.biomass = batch.current_count * batch.avg_weight
            
            # Recalculate survival rate
            batch.survival_rate = (batch.current_count / batch.initial_count) * 100
            batch.mortality_rate = 100 - batch.survival_rate
            
            # Create batch history record
            history = BatchHistory(
                batch_id=batch_id,
                action_type="transfer",
                from_pond_id=from_pond_id,
                to_pond_id=to_pond_id,
                count=transfer_count,
                avg_weight=batch.avg_weight,
                biomass=batch.biomass,
                notes=notes,
                created_by=transferred_by,
                created_at=datetime.now()
            )
            db.add(history)
            
            # Commit all changes
            db.commit()
            db.refresh(transfer)
            db.refresh(batch)
            
            return True, f"Successfully transferred {transfer_count} fish from pond {from_pond_id} to pond {to_pond_id}", transfer
            
        except Exception as e:
            db.rollback()
            return False, f"Transfer failed: {str(e)}", None
    
    @staticmethod
    def check_transfer_readiness(batch: Batch, db: Session) -> Optional[str]:
        """
        Check if batch is ready for transfer to next unit
        
        Args:
            batch: Batch object to check
            db: Database session
            
        Returns:
            Message if ready for transfer, None otherwise
        """
        if not batch:
            return None
        
        # Check fingerlings ready for growout (weight >= 1.0g)
        if batch.stage == "fingerlings" and batch.avg_weight >= 1.0:
            return f"Batch {batch.batch_code} is ready for transfer from hatchery to growout unit (weight: {batch.avg_weight}g)"
        
        # Check young fish ready for fattening (weight >= 200g)
        if batch.stage == "young_fish" and batch.avg_weight >= 200.0:
            return f"Batch {batch.batch_code} is ready for transfer from growout to fattening unit (weight: {batch.avg_weight}g)"
        
        return None
