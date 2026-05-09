import sqlite3
import os

def remove_batches():
    db_path = 'tibyan.db'
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Target batch codes
    batches_to_remove = ['B002', 'B003']
    
    try:
        # Update status to 'harvested' so they disappear from active dashboard
        cursor.execute(
            "UPDATE batches SET status = 'harvested' WHERE batch_code IN (?, ?)", 
            batches_to_remove
        )
        conn.commit()
        print(f"Successfully removed {cursor.rowcount} batches (B002, B003) from active unit.")
    except Exception as e:
        print(f"Error updating database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    remove_batches()
