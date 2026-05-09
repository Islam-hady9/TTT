"""
Create sample data for testing the Fish Lifecycle Management System
"""
from datetime import datetime, timedelta
from app.db.database import SessionLocal
from app.models.pond import Pond, Batch
from app.models.user import User

def create_sample_data():
    db = SessionLocal()
    
    try:
        print("🚀 Creating sample data...")
        
        # Check if user exists
        user = db.query(User).filter(User.username == "engineer1").first()
        if not user:
            print("❌ User 'engineer1' not found. Please create user first.")
            return
        
        print(f"✅ Found user: {user.username}")
        
        # Create ponds if they don't exist
        ponds_data = [
            # Sample ponds removed as requested
        ]
        
        created_ponds = []
        for pond_data in ponds_data:
            existing_pond = db.query(Pond).filter(Pond.pond_code == pond_data["pond_code"]).first()
            if not existing_pond:
                pond = Pond(**pond_data)
                db.add(pond)
                db.flush()
                created_ponds.append(pond)
                print(f"✅ Created pond: {pond.pond_code}")
            else:
                created_ponds.append(existing_pond)
                print(f"ℹ️  Pond already exists: {existing_pond.pond_code}")
        
        db.commit()
        
        # Create sample batches with different FCR values
        batches_data = [
            # Sample batches removed as requested
        ]
        
        for batch_data in batches_data:
            existing_batch = db.query(Batch).filter(Batch.batch_code == batch_data["batch_code"]).first()
            if not existing_batch:
                batch = Batch(**batch_data)
                db.add(batch)
                print(f"✅ Created batch: {batch.batch_code} (FCR: {batch.fcr}, Stage: {batch.stage})")
            else:
                print(f"ℹ️  Batch already exists: {existing_batch.batch_code}")
        
        db.commit()
        
        # Summary
        total_batches = db.query(Batch).count()
        total_ponds = db.query(Pond).count()
        
        print("\n" + "="*60)
        print("✅ Sample data creation process completed!")
        print("="*60)
        print(f"📊 Total Ponds: {total_ponds}")
        print(f"🐟 Total Batches: {total_batches}")
        print("\n🚀 Now refresh your browser to see the data!")
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
