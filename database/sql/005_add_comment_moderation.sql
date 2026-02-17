-- ============================================================================
-- 005: Add comment moderation columns
-- Adds rejection_reason, reviewed_at, reviewed_by_id to the comments table
-- to support employee moderation of user comments.
-- ============================================================================

ALTER TABLE comments
  ADD COLUMN rejection_reason TEXT,
  ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN reviewed_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_comments_reviewed_by ON comments(reviewed_by_id);

-- Record migration
INSERT INTO migration_history (filename, checksum, execution_time_ms, applied_by)
VALUES ('005_add_comment_moderation.sql', 'v1', 0, 'manual')
ON CONFLICT (filename) DO NOTHING;
