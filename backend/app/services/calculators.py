"""
Calculator Services
Provides calculation engines for all KPIs (Biomass, FCR, SGR, Predictions, Feeding)
"""

import math
from typing import Optional, Tuple, Dict
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.pond import Batch

class BiomassCalculator:
    """Calculates and updates batch biomass"""
    
    @staticmethod
    def calculate_biomass(current_count: int, avg_weight: float) -> float:
        """
        Calculate biomass = current_count * avg_weight
        
        Args:
            current_count: Number of fish
            avg_weight: Average weight in grams
            
        Returns:
            Biomass in grams
        """
        if current_count < 0 or avg_weight < 0:
            raise ValueError("Count and weight must be non-negative")
        
        return current_count * avg_weight
    
    @staticmethod
    def calculate_biomass_kg(current_count: int, avg_weight: float) -> float:
        """
        Calculate biomass in kilograms
        
        Args:
            current_count: Number of fish
            avg_weight: Average weight in grams
            
        Returns:
            Biomass in kilograms
        """
        biomass_grams = BiomassCalculator.calculate_biomass(current_count, avg_weight)
        return biomass_grams / 1000.0
    
    @staticmethod
    def update_batch_biomass(batch: Batch, db: Session) -> float:
        """
        Recalculate and update batch biomass
        
        Args:
            batch: Batch object to update
            db: Database session
            
        Returns:
            Updated biomass in grams
        """
        if not batch:
            raise ValueError("Batch cannot be None")
        
        biomass = BiomassCalculator.calculate_biomass(batch.current_count, batch.avg_weight)
        batch.biomass = biomass
        db.commit()
        db.refresh(batch)
        
        return biomass


class FCRCalculator:
    """Calculates Feed Conversion Ratio"""
    
    # FCR Classifications
    FCR_EXCELLENT = 1.5
    FCR_GOOD = 1.8
    
    @staticmethod
    def calculate_fcr(
        total_feed_consumed: float,  # kg
        initial_weight: float,  # grams
        final_weight: float,  # grams
        current_count: int
    ) -> Optional[float]:
        """
        Calculate FCR = total_feed / weight_gained
        
        Args:
            total_feed_consumed: Total feed consumed in kg
            initial_weight: Initial average weight in grams
            final_weight: Final average weight in grams
            current_count: Current fish count
            
        Returns:
            FCR value or None if cannot calculate
        """
        if total_feed_consumed <= 0:
            return None
        
        if final_weight <= initial_weight:
            return None
        
        # Calculate weight gained in kg
        weight_gained_per_fish = (final_weight - initial_weight) / 1000.0  # convert to kg
        total_weight_gained = weight_gained_per_fish * current_count
        
        if total_weight_gained <= 0:
            return None
        
        fcr = total_feed_consumed / total_weight_gained
        return round(fcr, 2)
    
    @staticmethod
    def update_batch_fcr(batch: Batch, db: Session) -> Optional[float]:
        """
        Recalculate and update batch FCR
        
        Args:
            batch: Batch object to update
            db: Database session
            
        Returns:
            Updated FCR or None if cannot calculate
        """
        if not batch or not batch.total_feed_consumed:
            return None
        
        # Calculate initial weight (assuming it was the avg_weight at stocking)
        # For now, we'll use a simple approach: if we have previous_avg_weight, use it
        # Otherwise, estimate based on stage
        initial_weight = batch.previous_avg_weight if batch.previous_avg_weight else batch.avg_weight * 0.5
        
        fcr = FCRCalculator.calculate_fcr(
            batch.total_feed_consumed,
            initial_weight,
            batch.avg_weight,
            batch.current_count
        )
        
        if fcr is not None:
            batch.fcr = fcr
            db.commit()
            db.refresh(batch)
        
        return fcr
    
    @staticmethod
    def classify_fcr(fcr: float) -> str:
        """
        Classify FCR as excellent, good, or poor
        
        Args:
            fcr: FCR value
            
        Returns:
            Classification string
        """
        if fcr < FCRCalculator.FCR_EXCELLENT:
            return "excellent"
        elif fcr <= FCRCalculator.FCR_GOOD:
            return "good"
        else:
            return "poor"


class SGRCalculator:
    """Calculates Specific Growth Rate"""
    
    # SGR Classifications
    SGR_EXCELLENT = 7.0  # %
    SGR_GOOD = 5.0  # %
    
    @staticmethod
    def calculate_sgr(
        initial_weight: float,  # grams
        final_weight: float,  # grams
        days_elapsed: int
    ) -> Optional[float]:
        """
        Calculate SGR = ((ln(W2) - ln(W1)) / days) * 100
        
        Args:
            initial_weight: Initial weight in grams
            final_weight: Final weight in grams
            days_elapsed: Number of days between measurements
            
        Returns:
            SGR percentage or None if cannot calculate
        """
        if initial_weight <= 0 or final_weight <= 0:
            return None
        
        if days_elapsed <= 0:
            return None
        
        if final_weight <= initial_weight:
            return 0.0
        
        try:
            sgr = ((math.log(final_weight) - math.log(initial_weight)) / days_elapsed) * 100
            return round(sgr, 2)
        except (ValueError, ZeroDivisionError):
            return None
    
    @staticmethod
    def update_batch_sgr(
        batch: Batch,
        new_avg_weight: float,
        sampling_date: datetime,
        db: Session
    ) -> Optional[float]:
        """
        Calculate and update SGR after sampling
        
        Args:
            batch: Batch object to update
            new_avg_weight: New average weight from sampling
            sampling_date: Date of sampling
            db: Database session
            
        Returns:
            Calculated SGR or None if cannot calculate
        """
        if not batch:
            return None
        
        # Need previous weight and date to calculate SGR
        if not batch.previous_avg_weight or not batch.last_sampling_date:
            # First sampling - store data but can't calculate SGR yet
            batch.previous_avg_weight = batch.avg_weight
            batch.avg_weight = new_avg_weight
            batch.last_sampling_date = sampling_date
            db.commit()
            db.refresh(batch)
            return None
        
        # Calculate days elapsed
        days_elapsed = (sampling_date - batch.last_sampling_date).days
        
        if days_elapsed <= 0:
            return None
        
        # Calculate SGR
        sgr = SGRCalculator.calculate_sgr(
            batch.previous_avg_weight,
            new_avg_weight,
            days_elapsed
        )
        
        # Update batch
        batch.previous_avg_weight = batch.avg_weight
        batch.avg_weight = new_avg_weight
        batch.last_sampling_date = sampling_date
        
        if sgr is not None:
            batch.sgr = sgr
        
        db.commit()
        db.refresh(batch)
        
        return sgr
    
    @staticmethod
    def classify_sgr(sgr: float) -> str:
        """
        Classify SGR as excellent, good, or poor
        
        Args:
            sgr: SGR percentage
            
        Returns:
            Classification string
        """
        if sgr > SGRCalculator.SGR_EXCELLENT:
            return "excellent"
        elif sgr >= SGRCalculator.SGR_GOOD:
            return "good"
        else:
            return "poor"


class WeightPredictor:
    """Predicts future fish weight"""
    
    @staticmethod
    def predict_weight(
        current_weight: float,  # grams
        sgr: float,  # percentage
        days_ahead: int
    ) -> Optional[float]:
        """
        Predict weight = current_weight * e^(SGR * days / 100)
        
        Args:
            current_weight: Current average weight in grams
            sgr: Specific Growth Rate percentage
            days_ahead: Number of days to predict ahead
            
        Returns:
            Predicted weight in grams or None if cannot calculate
        """
        if current_weight <= 0 or days_ahead < 0:
            return None
        
        if sgr is None:
            return None
        
        try:
            predicted_weight = current_weight * math.exp((sgr * days_ahead) / 100)
            return round(predicted_weight, 2)
        except (ValueError, OverflowError):
            return None
    
    @staticmethod
    def get_prediction_confidence(batch: Batch, db: Session) -> str:
        """
        Determine confidence level based on data recency
        
        Args:
            batch: Batch object
            db: Database session
            
        Returns:
            Confidence level: high, medium, or low
        """
        if not batch or not batch.sgr or not batch.last_sampling_date:
            return "low"
        
        # Check how recent the last sampling was
        days_since_sampling = (datetime.now() - batch.last_sampling_date).days
        
        if days_since_sampling <= 7:
            return "high"
        elif days_since_sampling <= 14:
            return "medium"
        else:
            return "low"


class HarvestPredictor:
    """Predicts harvest date"""
    
    # Default target weight for harvest
    DEFAULT_TARGET_WEIGHT = 450.0  # grams
    OPTIMAL_MIN_WEIGHT = 400.0  # grams
    OPTIMAL_MAX_WEIGHT = 600.0  # grams
    
    @staticmethod
    def predict_harvest_date(
        current_weight: float,  # grams
        target_weight: float,  # grams
        sgr: float  # percentage
    ) -> Optional[int]:
        """
        Calculate days = (ln(target) - ln(current)) / (SGR / 100)
        
        Args:
            current_weight: Current average weight in grams
            target_weight: Target harvest weight in grams
            sgr: Specific Growth Rate percentage
            
        Returns:
            Days remaining until harvest or None if cannot calculate
        """
        if current_weight <= 0 or target_weight <= 0 or sgr is None or sgr <= 0:
            return None
        
        if current_weight >= target_weight:
            return 0  # Already at target weight
        
        try:
            days_remaining = (math.log(target_weight) - math.log(current_weight)) / (sgr / 100)
            return max(0, round(days_remaining))
        except (ValueError, ZeroDivisionError):
            return None
    
    @staticmethod
    def get_harvest_prediction(
        batch: Batch,
        target_weight: float,
        db: Session
    ) -> Optional[Dict]:
        """
        Get complete harvest prediction with confidence
        
        Args:
            batch: Batch object
            target_weight: Target harvest weight
            db: Database session
            
        Returns:
            Dictionary with prediction details or None
        """
        if not batch or not batch.sgr:
            return None
        
        days_remaining = HarvestPredictor.predict_harvest_date(
            batch.avg_weight,
            target_weight,
            batch.sgr
        )
        
        if days_remaining is None:
            return None
        
        predicted_date = datetime.now() + timedelta(days=days_remaining)
        confidence = WeightPredictor.get_prediction_confidence(batch, db)
        
        return {
            "batch_id": batch.id,
            "batch_code": batch.batch_code,
            "current_avg_weight": batch.avg_weight,
            "target_weight": target_weight,
            "days_remaining": days_remaining,
            "predicted_harvest_date": predicted_date.date(),
            "sgr_used": batch.sgr,
            "confidence_level": confidence
        }


class FeedingCalculator:
    """Calculates recommended feeding amounts"""
    
    # Feeding rates by stage (min, max) as percentage of biomass
    FEEDING_RATES = {
        "fry": (0.15, 0.18),          # 15-18% for fry (زريعة)
        "nursery": (0.10, 0.15),      # 10-15% for nursery/fingerlings (تحضين/إصبعيات)
        "juveniles": (0.05, 0.10),    # 5-10% for juveniles (تربية)
        "fattening": (0.01, 0.03),    # 1-3% for fattening (تسمين)
        "harvest": (0.01, 0.02)       # 1-2% for harvest ready (حصاد)
    }
    
    # Meals per day by stage
    MEALS_PER_DAY = {
        "fry": 6,           # 6 meals for fry
        "nursery": 4,       # 4 meals for nursery/fingerlings
        "juveniles": 3,     # 3 meals for juveniles
        "fattening": 2,     # 2 meals for fattening
        "harvest": 2        # 2 meals for harvest ready
    }
    
    # Feed types by stage
    FEED_TYPES = {
        "fry": "starter",
        "nursery": "starter",
        "juveniles": "grower",
        "fattening": "fattening",
        "harvest": "fattening"
    }
    
    @staticmethod
    def calculate_daily_feed(
        biomass: float,  # kg
        stage: str
    ) -> Tuple[float, float]:
        """
        Calculate min and max daily feed amount
        
        Args:
            biomass: Total biomass in kg
            stage: Lifecycle stage
            
        Returns:
            Tuple of (min_feed_kg, max_feed_kg)
        """
        if biomass <= 0:
            return (0.0, 0.0)
        
        rates = FeedingCalculator.FEEDING_RATES.get(stage, (0.03, 0.05))
        
        min_feed = biomass * rates[0]
        max_feed = biomass * rates[1]
        
        return (round(min_feed, 2), round(max_feed, 2))
    
    @staticmethod
    def get_feeding_schedule(batch: Batch, db: Session) -> Dict:
        """
        Get complete feeding schedule for batch
        
        Args:
            batch: Batch object
            db: Database session
            
        Returns:
            Dictionary with feeding schedule details
        """
        if not batch or not batch.biomass:
            return {}
        
        biomass_kg = batch.biomass / 1000.0
        min_feed, max_feed = FeedingCalculator.calculate_daily_feed(biomass_kg, batch.stage)
        
        meals_per_day = FeedingCalculator.MEALS_PER_DAY.get(batch.stage, 3)
        feed_type = FeedingCalculator.FEED_TYPES.get(batch.stage, "grower")
        
        # Calculate per-meal amounts
        min_per_meal = min_feed / meals_per_day if meals_per_day > 0 else 0
        max_per_meal = max_feed / meals_per_day if meals_per_day > 0 else 0
        
        return {
            "batch_id": batch.id,
            "batch_code": batch.batch_code,
            "stage": batch.stage,
            "biomass_kg": round(biomass_kg, 2),
            "daily_feed_min_kg": min_feed,
            "daily_feed_max_kg": max_feed,
            "recommended_feed_kg": round((min_feed + max_feed) / 2, 2),
            "meals_per_day": meals_per_day,
            "feed_per_meal_min_kg": round(min_per_meal, 2),
            "feed_per_meal_max_kg": round(max_per_meal, 2),
            "feed_type": feed_type
        }
    
    @staticmethod
    def validate_feed_type(stage: str, feed_type: str) -> bool:
        """
        Validate if feed type is appropriate for stage
        
        Args:
            stage: Lifecycle stage
            feed_type: Feed type to validate
            
        Returns:
            True if valid, False otherwise
        """
        expected_type = FeedingCalculator.FEED_TYPES.get(stage)
        return feed_type == expected_type
