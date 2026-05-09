"""
Lifecycle Manager Service
Manages fish lifecycle stage transitions based on weight thresholds
"""

from typing import Optional, Dict, Tuple
from sqlalchemy.orm import Session
from app.models.pond import Batch

class LifecycleManager:
    """Manages fish lifecycle stage transitions"""
    
    # Stage thresholds: (min_weight, max_weight) in grams
    # Based on actual farm requirements:
    # - Fry (الزريعة): 0-0.5g (eggs + larvae)
    # - Nursery (التحضين/الإصبعيات): 0.5g-40g in Nursery unit
    # - Juveniles (التربية): 40g-200g in Pregrow unit
    # - Fattening (التسمين): 200g+ in Grow out unit
    # - Harvest (الحصاد): 350g-600g (optimal: 400-600g)
    STAGE_THRESHOLDS = {
        "fry": (0, 0.5),              # الزريعة - eggs + larvae (0-0.5g)
        "nursery": (0.5, 40.0),       # التحضين/الإصبعيات - 0.5g to 40g (in Nursery)
        "juveniles": (40.0, 200.0),   # التربية - 40g to 200g (in Pregrow)
        "fattening": (200.0, 350.0),  # التسمين - 200g to 350g (in Grow out)
        "harvest": (350.0, float('inf'))  # الحصاد - 350g+ (ready for harvest)
    }
    
    # Stage information for feeding and management
    STAGE_INFO = {
        "fry": {
            "name_en": "Fry",
            "name_ar": "زريعة",
            "duration_days": "0-14",
            "feed_type": "starter",
            "meals_per_day": 6,
            "feeding_rate": (0.15, 0.18),  # 15-18% of biomass
            "unit_type": "nursery",
            "weight_range": "0-0.5g",
            "description_en": "Fry stage - eggs and larvae (0-0.5g)",
            "description_ar": "مرحلة الزريعة - بيض ويرقات (0-0.5 جرام)"
        },
        "nursery": {
            "name_en": "Nursery (Fingerlings)",
            "name_ar": "تحضين (إصبعيات)",
            "duration_days": "14-45",
            "feed_type": "starter",
            "meals_per_day": 4,
            "feeding_rate": (0.10, 0.15),  # 10-15% of biomass
            "unit_type": "nursery",
            "weight_range": "0.5g - 40g",
            "description_en": "Nursery stage - fingerlings 0.5g to 40g",
            "description_ar": "مرحلة التحضين - إصبعيات من 0.5 إلى 40 جرام"
        },
        "juveniles": {
            "name_en": "Juveniles (Pregrow)",
            "name_ar": "تربية",
            "duration_days": "45-90",
            "feed_type": "grower",
            "meals_per_day": 3,
            "feeding_rate": (0.05, 0.10),  # 5-10% of biomass
            "unit_type": "pregrow",
            "weight_range": "40g - 200g",
            "description_en": "Juveniles stage - 40g to 200g in Pregrow unit",
            "description_ar": "مرحلة التربية - من 40 إلى 200 جرام في وحدة التربية"
        },
        "fattening": {
            "name_en": "Fattening (Grow out)",
            "name_ar": "تسمين",
            "duration_days": "90-150",
            "feed_type": "fattening",
            "meals_per_day": 2,
            "feeding_rate": (0.01, 0.03),  # 1-3% of biomass
            "unit_type": "growout",
            "weight_range": "200g - 350g",
            "description_en": "Fattening stage - 200g to 350g in Grow out unit",
            "description_ar": "مرحلة التسمين - من 200 إلى 350 جرام في وحدة التسمين"
        },
        "harvest": {
            "name_en": "Harvest Ready",
            "name_ar": "جاهز للحصاد",
            "duration_days": "150+",
            "feed_type": "fattening",
            "meals_per_day": 2,
            "feeding_rate": (0.01, 0.02),  # 1-2% of biomass
            "unit_type": "growout",
            "weight_range": "350g - 600g",
            "description_en": "Harvest ready - 350g to 600g (optimal: 400-600g)",
            "description_ar": "جاهز للحصاد - من 350 إلى 600 جرام (المثالي: 400-600 جرام)"
        }
    }
    
    def determine_stage(self, avg_weight: float) -> str:
        """
        Determine lifecycle stage based on average weight
        
        Args:
            avg_weight: Average weight in grams
            
        Returns:
            Stage name (eggs, fry, fingerlings, juveniles, young_fish, fattening)
        """
        if avg_weight < 0:
            raise ValueError("Average weight cannot be negative")
        
        for stage, (min_weight, max_weight) in self.STAGE_THRESHOLDS.items():
            if min_weight <= avg_weight < max_weight:
                return stage
        
        # If weight exceeds all thresholds, return fattening
        return "fattening"
    
    def update_stage(self, batch: Batch, db: Session) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Update batch stage if weight threshold crossed
        
        Args:
            batch: Batch object to update
            db: Database session
            
        Returns:
            Tuple of (stage_changed: bool, old_stage: str, new_stage: str)
        """
        if not batch or not batch.avg_weight:
            return False, None, None
        
        old_stage = batch.stage
        new_stage = self.determine_stage(batch.avg_weight)
        
        if old_stage != new_stage:
            batch.stage = new_stage
            db.commit()
            db.refresh(batch)
            return True, old_stage, new_stage
        
        return False, old_stage, old_stage
    
    def get_stage_info(self, stage: str) -> Optional[Dict]:
        """
        Get feeding and management info for stage
        
        Args:
            stage: Stage name
            
        Returns:
            Dictionary with stage information or None if stage not found
        """
        return self.STAGE_INFO.get(stage)
    
    def get_all_stages(self) -> Dict:
        """
        Get information for all stages
        
        Returns:
            Dictionary with all stage information
        """
        return self.STAGE_INFO
    
    def get_next_stage(self, current_stage: str) -> Optional[str]:
        """
        Get the next stage in lifecycle
        
        Args:
            current_stage: Current stage name
            
        Returns:
            Next stage name or None if already at final stage
        """
        stages_order = ["fry", "nursery", "juveniles", "fattening", "harvest"]
        
        try:
            current_index = stages_order.index(current_stage)
            if current_index < len(stages_order) - 1:
                return stages_order[current_index + 1]
        except ValueError:
            pass
        
        return None
    
    def get_transfer_readiness(self, batch: Batch) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Check if batch is ready for transfer to next unit
        
        Args:
            batch: Batch object to check
            
        Returns:
            Tuple of (is_ready: bool, current_unit: str, target_unit: str)
        """
        if not batch or not batch.stage:
            return False, None, None
        
        stage_info = self.get_stage_info(batch.stage)
        if not stage_info:
            return False, None, None
        
        current_unit = stage_info["unit_type"]
        
        # Check if ready to transfer based on stage and weight
        if batch.stage == "nursery" and batch.avg_weight >= 40.0:
            # Ready to transfer from Nursery (التحضين) to Pregrow (التربية)
            return True, "nursery", "pregrow"
        elif batch.stage == "juveniles" and batch.avg_weight >= 200.0:
            # Ready to transfer from Pregrow (التربية) to Grow out (التسمين)
            return True, "pregrow", "growout"
        elif batch.stage == "fattening" and batch.avg_weight >= 350.0:
            # Ready for harvest
            return True, "growout", "harvest"
        
        return False, current_unit, current_unit
    
    def validate_stage_transition(self, from_stage: str, to_stage: str, avg_weight: float) -> Tuple[bool, str]:
        """
        Validate if stage transition is allowed based on weight
        
        Args:
            from_stage: Current stage
            to_stage: Target stage
            avg_weight: Current average weight
            
        Returns:
            Tuple of (is_valid: bool, message: str)
        """
        if from_stage == to_stage:
            return True, "No stage change"
        
        # Get expected stage based on weight
        expected_stage = self.determine_stage(avg_weight)
        
        if to_stage != expected_stage:
            return False, f"Weight {avg_weight}g indicates stage should be '{expected_stage}', not '{to_stage}'"
        
        # Check if stages are in correct order
        stages_order = ["fry", "nursery", "juveniles", "fattening", "harvest"]
        
        try:
            from_index = stages_order.index(from_stage)
            to_index = stages_order.index(to_stage)
            
            if to_index < from_index:
                return False, "Cannot move backwards in lifecycle stages"
            
            if to_index - from_index > 1:
                return False, f"Cannot skip stages. Next stage after '{from_stage}' should be '{stages_order[from_index + 1]}'"
        except ValueError:
            return False, f"Invalid stage name: '{from_stage}' or '{to_stage}'"
        
        return True, "Stage transition is valid"
