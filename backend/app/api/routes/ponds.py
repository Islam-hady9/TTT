from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.pond import Pond, Batch
from app.schemas.pond import PondCreate, Pond as PondSchema, BatchCreate, Batch as BatchSchema
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[PondSchema])
def get_ponds(
    skip: int = 0,
    limit: int = 100,
    unit_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all ponds"""
    query = db.query(Pond)
    if unit_type:
        query = query.filter(Pond.unit_type == unit_type)
    ponds = query.offset(skip).limit(limit).all()
    return ponds

@router.post("/", response_model=PondSchema, status_code=status.HTTP_201_CREATED)
def create_pond(
    pond: PondCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new pond"""
    # Check if pond code exists
    if db.query(Pond).filter(Pond.pond_code == pond.pond_code).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pond code already exists"
        )
    
    db_pond = Pond(**pond.dict())
    db.add(db_pond)
    db.commit()
    db.refresh(db_pond)
    return db_pond

@router.get("/{pond_id}", response_model=PondSchema)
def get_pond(
    pond_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get pond by ID"""
    pond = db.query(Pond).filter(Pond.id == pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail="Pond not found")
    return pond

@router.get("/{pond_id}/batches", response_model=List[BatchSchema])
def get_pond_batches(
    pond_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all batches for a pond"""
    batches = db.query(Batch).filter(Batch.pond_id == pond_id).all()
    return batches

@router.post("/batches", response_model=BatchSchema, status_code=status.HTTP_201_CREATED)
def create_batch(
    batch: BatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new batch"""
    # Check if batch code exists
    if db.query(Batch).filter(Batch.batch_code == batch.batch_code).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch code already exists"
        )
    
    # Check if pond exists
    pond = db.query(Pond).filter(Pond.id == batch.pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail="Pond not found")
    
    db_batch = Batch(**batch.dict())
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch
