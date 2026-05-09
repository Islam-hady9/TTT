# -*- coding: utf-8 -*-
"""
Update Batch Stages from fingerlings to nursery
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.db.database import SessionLocal
from app.models.pond import Batch

db = SessionLocal()

print("=" * 70)
print("🔄 Updating Batch Stages")
print("=" * 70)

# Update fingerlings to nursery
batches = db.query(Batch).filter(Batch.stage == "fingerlings").all()
print(f"\nFound {len(batches)} batches with stage 'fingerlings'")

for batch in batches:
    print(f"  Updating {batch.batch_code}: fingerlings → nursery")
    batch.stage = "nursery"

db.commit()
print(f"\n✅ Updated {len(batches)} batches")

# Check for batches that need harvest stage
harvest_batches = db.query(Batch).filter(
    Batch.stage == "fattening",
    Batch.avg_weight >= 350
).all()

print(f"\nFound {len(harvest_batches)} batches ready for harvest (≥350g)")

for batch in harvest_batches:
    print(f"  Updating {batch.batch_code}: fattening → harvest ({batch.avg_weight}g)")
    batch.stage = "harvest"

db.commit()
print(f"\n✅ Updated {len(harvest_batches)} batches to harvest stage")

# Summary
print("\n" + "=" * 70)
print("📊 Current Stage Distribution:")
print("=" * 70)

for stage in ["fry", "nursery", "juveniles", "fattening", "harvest"]:
    count = db.query(Batch).filter(Batch.stage == stage).count()
    print(f"  {stage}: {count} batches")

db.close()

print("\n✅ Stage update complete!")
print("=" * 70)
