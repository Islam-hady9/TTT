"""
Migration Script: Add Fish Lifecycle Management Tables
Date: 2026-05-08
Description: Migrates database to add lifecycle tracking tables and fields
"""

import sqlite3
import os
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

def run_migration():
    """Run the lifecycle management migration"""
    
    # Database path
    db_path = Path(__file__).parent.parent / "tibyan.db"
    
    if not db_path.exists():
        print(f"❌ Database not found at: {db_path}")
        print("Please ensure the database exists before running migration.")
        return False
    
    # Backup database first
    backup_path = db_path.parent / f"tibyan_backup_{Path(__file__).stem}.db"
    print(f"📦 Creating backup at: {backup_path}")
    
    try:
        import shutil
        shutil.copy2(db_path, backup_path)
        print("✅ Backup created successfully")
    except Exception as e:
        print(f"❌ Failed to create backup: {e}")
        return False
    
    # Read SQL migration file
    sql_file = Path(__file__).parent / "add_lifecycle_tables.sql"
    
    if not sql_file.exists():
        print(f"❌ SQL file not found at: {sql_file}")
        return False
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_script = f.read()
    
    # Connect to database and run migration
    print(f"\n🔄 Running migration on: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Enable foreign keys
        cursor.execute("PRAGMA foreign_keys = ON")
        
        # Split SQL script into individual statements
        statements = [s.strip() for s in sql_script.split(';') if s.strip() and not s.strip().startswith('--')]
        
        total = len(statements)
        print(f"📝 Executing {total} SQL statements...\n")
        
        for i, statement in enumerate(statements, 1):
            # Skip comments
            if statement.startswith('--'):
                continue
            
            try:
                cursor.execute(statement)
                # Print progress for major operations
                if any(keyword in statement.upper() for keyword in ['ALTER TABLE', 'CREATE TABLE', 'CREATE INDEX']):
                    operation = statement.split()[0:3]
                    print(f"  [{i}/{total}] ✅ {' '.join(operation)}")
            except sqlite3.Error as e:
                # Check if error is about column already existing (safe to ignore)
                if "duplicate column name" in str(e).lower():
                    print(f"  [{i}/{total}] ⚠️  Column already exists (skipping)")
                elif "already exists" in str(e).lower():
                    print(f"  [{i}/{total}] ⚠️  Object already exists (skipping)")
                else:
                    print(f"  [{i}/{total}] ❌ Error: {e}")
                    print(f"     Statement: {statement[:100]}...")
                    raise
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
        # Verify tables were created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = [row[0] for row in cursor.fetchall()]
        
        print("\n📊 Database tables:")
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"  - {table}: {count} rows")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        print(f"\n🔄 Restoring from backup...")
        
        try:
            import shutil
            shutil.copy2(backup_path, db_path)
            print("✅ Database restored from backup")
        except Exception as restore_error:
            print(f"❌ Failed to restore backup: {restore_error}")
            print(f"⚠️  Manual restore required from: {backup_path}")
        
        return False

def rollback_migration():
    """Rollback the migration by restoring from backup"""
    
    db_path = Path(__file__).parent.parent / "tibyan.db"
    backup_path = db_path.parent / f"tibyan_backup_{Path(__file__).stem}.db"
    
    if not backup_path.exists():
        print(f"❌ Backup not found at: {backup_path}")
        return False
    
    try:
        import shutil
        shutil.copy2(backup_path, db_path)
        print(f"✅ Database rolled back from: {backup_path}")
        return True
    except Exception as e:
        print(f"❌ Rollback failed: {e}")
        return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Fish Lifecycle Management Migration")
    parser.add_argument("--rollback", action="store_true", help="Rollback the migration")
    args = parser.parse_args()
    
    print("=" * 60)
    print("🐟 Fish Lifecycle Management Migration")
    print("=" * 60)
    
    if args.rollback:
        print("\n⚠️  ROLLBACK MODE")
        success = rollback_migration()
    else:
        print("\n🚀 MIGRATION MODE")
        success = run_migration()
    
    print("\n" + "=" * 60)
    
    if success:
        print("✅ Operation completed successfully!")
    else:
        print("❌ Operation failed!")
    
    print("=" * 60)
    
    sys.exit(0 if success else 1)
