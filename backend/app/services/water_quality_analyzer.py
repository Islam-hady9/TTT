"""
Water Quality Analyzer Service
Analyzes correlation between water quality and fish growth performance
"""

from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models.pond import Batch
from app.models.water_quality import WaterQuality


class WaterQualityAnalyzer:
    """Analyzes water quality impact on fish growth"""
    
    # Optimal ranges for tilapia
    OPTIMAL_RANGES = {
        "do": (6.0, 8.0),  # mg/L
        "ph": (7.0, 8.3),
        "temperature": (25.0, 30.0),  # Celsius
        "tan": (0.0, 0.5),  # mg/L
        "alkalinity": (100.0, 200.0),  # mg/L
        "floc_level": (10.0, 30.0)  # mL/L for biofloc
    }
    
    # Critical thresholds
    CRITICAL_THRESHOLDS = {
        "do": (4.0, 10.0),
        "ph": (6.0, 9.0),
        "temperature": (20.0, 35.0),
        "tan": (0.0, 2.0),
        "alkalinity": (50.0, 300.0),
        "floc_level": (5.0, 50.0)
    }
    
    @staticmethod
    def check_parameter_status(parameter: str, value: float) -> Dict:
        """
        Check if a water quality parameter is within optimal range
        
        Args:
            parameter: Parameter name (do, ph, temperature, etc.)
            value: Measured value
            
        Returns:
            Dictionary with status and details
        """
        if parameter not in WaterQualityAnalyzer.OPTIMAL_RANGES:
            return {
                "parameter": parameter,
                "value": value,
                "status": "unknown",
                "message": "Parameter not recognized"
            }
        
        optimal_min, optimal_max = WaterQualityAnalyzer.OPTIMAL_RANGES[parameter]
        critical_min, critical_max = WaterQualityAnalyzer.CRITICAL_THRESHOLDS[parameter]
        
        # Check status
        if optimal_min <= value <= optimal_max:
            status = "optimal"
            message = f"{parameter.upper()} is within optimal range"
        elif critical_min <= value <= critical_max:
            status = "warning"
            if value < optimal_min:
                message = f"{parameter.upper()} is below optimal range"
            else:
                message = f"{parameter.upper()} is above optimal range"
        else:
            status = "critical"
            if value < critical_min:
                message = f"{parameter.upper()} is critically low"
            else:
                message = f"{parameter.upper()} is critically high"
        
        return {
            "parameter": parameter,
            "value": value,
            "status": status,
            "message": message,
            "optimal_range": f"{optimal_min} - {optimal_max}",
            "deviation": abs(value - ((optimal_min + optimal_max) / 2))
        }
    
    @staticmethod
    def analyze_water_quality_reading(reading: WaterQuality) -> Dict:
        """
        Analyze a single water quality reading
        
        Args:
            reading: WaterQuality object
            
        Returns:
            Analysis results with all parameters
        """
        parameters = {}
        issues = []
        
        # Check each parameter
        if reading.do is not None:
            result = WaterQualityAnalyzer.check_parameter_status("do", reading.do)
            parameters["do"] = result
            if result["status"] != "optimal":
                issues.append(result)
        
        if reading.ph is not None:
            result = WaterQualityAnalyzer.check_parameter_status("ph", reading.ph)
            parameters["ph"] = result
            if result["status"] != "optimal":
                issues.append(result)
        
        if reading.temperature is not None:
            result = WaterQualityAnalyzer.check_parameter_status("temperature", reading.temperature)
            parameters["temperature"] = result
            if result["status"] != "optimal":
                issues.append(result)
        
        if reading.tan is not None:
            result = WaterQualityAnalyzer.check_parameter_status("tan", reading.tan)
            parameters["tan"] = result
            if result["status"] != "optimal":
                issues.append(result)
        
        if reading.alkalinity is not None:
            result = WaterQualityAnalyzer.check_parameter_status("alkalinity", reading.alkalinity)
            parameters["alkalinity"] = result
            if result["status"] != "optimal":
                issues.append(result)
        
        if reading.floc_level is not None:
            result = WaterQualityAnalyzer.check_parameter_status("floc_level", reading.floc_level)
            parameters["floc_level"] = result
            if result["status"] != "optimal":
                issues.append(result)
        
        # Overall status
        critical_count = sum(1 for p in parameters.values() if p["status"] == "critical")
        warning_count = sum(1 for p in parameters.values() if p["status"] == "warning")
        
        if critical_count > 0:
            overall_status = "critical"
        elif warning_count > 0:
            overall_status = "warning"
        else:
            overall_status = "optimal"
        
        return {
            "reading_id": reading.id,
            "pond_id": reading.pond_id,
            "measured_at": reading.measured_at,
            "overall_status": overall_status,
            "parameters": parameters,
            "issues": issues,
            "critical_count": critical_count,
            "warning_count": warning_count
        }
    
    @staticmethod
    def get_batch_water_quality_summary(
        batch: Batch,
        db: Session,
        days: int = 30
    ) -> Dict:
        """
        Get water quality summary for a batch's pond
        
        Args:
            batch: Batch object
            db: Database session
            days: Number of days to analyze
            
        Returns:
            Summary statistics
        """
        if not batch or not batch.pond_id:
            return {}
        
        # Get water quality readings for the period
        start_date = datetime.now() - timedelta(days=days)
        
        readings = db.query(WaterQuality).filter(
            and_(
                WaterQuality.pond_id == batch.pond_id,
                WaterQuality.measured_at >= start_date
            )
        ).order_by(WaterQuality.measured_at.desc()).all()
        
        if not readings:
            return {
                "batch_id": batch.id,
                "pond_id": batch.pond_id,
                "days_analyzed": days,
                "total_readings": 0,
                "message": "No water quality data available"
            }
        
        # Analyze each reading
        analyses = [WaterQualityAnalyzer.analyze_water_quality_reading(r) for r in readings]
        
        # Calculate statistics
        optimal_days = sum(1 for a in analyses if a["overall_status"] == "optimal")
        warning_days = sum(1 for a in analyses if a["overall_status"] == "warning")
        critical_days = sum(1 for a in analyses if a["overall_status"] == "critical")
        
        total_readings = len(readings)
        optimal_percentage = (optimal_days / total_readings) * 100 if total_readings > 0 else 0
        
        # Get average values
        avg_do = sum(r.do for r in readings if r.do is not None) / len([r for r in readings if r.do is not None]) if any(r.do is not None for r in readings) else None
        avg_ph = sum(r.ph for r in readings if r.ph is not None) / len([r for r in readings if r.ph is not None]) if any(r.ph is not None for r in readings) else None
        avg_temp = sum(r.temperature for r in readings if r.temperature is not None) / len([r for r in readings if r.temperature is not None]) if any(r.temperature is not None for r in readings) else None
        avg_tan = sum(r.tan for r in readings if r.tan is not None) / len([r for r in readings if r.tan is not None]) if any(r.tan is not None for r in readings) else None
        
        return {
            "batch_id": batch.id,
            "batch_code": batch.batch_code,
            "pond_id": batch.pond_id,
            "days_analyzed": days,
            "total_readings": total_readings,
            "optimal_days": optimal_days,
            "warning_days": warning_days,
            "critical_days": critical_days,
            "optimal_percentage": round(optimal_percentage, 1),
            "averages": {
                "do": round(avg_do, 2) if avg_do else None,
                "ph": round(avg_ph, 2) if avg_ph else None,
                "temperature": round(avg_temp, 2) if avg_temp else None,
                "tan": round(avg_tan, 3) if avg_tan else None
            },
            "latest_reading": analyses[0] if analyses else None
        }
    
    @staticmethod
    def correlate_with_growth(
        batch: Batch,
        db: Session,
        days: int = 30
    ) -> Dict:
        """
        Correlate water quality with growth performance
        
        Args:
            batch: Batch object
            db: Database session
            days: Number of days to analyze
            
        Returns:
            Correlation analysis
        """
        # Get water quality summary
        wq_summary = WaterQualityAnalyzer.get_batch_water_quality_summary(batch, db, days)
        
        if wq_summary.get("total_readings", 0) == 0:
            return {
                "batch_id": batch.id,
                "correlation": "insufficient_data",
                "message": "Not enough water quality data to correlate with growth"
            }
        
        # Get growth metrics
        sgr = batch.sgr
        fcr = batch.fcr
        
        # Analyze correlation
        optimal_percentage = wq_summary.get("optimal_percentage", 0)
        
        # Determine if water quality is impacting growth
        impact_level = "none"
        recommendations = []
        
        if optimal_percentage < 50:
            impact_level = "high"
            recommendations.append("Water quality is frequently outside optimal range")
            recommendations.append("This may be significantly impacting fish growth and health")
            
            if sgr and sgr < 5.0:
                recommendations.append("Low SGR may be related to poor water quality")
            
            if fcr and fcr > 1.8:
                recommendations.append("High FCR may be related to poor water quality affecting feed efficiency")
        
        elif optimal_percentage < 75:
            impact_level = "moderate"
            recommendations.append("Water quality is occasionally outside optimal range")
            recommendations.append("Consider improving water quality management")
        
        else:
            impact_level = "low"
            recommendations.append("Water quality is generally good")
            
            if sgr and sgr < 5.0:
                recommendations.append("Low SGR is likely not related to water quality - check other factors")
        
        # Specific parameter issues
        if wq_summary.get("latest_reading"):
            issues = wq_summary["latest_reading"].get("issues", [])
            for issue in issues:
                if issue["status"] == "critical":
                    recommendations.append(f"URGENT: {issue['message']}")
        
        return {
            "batch_id": batch.id,
            "batch_code": batch.batch_code,
            "water_quality_summary": wq_summary,
            "growth_metrics": {
                "sgr": sgr,
                "fcr": fcr,
                "avg_weight": batch.avg_weight,
                "stage": batch.stage
            },
            "impact_level": impact_level,
            "optimal_percentage": optimal_percentage,
            "recommendations": recommendations,
            "correlation_strength": "high" if optimal_percentage < 50 else "moderate" if optimal_percentage < 75 else "low"
        }
