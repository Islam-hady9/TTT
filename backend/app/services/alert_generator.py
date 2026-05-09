"""
Alert Generator Service
Generates automatic alerts based on thresholds and conditions
"""

from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.pond import Batch
from app.models.water_quality import WaterQuality
from app.models.alert import Alert

class AlertGenerator:
    """Generates automatic alerts"""
    
    # Alert thresholds
    THRESHOLDS = {
        "fcr_warning": 1.8,
        "fcr_critical": 2.0,
        "sgr_warning": 5.0,
        "sgr_critical": 3.0,
        "mortality_hatchery": 35.0,
        "mortality_growout": 10.0,
        "mortality_fattening": 10.0,
        "transfer_fingerlings": 1.0,
        "transfer_young_fish": 200.0,
        "harvest_min_weight": 350.0,
        "harvest_optimal_min": 400.0,
        "harvest_optimal_max": 600.0,
        # Water quality thresholds
        "do_min": 5.0,
        "do_max": 8.0,
        "ph_min": 6.5,
        "ph_max": 8.5,
        "temp_min": 26.0,
        "temp_max": 30.0,
        "tan_max": 1.0,
        "alkalinity_min": 100.0,
        "nh3_max": 0.02
    }
    
    @staticmethod
    def check_fcr_alert(batch: Batch, db: Session) -> Optional[Alert]:
        """
        Check if FCR exceeds threshold
        
        Args:
            batch: Batch object to check
            db: Database session
            
        Returns:
            Alert object if threshold exceeded, None otherwise
        """
        if not batch or not batch.fcr:
            return None
        
        # Check if alert already exists and is unresolved
        existing_alert = db.query(Alert).filter(
            Alert.batch_id == batch.id,
            Alert.alert_type == "fcr_high",
            Alert.is_resolved == False
        ).first()
        
        if existing_alert:
            return None  # Alert already exists
        
        severity = None
        message = None
        
        if batch.fcr >= AlertGenerator.THRESHOLDS["fcr_critical"]:
            severity = "critical"
            message = f"FCR critical: {batch.fcr} (threshold: {AlertGenerator.THRESHOLDS['fcr_critical']}). Immediate action required!"
        elif batch.fcr >= AlertGenerator.THRESHOLDS["fcr_warning"]:
            severity = "warning"
            message = f"FCR high: {batch.fcr} (threshold: {AlertGenerator.THRESHOLDS['fcr_warning']}). Review feeding strategy."
        
        if severity:
            alert = Alert(
                batch_id=batch.id,
                pond_id=batch.pond_id,
                alert_type="fcr_high",
                severity=severity,
                message=message,
                created_at=datetime.now()
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            return alert
        
        return None
    
    @staticmethod
    def check_sgr_alert(batch: Batch, db: Session) -> Optional[Alert]:
        """
        Check if SGR is below threshold
        
        Args:
            batch: Batch object to check
            db: Database session
            
        Returns:
            Alert object if threshold not met, None otherwise
        """
        if not batch or not batch.sgr:
            return None
        
        # Check if alert already exists and is unresolved
        existing_alert = db.query(Alert).filter(
            Alert.batch_id == batch.id,
            Alert.alert_type == "sgr_low",
            Alert.is_resolved == False
        ).first()
        
        if existing_alert:
            return None
        
        severity = None
        message = None
        
        if batch.sgr < AlertGenerator.THRESHOLDS["sgr_critical"]:
            severity = "critical"
            message = f"SGR critically low: {batch.sgr}% (threshold: {AlertGenerator.THRESHOLDS['sgr_critical']}%). Check water quality and feeding!"
        elif batch.sgr < AlertGenerator.THRESHOLDS["sgr_warning"]:
            severity = "warning"
            message = f"SGR low: {batch.sgr}% (threshold: {AlertGenerator.THRESHOLDS['sgr_warning']}%). Monitor growth closely."
        
        if severity:
            alert = Alert(
                batch_id=batch.id,
                pond_id=batch.pond_id,
                alert_type="sgr_low",
                severity=severity,
                message=message,
                created_at=datetime.now()
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            return alert
        
        return None
    
    @staticmethod
    def check_mortality_alert(batch: Batch, db: Session) -> Optional[Alert]:
        """
        Check if mortality rate exceeds stage-specific threshold
        
        Args:
            batch: Batch object to check
            db: Database session
            
        Returns:
            Alert object if threshold exceeded, None otherwise
        """
        if not batch or batch.mortality_rate is None:
            return None
        
        # Check if alert already exists and is unresolved
        existing_alert = db.query(Alert).filter(
            Alert.batch_id == batch.id,
            Alert.alert_type == "mortality_high",
            Alert.is_resolved == False
        ).first()
        
        if existing_alert:
            return None
        
        # Determine threshold based on stage
        threshold = None
        if batch.stage in ["eggs", "fry", "fingerlings"]:
            threshold = AlertGenerator.THRESHOLDS["mortality_hatchery"]
        elif batch.stage in ["juveniles", "young_fish"]:
            threshold = AlertGenerator.THRESHOLDS["mortality_growout"]
        elif batch.stage == "fattening":
            threshold = AlertGenerator.THRESHOLDS["mortality_fattening"]
        
        if threshold and batch.mortality_rate > threshold:
            severity = "critical" if batch.mortality_rate > threshold * 1.5 else "warning"
            message = f"Mortality rate high: {batch.mortality_rate:.1f}% (threshold: {threshold}%). Investigate cause immediately!"
            
            alert = Alert(
                batch_id=batch.id,
                pond_id=batch.pond_id,
                alert_type="mortality_high",
                severity=severity,
                message=message,
                created_at=datetime.now()
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            return alert
        
        return None
    
    @staticmethod
    def check_transfer_alert(batch: Batch, db: Session) -> Optional[Alert]:
        """
        Check if batch is ready for transfer
        
        Args:
            batch: Batch object to check
            db: Database session
            
        Returns:
            Alert object if ready for transfer, None otherwise
        """
        if not batch:
            return None
        
        # Check if alert already exists and is unresolved
        existing_alert = db.query(Alert).filter(
            Alert.batch_id == batch.id,
            Alert.alert_type == "transfer_ready",
            Alert.is_resolved == False
        ).first()
        
        if existing_alert:
            return None
        
        message = None
        target_unit = None
        
        # Check fingerlings ready for growout
        if batch.stage == "fingerlings" and batch.avg_weight >= AlertGenerator.THRESHOLDS["transfer_fingerlings"]:
            message = f"Batch {batch.batch_code} ready for transfer to growout unit (weight: {batch.avg_weight}g)"
            target_unit = "growout"
        
        # Check young fish ready for fattening
        elif batch.stage == "young_fish" and batch.avg_weight >= AlertGenerator.THRESHOLDS["transfer_young_fish"]:
            message = f"Batch {batch.batch_code} ready for transfer to fattening unit (weight: {batch.avg_weight}g)"
            target_unit = "fattening"
        
        if message:
            alert = Alert(
                batch_id=batch.id,
                pond_id=batch.pond_id,
                alert_type="transfer_ready",
                severity="info",
                message=message,
                created_at=datetime.now()
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            return alert
        
        return None
    
    @staticmethod
    def check_harvest_alert(batch: Batch, db: Session) -> Optional[Alert]:
        """
        Check if batch is ready for harvest
        
        Args:
            batch: Batch object to check
            db: Database session
            
        Returns:
            Alert object if ready for harvest, None otherwise
        """
        if not batch:
            return None
        
        # Check if alert already exists and is unresolved
        existing_alert = db.query(Alert).filter(
            Alert.batch_id == batch.id,
            Alert.alert_type == "harvest_ready",
            Alert.is_resolved == False
        ).first()
        
        if existing_alert:
            return None
        
        severity = None
        message = None
        
        # Check if in optimal harvest range
        if (AlertGenerator.THRESHOLDS["harvest_optimal_min"] <= batch.avg_weight <= 
            AlertGenerator.THRESHOLDS["harvest_optimal_max"]):
            severity = "info"
            message = f"Batch {batch.batch_code} in optimal harvest range ({batch.avg_weight}g). Ready for harvest!"
        
        # Check if exceeding optimal range
        elif batch.avg_weight > AlertGenerator.THRESHOLDS["harvest_optimal_max"]:
            severity = "warning"
            message = f"Batch {batch.batch_code} exceeding optimal harvest weight ({batch.avg_weight}g). Consider harvesting soon!"
        
        # Check if approaching harvest weight
        elif batch.avg_weight >= AlertGenerator.THRESHOLDS["harvest_min_weight"]:
            severity = "info"
            message = f"Batch {batch.batch_code} approaching harvest weight ({batch.avg_weight}g). Monitor closely!"
        
        if severity:
            alert = Alert(
                batch_id=batch.id,
                pond_id=batch.pond_id,
                alert_type="harvest_ready",
                severity=severity,
                message=message,
                created_at=datetime.now()
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            return alert
        
        return None
    
    @staticmethod
    def check_water_quality_alert(water_quality: WaterQuality, db: Session) -> Optional[Alert]:
        """
        Check if water quality is outside optimal range
        
        Args:
            water_quality: WaterQuality record to check
            db: Database session
            
        Returns:
            Alert object if outside range, None otherwise
        """
        if not water_quality:
            return None
        
        issues = []
        
        # Check dissolved oxygen
        if water_quality.dissolved_oxygen < AlertGenerator.THRESHOLDS["do_min"]:
            issues.append(f"DO low: {water_quality.dissolved_oxygen} mg/L (min: {AlertGenerator.THRESHOLDS['do_min']})")
        elif water_quality.dissolved_oxygen > AlertGenerator.THRESHOLDS["do_max"]:
            issues.append(f"DO high: {water_quality.dissolved_oxygen} mg/L (max: {AlertGenerator.THRESHOLDS['do_max']})")
        
        # Check pH
        if water_quality.ph < AlertGenerator.THRESHOLDS["ph_min"]:
            issues.append(f"pH low: {water_quality.ph} (min: {AlertGenerator.THRESHOLDS['ph_min']})")
        elif water_quality.ph > AlertGenerator.THRESHOLDS["ph_max"]:
            issues.append(f"pH high: {water_quality.ph} (max: {AlertGenerator.THRESHOLDS['ph_max']})")
        
        # Check temperature
        if water_quality.temperature < AlertGenerator.THRESHOLDS["temp_min"]:
            issues.append(f"Temperature low: {water_quality.temperature}°C (min: {AlertGenerator.THRESHOLDS['temp_min']})")
        elif water_quality.temperature > AlertGenerator.THRESHOLDS["temp_max"]:
            issues.append(f"Temperature high: {water_quality.temperature}°C (max: {AlertGenerator.THRESHOLDS['temp_max']})")
        
        # Check TAN
        if water_quality.tan > AlertGenerator.THRESHOLDS["tan_max"]:
            issues.append(f"TAN high: {water_quality.tan} mg/L (max: {AlertGenerator.THRESHOLDS['tan_max']})")
        
        # Check alkalinity
        if water_quality.alkalinity < AlertGenerator.THRESHOLDS["alkalinity_min"]:
            issues.append(f"Alkalinity low: {water_quality.alkalinity} mg/L (min: {AlertGenerator.THRESHOLDS['alkalinity_min']})")
        
        # Check NH3
        if water_quality.nh3 and water_quality.nh3 > AlertGenerator.THRESHOLDS["nh3_max"]:
            issues.append(f"NH3 high: {water_quality.nh3} mg/L (max: {AlertGenerator.THRESHOLDS['nh3_max']})")
        
        if issues:
            severity = "critical" if len(issues) >= 3 else "warning"
            message = f"Water quality issues in pond {water_quality.pond_id}: " + "; ".join(issues)
            
            alert = Alert(
                pond_id=water_quality.pond_id,
                alert_type="water_quality",
                severity=severity,
                message=message,
                created_at=datetime.now()
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            return alert
        
        return None
    
    @staticmethod
    def check_all_alerts(batch: Batch, db: Session) -> List[Alert]:
        """
        Check all alert conditions for a batch
        
        Args:
            batch: Batch object to check
            db: Database session
            
        Returns:
            List of generated alerts
        """
        alerts = []
        
        # Check FCR
        fcr_alert = AlertGenerator.check_fcr_alert(batch, db)
        if fcr_alert:
            alerts.append(fcr_alert)
        
        # Check SGR
        sgr_alert = AlertGenerator.check_sgr_alert(batch, db)
        if sgr_alert:
            alerts.append(sgr_alert)
        
        # Check mortality
        mortality_alert = AlertGenerator.check_mortality_alert(batch, db)
        if mortality_alert:
            alerts.append(mortality_alert)
        
        # Check transfer readiness
        transfer_alert = AlertGenerator.check_transfer_alert(batch, db)
        if transfer_alert:
            alerts.append(transfer_alert)
        
        # Check harvest readiness
        harvest_alert = AlertGenerator.check_harvest_alert(batch, db)
        if harvest_alert:
            alerts.append(harvest_alert)
        
        return alerts
