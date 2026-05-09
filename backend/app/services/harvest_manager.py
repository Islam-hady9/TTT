"""
Harvest Manager Service
Handles harvest operations, validation, and calculations
"""
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models.harvest import Harvest
from app.models.pond import Batch, Pond
from app.services.history_tracker import HistoryTracker


class HarvestManager:
    """Manages harvest operations and calculations"""
    
    # Harvest criteria
    MIN_HARVEST_WEIGHT = 350.0  # grams
    MAX_HARVEST_WEIGHT = 600.0  # grams
    OPTIMAL_MIN_WEIGHT = 400.0  # grams
    OPTIMAL_MAX_WEIGHT = 600.0  # grams
    
    # Quality grades
    GRADE_A_MIN = 400.0  # Premium quality
    GRADE_B_MIN = 350.0  # Standard quality
    
    def __init__(self):
        self.history_tracker = HistoryTracker()
    
    def validate_harvest(
        self, 
        batch: Batch, 
        harvest_count: int,
        db: Session
    ) -> Tuple[bool, str]:
        """
        Validate if batch is ready for harvest
        
        Returns:
            Tuple[bool, str]: (is_valid, error_message)
        """
        # Check batch status
        if batch.status != "active":
            return False, f"Batch is not active (status: {batch.status})"
        
        # Check if already harvested
        existing_harvest = db.query(Harvest).filter(
            Harvest.batch_id == batch.id
        ).first()
        if existing_harvest:
            return False, "Batch has already been harvested"
        
        # Check harvest count
        if harvest_count > batch.current_count:
            return False, f"Harvest count ({harvest_count}) exceeds current count ({batch.current_count})"
        
        if harvest_count < 10:
            return False, "Harvest count too low (minimum 10 fish)"
        
        # Check weight (warning, not error)
        if batch.avg_weight < self.MIN_HARVEST_WEIGHT:
            return False, f"Average weight ({batch.avg_weight}g) below minimum harvest weight ({self.MIN_HARVEST_WEIGHT}g)"
        
        # Check stage
        if batch.stage != "fattening":
            return False, f"Batch not in fattening stage (current: {batch.stage})"
        
        return True, "Validation passed"
    
    def calculate_harvest_metrics(
        self,
        batch: Batch,
        harvest_count: int,
        avg_weight: float
    ) -> dict:
        """
        Calculate harvest metrics
        
        Returns:
            dict: Harvest metrics including weights, grades, and quality scores
        """
        # Total harvest weight in kg
        total_harvest_weight = (harvest_count * avg_weight) / 1000.0
        
        # Calculate cycle duration
        cycle_duration = None
        if batch.stocking_date:
            cycle_duration = (datetime.now() - batch.stocking_date).days
        
        # Determine quality grades based on weight
        grade_a_count = 0
        grade_b_count = 0
        grade_c_count = 0
        
        if avg_weight >= self.GRADE_A_MIN:
            grade_a_count = harvest_count
        elif avg_weight >= self.GRADE_B_MIN:
            grade_b_count = harvest_count
        else:
            grade_c_count = harvest_count
        
        # Calculate revenue if price is available
        total_revenue = None
        
        return {
            "total_harvest_weight": round(total_harvest_weight, 2),
            "cycle_duration": cycle_duration,
            "grade_a_count": grade_a_count,
            "grade_b_count": grade_b_count,
            "grade_c_count": grade_c_count,
            "total_revenue": total_revenue
        }
    
    def execute_harvest(
        self,
        batch: Batch,
        harvest_data: dict,
        db: Session
    ) -> Harvest:
        """
        Execute harvest operation
        
        Args:
            batch: Batch to harvest
            harvest_data: Harvest data from request
            db: Database session
        
        Returns:
            Harvest: Created harvest record
        """
        # Calculate metrics
        metrics = self.calculate_harvest_metrics(
            batch,
            harvest_data["harvest_count"],
            harvest_data["avg_weight"]
        )
        
        # Calculate revenue if price provided
        total_revenue = None
        if harvest_data.get("price_per_kg"):
            total_revenue = metrics["total_harvest_weight"] * harvest_data["price_per_kg"]
        
        # Create harvest record
        harvest = Harvest(
            batch_id=batch.id,
            pond_id=batch.pond_id,
            harvest_count=harvest_data["harvest_count"],
            avg_weight=harvest_data["avg_weight"],
            total_harvest_weight=metrics["total_harvest_weight"],
            grade_a_count=harvest_data.get("grade_a_count", metrics["grade_a_count"]),
            grade_b_count=harvest_data.get("grade_b_count", metrics["grade_b_count"]),
            grade_c_count=harvest_data.get("grade_c_count", metrics["grade_c_count"]),
            cycle_duration=metrics["cycle_duration"],
            final_fcr=batch.fcr,
            survival_rate=batch.survival_rate,
            total_feed_consumed=batch.total_feed_consumed,
            price_per_kg=harvest_data.get("price_per_kg"),
            total_revenue=total_revenue,
            buyer_name=harvest_data.get("buyer_name"),
            status="completed",
            harvested_by=harvest_data["harvested_by"],
            notes=harvest_data.get("notes"),
            harvest_date=harvest_data["harvest_date"]
        )
        
        db.add(harvest)
        
        # Update batch status
        batch.status = "harvested"
        batch.harvest_date = harvest_data["harvest_date"]
        batch.cycle_duration = metrics["cycle_duration"]
        
        # Record in history
        self.history_tracker.record_event(
            batch_id=batch.id,
            action_type="harvest",
            data={
                "harvest_count": harvest_data["harvest_count"],
                "avg_weight": harvest_data["avg_weight"],
                "total_weight": metrics["total_harvest_weight"],
                "final_fcr": batch.fcr,
                "survival_rate": batch.survival_rate,
                "cycle_duration": metrics["cycle_duration"]
            },
            db=db
        )
        
        db.commit()
        db.refresh(harvest)
        
        return harvest
    
    def get_harvest_ready_batches(
        self,
        db: Session,
        min_weight: Optional[float] = None,
        max_weight: Optional[float] = None
    ) -> List[dict]:
        """
        Get all batches ready for harvest
        
        Args:
            db: Database session
            min_weight: Minimum weight filter (default: MIN_HARVEST_WEIGHT)
            max_weight: Maximum weight filter (default: MAX_HARVEST_WEIGHT)
        
        Returns:
            List[dict]: List of harvest-ready batches with readiness scores
        """
        min_w = min_weight or self.MIN_HARVEST_WEIGHT
        max_w = max_weight or self.MAX_HARVEST_WEIGHT
        
        # Query batches in fattening stage with appropriate weight
        batches = db.query(Batch).filter(
            and_(
                Batch.status == "active",
                Batch.stage == "fattening",
                Batch.avg_weight >= min_w,
                Batch.avg_weight <= max_w
            )
        ).all()
        
        result = []
        for batch in batches:
            # Get pond info
            pond = db.query(Pond).filter(Pond.id == batch.pond_id).first()
            
            # Calculate days old
            days_old = 0
            if batch.stocking_date:
                days_old = (datetime.now() - batch.stocking_date).days
            
            # Determine harvest status
            harvest_status = self._get_harvest_status(batch.avg_weight)
            
            # Calculate readiness score (0-100)
            readiness_score = self._calculate_readiness_score(batch)
            
            result.append({
                "id": batch.id,
                "batch_code": batch.batch_code,
                "pond_id": batch.pond_id,
                "pond_code": pond.pond_code if pond else None,
                "unit_type": pond.unit_type if pond else None,
                "current_count": batch.current_count,
                "avg_weight": batch.avg_weight,
                "biomass": batch.biomass,
                "stage": batch.stage,
                "fcr": batch.fcr,
                "sgr": batch.sgr,
                "mortality_rate": batch.mortality_rate,
                "survival_rate": batch.survival_rate,
                "stocking_date": batch.stocking_date,
                "days_old": days_old,
                "harvest_status": harvest_status,
                "harvest_readiness_score": readiness_score
            })
        
        # Sort by readiness score (highest first)
        result.sort(key=lambda x: x["harvest_readiness_score"], reverse=True)
        
        return result
    
    def _get_harvest_status(self, avg_weight: float) -> str:
        """Determine harvest status based on weight"""
        if avg_weight >= self.OPTIMAL_MIN_WEIGHT and avg_weight <= self.OPTIMAL_MAX_WEIGHT:
            return "optimal"
        elif avg_weight >= self.MIN_HARVEST_WEIGHT and avg_weight <= self.MAX_HARVEST_WEIGHT:
            return "ready"
        else:
            return "not_ready"
    
    def _calculate_readiness_score(self, batch: Batch) -> float:
        """
        Calculate harvest readiness score (0-100)
        
        Factors:
        - Weight in optimal range: 40 points
        - Good FCR (<1.5): 30 points
        - High survival rate (>90%): 20 points
        - Appropriate age (>100 days): 10 points
        """
        score = 0.0
        
        # Weight score (40 points)
        if batch.avg_weight >= self.OPTIMAL_MIN_WEIGHT and batch.avg_weight <= self.OPTIMAL_MAX_WEIGHT:
            score += 40.0
        elif batch.avg_weight >= self.MIN_HARVEST_WEIGHT and batch.avg_weight <= self.MAX_HARVEST_WEIGHT:
            # Partial score based on proximity to optimal range
            if batch.avg_weight < self.OPTIMAL_MIN_WEIGHT:
                score += 20.0 + (batch.avg_weight - self.MIN_HARVEST_WEIGHT) / (self.OPTIMAL_MIN_WEIGHT - self.MIN_HARVEST_WEIGHT) * 20.0
            else:
                score += 30.0
        
        # FCR score (30 points)
        if batch.fcr:
            if batch.fcr < 1.2:
                score += 30.0
            elif batch.fcr < 1.5:
                score += 25.0
            elif batch.fcr < 1.8:
                score += 15.0
            else:
                score += 5.0
        
        # Survival rate score (20 points)
        if batch.survival_rate >= 95:
            score += 20.0
        elif batch.survival_rate >= 90:
            score += 15.0
        elif batch.survival_rate >= 85:
            score += 10.0
        else:
            score += 5.0
        
        # Age score (10 points)
        if batch.stocking_date:
            days_old = (datetime.now() - batch.stocking_date).days
            if days_old >= 120:
                score += 10.0
            elif days_old >= 100:
                score += 7.0
            elif days_old >= 80:
                score += 4.0
        
        return round(score, 1)
    
    def get_harvest_summary(
        self,
        db: Session,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> dict:
        """
        Get summary statistics for harvest operations
        
        Args:
            db: Database session
            start_date: Start date for filtering
            end_date: End date for filtering
        
        Returns:
            dict: Summary statistics
        """
        query = db.query(Harvest)
        
        if start_date:
            query = query.filter(Harvest.harvest_date >= start_date)
        if end_date:
            query = query.filter(Harvest.harvest_date <= end_date)
        
        harvests = query.all()
        
        if not harvests:
            return {
                "total_harvests": 0,
                "total_fish_harvested": 0,
                "total_biomass_kg": 0.0,
                "avg_weight_g": 0.0,
                "avg_fcr": 0.0,
                "avg_survival_rate": 0.0,
                "total_revenue": 0.0,
                "grade_a_percentage": 0.0,
                "grade_b_percentage": 0.0,
                "grade_c_percentage": 0.0
            }
        
        total_fish = sum(h.harvest_count for h in harvests)
        total_biomass = sum(h.total_harvest_weight for h in harvests)
        total_revenue = sum(h.total_revenue or 0 for h in harvests)
        
        # Calculate averages
        avg_weight = sum(h.avg_weight * h.harvest_count for h in harvests) / total_fish if total_fish > 0 else 0
        
        harvests_with_fcr = [h for h in harvests if h.final_fcr]
        avg_fcr = sum(h.final_fcr for h in harvests_with_fcr) / len(harvests_with_fcr) if harvests_with_fcr else 0
        
        harvests_with_survival = [h for h in harvests if h.survival_rate]
        avg_survival = sum(h.survival_rate for h in harvests_with_survival) / len(harvests_with_survival) if harvests_with_survival else 0
        
        # Calculate quality distribution
        total_grade_a = sum(h.grade_a_count for h in harvests)
        total_grade_b = sum(h.grade_b_count for h in harvests)
        total_grade_c = sum(h.grade_c_count for h in harvests)
        
        grade_a_pct = (total_grade_a / total_fish * 100) if total_fish > 0 else 0
        grade_b_pct = (total_grade_b / total_fish * 100) if total_fish > 0 else 0
        grade_c_pct = (total_grade_c / total_fish * 100) if total_fish > 0 else 0
        
        return {
            "total_harvests": len(harvests),
            "total_fish_harvested": total_fish,
            "total_biomass_kg": round(total_biomass, 2),
            "avg_weight_g": round(avg_weight, 1),
            "avg_fcr": round(avg_fcr, 2),
            "avg_survival_rate": round(avg_survival, 1),
            "total_revenue": round(total_revenue, 2),
            "grade_a_percentage": round(grade_a_pct, 1),
            "grade_b_percentage": round(grade_b_pct, 1),
            "grade_c_percentage": round(grade_c_pct, 1)
        }
