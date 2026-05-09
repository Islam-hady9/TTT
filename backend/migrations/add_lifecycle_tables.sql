-- Migration: Add Fish Lifecycle Management Tables
-- Date: 2026-05-08
-- Description: Adds batch_history, samplings, transfers, and alerts tables
--              Also extends batches table with calculated fields

-- ============================================
-- Step 1: Add new columns to batches table
-- ============================================

ALTER TABLE batches ADD COLUMN biomass FLOAT;
ALTER TABLE batches ADD COLUMN total_feed_consumed FLOAT DEFAULT 0.0;
ALTER TABLE batches ADD COLUMN fcr FLOAT;
ALTER TABLE batches ADD COLUMN sgr FLOAT;
ALTER TABLE batches ADD COLUMN mortality_rate FLOAT DEFAULT 0.0;
ALTER TABLE batches ADD COLUMN survival_rate FLOAT DEFAULT 100.0;
ALTER TABLE batches ADD COLUMN previous_avg_weight FLOAT;
ALTER TABLE batches ADD COLUMN last_sampling_date TIMESTAMP;
ALTER TABLE batches ADD COLUMN harvest_date TIMESTAMP;
ALTER TABLE batches ADD COLUMN cycle_duration INTEGER;

-- ============================================
-- Step 2: Create batch_history table
-- ============================================

CREATE TABLE batch_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER NOT NULL,
    action_type VARCHAR NOT NULL,
    from_pond_id INTEGER,
    to_pond_id INTEGER,
    count INTEGER,
    avg_weight FLOAT,
    biomass FLOAT,
    notes TEXT,
    created_by VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (from_pond_id) REFERENCES ponds(id),
    FOREIGN KEY (to_pond_id) REFERENCES ponds(id)
);

-- ============================================
-- Step 3: Create samplings table
-- ============================================

CREATE TABLE samplings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER NOT NULL,
    sample_count INTEGER NOT NULL,
    total_sample_weight FLOAT NOT NULL,
    calculated_avg_weight FLOAT NOT NULL,
    previous_avg_weight FLOAT,
    sgr FLOAT,
    days_since_last INTEGER,
    sampled_by VARCHAR NOT NULL,
    notes TEXT,
    sampled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
);

-- ============================================
-- Step 4: Create transfers table
-- ============================================

CREATE TABLE transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER NOT NULL,
    from_pond_id INTEGER NOT NULL,
    to_pond_id INTEGER NOT NULL,
    transfer_count INTEGER NOT NULL,
    avg_weight FLOAT NOT NULL,
    stage_at_transfer VARCHAR,
    transferred_by VARCHAR NOT NULL,
    notes TEXT,
    transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (from_pond_id) REFERENCES ponds(id),
    FOREIGN KEY (to_pond_id) REFERENCES ponds(id)
);

-- ============================================
-- Step 5: Create alerts table
-- ============================================

CREATE TABLE alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER,
    pond_id INTEGER,
    alert_type VARCHAR NOT NULL,
    severity VARCHAR NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    is_resolved BOOLEAN DEFAULT 0,
    resolved_by VARCHAR,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (pond_id) REFERENCES ponds(id)
);

-- ============================================
-- Step 6: Create indexes for performance
-- ============================================

CREATE INDEX idx_batch_history_batch_id ON batch_history(batch_id);
CREATE INDEX idx_batch_history_action_type ON batch_history(action_type);
CREATE INDEX idx_batch_history_created_at ON batch_history(created_at);

CREATE INDEX idx_samplings_batch_id ON samplings(batch_id);
CREATE INDEX idx_samplings_sampled_at ON samplings(sampled_at);

CREATE INDEX idx_transfers_batch_id ON transfers(batch_id);
CREATE INDEX idx_transfers_transferred_at ON transfers(transferred_at);

CREATE INDEX idx_alerts_batch_id ON alerts(batch_id);
CREATE INDEX idx_alerts_pond_id ON alerts(pond_id);
CREATE INDEX idx_alerts_alert_type ON alerts(alert_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_is_resolved ON alerts(is_resolved);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- ============================================
-- Step 7: Initialize calculated fields for existing batches
-- ============================================

UPDATE batches 
SET biomass = current_count * avg_weight,
    survival_rate = (current_count * 100.0 / initial_count),
    mortality_rate = ((initial_count - current_count) * 100.0 / initial_count)
WHERE biomass IS NULL;

-- ============================================
-- Migration Complete
-- ============================================
