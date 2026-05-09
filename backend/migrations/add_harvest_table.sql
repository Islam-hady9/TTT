-- Migration: Add Harvest Table
-- Description: Creates the harvests table for tracking harvest operations
-- Date: 2026-05-09

-- Create harvests table
CREATE TABLE IF NOT EXISTS harvests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER NOT NULL,
    pond_id INTEGER NOT NULL,
    
    -- Harvest data
    harvest_count INTEGER NOT NULL,
    avg_weight FLOAT NOT NULL,
    total_harvest_weight FLOAT NOT NULL,
    
    -- Quality metrics
    grade_a_count INTEGER DEFAULT 0,
    grade_b_count INTEGER DEFAULT 0,
    grade_c_count INTEGER DEFAULT 0,
    
    -- Production metrics
    cycle_duration INTEGER,
    final_fcr FLOAT,
    survival_rate FLOAT,
    total_feed_consumed FLOAT,
    
    -- Financial data
    price_per_kg FLOAT,
    total_revenue FLOAT,
    buyer_name VARCHAR(200),
    
    -- Status
    status VARCHAR(50) DEFAULT 'completed',
    
    -- Metadata
    harvested_by VARCHAR(100) NOT NULL,
    notes TEXT,
    harvest_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (pond_id) REFERENCES ponds(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_harvests_batch_id ON harvests(batch_id);
CREATE INDEX IF NOT EXISTS idx_harvests_pond_id ON harvests(pond_id);
CREATE INDEX IF NOT EXISTS idx_harvests_harvest_date ON harvests(harvest_date);
CREATE INDEX IF NOT EXISTS idx_harvests_status ON harvests(status);
CREATE INDEX IF NOT EXISTS idx_harvests_harvested_by ON harvests(harvested_by);

-- Add harvest_date and cycle_duration to batches if not exists
-- (These columns should already exist from previous migrations)
-- ALTER TABLE batches ADD COLUMN harvest_date TIMESTAMP;
-- ALTER TABLE batches ADD COLUMN cycle_duration INTEGER;

-- Verify table creation
SELECT 'Harvests table created successfully' as message;
