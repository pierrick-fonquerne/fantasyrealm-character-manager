-- ============================================================================
-- FantasyRealm Online Character Manager - Migration Tracking
-- PostgreSQL 18+
-- ============================================================================

-- ============================================================================
-- TABLE: migration_history
-- Tracks applied database migrations to prevent re-execution
-- ============================================================================
CREATE TABLE IF NOT EXISTS migration_history (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64) NOT NULL,
    execution_time_ms INTEGER,
    applied_by VARCHAR(100) DEFAULT 'system'
);

CREATE INDEX idx_migration_history_filename ON migration_history(filename);
CREATE INDEX idx_migration_history_applied_at ON migration_history(applied_at DESC);

-- Insert initial entry for migration tracking system itself
INSERT INTO migration_history (filename, checksum, execution_time_ms, applied_by)
VALUES ('000_migration_history.sql', 'initial', 0, 'system')
ON CONFLICT (filename) DO NOTHING;
