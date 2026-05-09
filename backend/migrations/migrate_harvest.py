"""
Migration Script: Add Harvest Table
Run this script to add the harvests table to the database
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.database import SessionLocal, engine
from sqlalchemy import text
import sqlite3


def run_migration():
    """Run the harvest table migration"""
    print("🚀 Starting harvest table migration...")
    
    # Read SQL file
    sql_file = Path(__file__).parent / "add_harvest_table.sql"
    
    if not sql_file.exists():
        print(f"❌ SQL file not found: {sql_file}")
        return False
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Split SQL statements (remove comments and empty lines)
    statements = []
    for statement in sql_content.split(';'):
        statement = statement.strip()
        # Remove SQL comments
        lines = [line for line in statement.split('\n') 
                if line.strip() and not line.strip().startswith('--')]
        if lines:
            clean_statement = '\n'.join(lines)
            if clean_statement:
                statements.append(clean_statement)
    
    # Execute statements
    db = SessionLocal()
    success_count = 0
    error_count = 0
    
    try:
        for i, statement in enumerate(statements, 1):
            try:
                db.execute(text(statement))
                db.commit()
                success_count += 1
                print(f"✅ Statement {i}/{len(statements)} executed successfully")
            except Exception as e:
                error_msg = str(e)
                # Ignore "already exists" errors
                if "already exists" in error_msg.lower() or "duplicate" in error_msg.lower():
                    print(f"ℹ️  Statement {i}/{len(statements)} skipped (already exists)")
                    success_count += 1
                else:
                    print(f"❌ Statement {i}/{len(statements)} failed: {error_msg}")
                    error_count += 1
        
        print("\n" + "="*60)
        print("📊 Migration Summary:")
        print("="*60)
        print(f"✅ Successful: {success_count}")
        print(f"❌ Failed: {error_count}")
        print("="*60)
        
        if error_count == 0:
            print("\n🎉 Migration completed successfully!")
            print("\n📋 Harvest table structure:")
            print("   - id (PRIMARY KEY)")
            print("   - batch_id (FOREIGN KEY)")
            print("   - pond_id (FOREIGN KEY)")
            print("   - harvest_count")
            print("   - avg_weight")
            print("   - total_harvest_weight")
            print("   - grade_a_count, grade_b_count, grade_c_count")
            print("   - cycle_duration, final_fcr, survival_rate")
            print("   - price_per_kg, total_revenue, buyer_name")
            print("   - status, harvested_by, notes")
            print("   - harvest_date, created_at, updated_at")
            print("\n🔍 Indexes created:")
            print("   - idx_harvests_batch_id")
            print("   - idx_harvests_pond_id")
            print("   - idx_harvests_harvest_date")
            print("   - idx_harvests_status")
            print("   - idx_harvests_harvested_by")
            return True
        else:
            print("\n⚠️  Migration completed with errors")
            return False
            
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def verify_migration():
    """Verify that the migration was successful"""
    print("\n🔍 Verifying migration...")
    
    db = SessionLocal()
    try:
        # Check if harvests table exists
        result = db.execute(text(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='harvests'"
        ))
        table_exists = result.fetchone() is not None
        
        if table_exists:
            print("✅ Harvests table exists")
            
            # Get table info
            result = db.execute(text("PRAGMA table_info(harvests)"))
            columns = result.fetchall()
            print(f"✅ Table has {len(columns)} columns")
            
            # Check indexes
            result = db.execute(text(
                "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='harvests'"
            ))
            indexes = result.fetchall()
            print(f"✅ Table has {len(indexes)} indexes")
            
            return True
        else:
            print("❌ Harvests table does not exist")
            return False
            
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    print("="*60)
    print("🐟 Tibyan Aquaculture - Harvest Table Migration")
    print("="*60)
    print()
    
    # Run migration
    success = run_migration()
    
    if success:
        # Verify migration
        verify_migration()
        print("\n✅ All done! You can now use the harvest endpoints.")
        print("\n📚 API Endpoints:")
        print("   POST   /api/harvests          - Create harvest")
        print("   GET    /api/harvests          - List all harvests")
        print("   GET    /api/harvests/ready    - Get harvest-ready batches")
        print("   GET    /api/harvests/summary  - Get harvest statistics")
        print("   GET    /api/harvests/{id}     - Get harvest details")
        print("   PATCH  /api/harvests/{id}     - Update harvest")
        print("   DELETE /api/harvests/{id}     - Delete harvest")
    else:
        print("\n❌ Migration failed. Please check the errors above.")
        sys.exit(1)
