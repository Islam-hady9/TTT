"""
Alert Endpoints
Automatic alert notification management API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.alert import Alert
from app.models.pond import Batch, Pond
from app.schemas.alert import (
    AlertResponse, AlertWithDetailsResponse,
    AlertMarkReadRequest, AlertResolveRequest,
    AlertSummaryResponse
)

router = APIRouter()


@router.get("", response_model=List[AlertWithDetailsResponse])
def get_alerts(
    skip: int = 0,
    limit: int = 100,
    severity: Optional[str] = None,
    alert_type: Optional[str] = None,
    is_read: Optional[bool] = None,
    is_resolved: Optional[bool] = None,
    batch_id: Optional[int] = None,
    pond_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all alerts with optional filters
    
    Filters:
    - severity: info, warning, critical
    - alert_type: fcr_high, sgr_low, mortality_high, transfer_ready, harvest_ready, water_quality
    - is_read: true/false
    - is_resolved: true/false
    - batch_id: specific batch
    - pond_id: specific pond
    """
    query = db.query(Alert)
    
    if severity:
        query = query.filter(Alert.severity == severity)
    
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    
    if is_read is not None:
        query = query.filter(Alert.is_read == is_read)
    
    if is_resolved is not None:
        query = query.filter(Alert.is_resolved == is_resolved)
    
    if batch_id:
        query = query.filter(Alert.batch_id == batch_id)
    
    if pond_id:
        query = query.filter(Alert.pond_id == pond_id)
    
    alerts = query.order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()
    
    # Enrich with batch and pond details
    enriched_alerts = []
    for alert in alerts:
        batch_code = None
        pond_code = None
        batch_stage = None
        
        if alert.batch_id:
            batch = db.query(Batch).filter(Batch.id == alert.batch_id).first()
            if batch:
                batch_code = batch.batch_code
                batch_stage = batch.stage
        
        if alert.pond_id:
            pond = db.query(Pond).filter(Pond.id == alert.pond_id).first()
            if pond:
                pond_code = pond.pond_code
        
        enriched_alert = AlertWithDetailsResponse(
            **alert.__dict__,
            batch_code=batch_code,
            pond_code=pond_code,
            batch_stage=batch_stage
        )
        enriched_alerts.append(enriched_alert)
    
    return enriched_alerts


@router.get("/unread", response_model=List[AlertWithDetailsResponse])
def get_unread_alerts(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all unread alerts"""
    alerts = db.query(Alert).filter(
        Alert.is_read == False
    ).order_by(
        Alert.created_at.desc()
    ).limit(limit).all()
    
    # Enrich with batch and pond details
    enriched_alerts = []
    for alert in alerts:
        batch_code = None
        pond_code = None
        batch_stage = None
        
        if alert.batch_id:
            batch = db.query(Batch).filter(Batch.id == alert.batch_id).first()
            if batch:
                batch_code = batch.batch_code
                batch_stage = batch.stage
        
        if alert.pond_id:
            pond = db.query(Pond).filter(Pond.id == alert.pond_id).first()
            if pond:
                pond_code = pond.pond_code
        
        enriched_alert = AlertWithDetailsResponse(
            **alert.__dict__,
            batch_code=batch_code,
            pond_code=pond_code,
            batch_stage=batch_stage
        )
        enriched_alerts.append(enriched_alert)
    
    return enriched_alerts


@router.get("/summary", response_model=AlertSummaryResponse)
def get_alert_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get alert summary statistics
    
    Returns counts by:
    - Total, unread, unresolved
    - Severity (critical, warning, info)
    - Type (fcr, sgr, mortality, transfer, harvest, water_quality)
    """
    # Total alerts
    total_alerts = db.query(func.count(Alert.id)).scalar()
    
    # Unread alerts
    unread_alerts = db.query(func.count(Alert.id)).filter(Alert.is_read == False).scalar()
    
    # Unresolved alerts
    unresolved_alerts = db.query(func.count(Alert.id)).filter(Alert.is_resolved == False).scalar()
    
    # By severity
    critical_alerts = db.query(func.count(Alert.id)).filter(Alert.severity == "critical").scalar()
    warning_alerts = db.query(func.count(Alert.id)).filter(Alert.severity == "warning").scalar()
    info_alerts = db.query(func.count(Alert.id)).filter(Alert.severity == "info").scalar()
    
    # By type
    fcr_alerts = db.query(func.count(Alert.id)).filter(Alert.alert_type == "fcr_high").scalar()
    sgr_alerts = db.query(func.count(Alert.id)).filter(Alert.alert_type == "sgr_low").scalar()
    mortality_alerts = db.query(func.count(Alert.id)).filter(Alert.alert_type == "mortality_high").scalar()
    transfer_alerts = db.query(func.count(Alert.id)).filter(Alert.alert_type == "transfer_ready").scalar()
    harvest_alerts = db.query(func.count(Alert.id)).filter(Alert.alert_type == "harvest_ready").scalar()
    water_quality_alerts = db.query(func.count(Alert.id)).filter(Alert.alert_type == "water_quality").scalar()
    
    return AlertSummaryResponse(
        total_alerts=total_alerts,
        unread_alerts=unread_alerts,
        critical_alerts=critical_alerts,
        warning_alerts=warning_alerts,
        info_alerts=info_alerts,
        unresolved_alerts=unresolved_alerts,
        fcr_alerts=fcr_alerts,
        sgr_alerts=sgr_alerts,
        mortality_alerts=mortality_alerts,
        transfer_alerts=transfer_alerts,
        harvest_alerts=harvest_alerts,
        water_quality_alerts=water_quality_alerts
    )


@router.get("/batch/{batch_id}", response_model=List[AlertResponse])
def get_batch_alerts(
    batch_id: int,
    is_resolved: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all alerts for a specific batch"""
    # Validate batch exists
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch {batch_id} not found"
        )
    
    query = db.query(Alert).filter(Alert.batch_id == batch_id)
    
    if is_resolved is not None:
        query = query.filter(Alert.is_resolved == is_resolved)
    
    alerts = query.order_by(Alert.created_at.desc()).all()
    
    return alerts


@router.patch("/{alert_id}/read", response_model=AlertResponse)
def mark_alert_read(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark an alert as read"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found"
        )
    
    alert.is_read = True
    db.commit()
    db.refresh(alert)
    
    return alert


@router.post("/mark-read", response_model=dict)
def mark_multiple_alerts_read(
    request: AlertMarkReadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark multiple alerts as read"""
    updated_count = db.query(Alert).filter(
        Alert.id.in_(request.alert_ids)
    ).update(
        {"is_read": True},
        synchronize_session=False
    )
    
    db.commit()
    
    return {
        "message": f"Marked {updated_count} alerts as read",
        "updated_count": updated_count
    }


@router.patch("/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(
    alert_id: int,
    resolve_request: AlertResolveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Resolve an alert
    
    Marks alert as resolved and records who resolved it and when
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found"
        )
    
    alert.is_resolved = True
    alert.is_read = True  # Also mark as read
    alert.resolved_by = resolve_request.resolved_by
    alert.resolved_at = datetime.now()
    
    db.commit()
    db.refresh(alert)
    
    return alert
