-- ============================================================================
-- 004: Evolve characters table
-- Adds class_id, status workflow, hair_style, face_shape, timestamps.
-- Replaces is_authorized with a status column (draft/pending/approved/rejected).
-- ============================================================================

-- Drop the old gallery index that references is_authorized
DROP INDEX IF EXISTS idx_characters_gallery;

-- Remove the is_authorized column
ALTER TABLE characters DROP COLUMN IF EXISTS is_authorized;

-- Add new columns
ALTER TABLE characters
    ADD COLUMN class_id INTEGER NOT NULL DEFAULT 1 REFERENCES character_classes(id) ON DELETE RESTRICT,
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'draft',
    ADD COLUMN hair_style VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN face_shape VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Remove defaults that were only needed for the migration
ALTER TABLE characters
    ALTER COLUMN class_id DROP DEFAULT,
    ALTER COLUMN hair_style DROP DEFAULT,
    ALTER COLUMN face_shape DROP DEFAULT;

-- Recreate gallery index using status instead of is_authorized
CREATE INDEX idx_characters_gallery ON characters(is_shared, status)
    WHERE is_shared = TRUE AND status = 'approved';

-- Index for filtering by status (moderation views)
CREATE INDEX idx_characters_status ON characters(status);
