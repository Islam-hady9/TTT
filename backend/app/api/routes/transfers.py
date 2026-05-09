"""
Transfer Endpoints
Inter-pond transfer management API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.pond import Batch, Pond
from app.models.transfer import Transfer
from app.schemas.transfer import (
    TransferCreate, TransferResponse, TransferWithDetailsResponse,
    TransferValidateRequest, TransferValidationResponse
)
from app.services.transfer_manager import TransferManager

router = APIRouter()

# Initialize service
transfer_manager = TransferManager()


@router.post("/validate", response_model=TransferValidationResponse)
def validate_transfer(
    transfer_request: TransferValidateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Validate a transfer request without executing it
    
    Checks:
    - Batch exists and is active
    - Batch is in the from_pond
    - Transfer count <= current count
    - from_pond != to_pond
    - to_pond exists and is active
    """
    batch = db.query(Batch).filter(Batch.id == transfer_request.batch_id).first()
    
    is_valid, message = transfer_manager.validate_transfer(
        batch=batch,
        from_pond_id=transfer_request.from_pond_id,
        to_pond_id=transfer_request.to_pond_id,
        transfer_count=transfer_request.transfer_count,
        db=db
    )
    
    # Get pond codes for response
    from_pond = db.query(Pond).filter(Pond.id == transfer_request.from_pond_id).first()
    to_pond = db.query(Pond).filter(Pond.id == transfer_request.to_pond_id).first()
    
    return TransferValidationResponse(
        is_valid=is_valid,
        message=message,
        batch_code=batch.batch_code if batch else None,
        current_count=batch.current_count if batch else None,
        from_pond_code=from_pond.pond_code if from_pond else None,
        to_pond_code=to_pond.pond_code if to_pond else None
    )


@router.post("", response_model=TransferResponse, status_code=status.HTTP_201_CREATED)
def create_transfer(
    transfer_data: TransferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Execute an inter-pond transfer
    
    Process:
    1. Validates transfer request
    2. Creates transfer record
    3. Updates batch.pond_id to destination pond
    4. Updates batch.current_count
    5. Recalculates biomass, survival rate, mortality rate
    6. Records in batch history
    7. Commits all changes atomically
    
    Note: This is a full transfer - all fish move to new pond
    """
    success, message, transfer = transfer_manager.execute_transfer(
        batch_id=transfer_data.batch_id,
        from_pond_id=transfer_data.from_pond_id,
        to_pond_id=transfer_data.to_pond_id,
        transfer_count=transfer_data.transfer_count,
        transferred_by=transfer_data.transferred_by,
        notes=transfer_data.notes,
        db=db
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    return transfer


@router.get("/batch/{batch_id}", response_model=List[TransferResponse])
def get_batch_transfers(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all transfers for a batch
    
    Returns transfers ordered by date (newest first)
    """
    # Validate batch exists
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch {batch_id} not found"
        )
    
    transfers = db.query(Transfer).filter(
        Transfer.batch_id == batch_id
    ).order_by(
        Transfer.transferred_at.desc()
    ).all()
    
    return transfers


@router.get("/{transfer_id}", response_model=TransferWithDetailsResponse)
def get_transfer(
    transfer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get transfer details with batch and pond information"""
    transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()
    
    if not transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transfer {transfer_id} not found"
        )
    
    # Get related data
    batch = db.query(Batch).filter(Batch.id == transfer.batch_id).first()
    from_pond = db.query(Pond).filter(Pond.id == transfer.from_pond_id).first()
    to_pond = db.query(Pond).filter(Pond.id == transfer.to_pond_id).first()
    
    # Calculate biomass transferred
    biomass_kg = (transfer.transfer_count * transfer.avg_weight) / 1000
    
    # Create response with details
    response = TransferWithDetailsResponse(
        **transfer.__dict__,
        batch_code=batch.batch_code,
        from_pond_code=from_pond.pond_code,
        to_pond_code=to_pond.pond_code,
        biomass_transferred_kg=biomass_kg
    )
    
    return response
