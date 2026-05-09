# -*- coding: utf-8 -*-
"""
Verify Imported Data
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.db.database import SessionLocal
from app.models.pond import Pond, Batch
from app.models.water_quality import WaterQuality
from app.models.feeding import Feeding
from app.models.mortality import Mortality

db = SessionLocal()

print("=" * 70)
print("🐟 مزرعة الإنتاج الوطني - Data Verification")
print("=" * 70)

# Ponds by unit
print("\n📊 PONDS BY UNIT:")
for unit in ['nursery', 'pregrow', 'growout']:
    ponds = db.query(Pond).filter(Pond.unit_type == unit).all()
    print(f"\n  {unit.upper()}: {len(ponds)} ponds")
    for p in ponds[:3]:
        print(f"    - {p.pond_code}")
    if len(ponds) > 3:
        print(f"    ... and {len(ponds)-3} more")

# Batches
print("\n🐠 BATCHES:")
batches = db.query(Batch).all()
print(f"  Total: {len(batches)} batches")
for b in batches[:5]:
    print(f"    - {b.batch_code}: {b.current_count} fish, {b.avg_weight}g, stage={b.stage}")
if len(batches) > 5:
    print(f"    ... and {len(batches)-5} more")

# Water Quality
print("\n💧 WATER QUALITY:")
wq_records = db.query(WaterQuality).all()
print(f"  Total: {len(wq_records)} records")

# Feeding
print("\n🍽️ FEEDING:")
feeding_records = db.query(Feeding).all()
print(f"  Total: {len(feeding_records)} records")
total_feed = sum(f.feed_amount for f in feeding_records)
print(f"  Total feed: {total_feed:.2f} kg")

# Mortality
print("\n☠️ MORTALITY:")
mortality_records = db.query(Mortality).all()
print(f"  Total: {len(mortality_records)} records")
total_dead = sum(m.mortality_count for m in mortality_records)
print(f"  Total dead fish: {total_dead}")

print("\n" + "=" * 70)
print("✅ Verification Complete!")
print("=" * 70)

db.close()
