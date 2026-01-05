-- ============================================================================
-- Migration: Add audit columns to user table
-- ============================================================================

-- Add created_at and updated_at columns for audit trail
ALTER TABLE "user"
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Increase password column size to accommodate Argon2 hashes (~128 chars)
ALTER TABLE "user"
    ALTER COLUMN password TYPE VARCHAR(255);

-- Rename password to password_hash for clarity
ALTER TABLE "user"
    RENAME COLUMN password TO password_hash;

-- Increase email column size (RFC 5321 allows up to 254 chars)
ALTER TABLE "user"
    ALTER COLUMN email TYPE VARCHAR(255);

-- Create trigger to auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
