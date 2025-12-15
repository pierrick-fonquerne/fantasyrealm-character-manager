#!/bin/bash

# FantasyRealm Online Character Manager - Database Migration Script
# This script executes SQL migrations that haven't been run yet.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SQL_DIR="$ROOT_DIR/database/sql"

# Load environment variables from .env file
if [ -f "$ROOT_DIR/.env" ]; then
    set -a
    source "$ROOT_DIR/.env"
    set +a
fi

POSTGRES_USER="${POSTGRES_USER:-fantasyrealm}"
POSTGRES_DB="${POSTGRES_DB:-fantasyrealm}"

echo "Running database migrations..."

# Create __migrations table if it doesn't exist
docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" fantasyrealm-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
CREATE TABLE IF NOT EXISTS __migrations (
    id SERIAL PRIMARY KEY,
    script_name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64)
);"

# Get list of already executed migrations
EXECUTED=$(docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" fantasyrealm-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -A -c "SELECT script_name FROM __migrations ORDER BY script_name;")

# Count migrations to apply
MIGRATIONS_APPLIED=0

# Process each SQL file in order
for SQL_FILE in $(ls "$SQL_DIR"/*.sql 2>/dev/null | sort); do
    FILENAME=$(basename "$SQL_FILE")

    # Skip if already executed
    if echo "$EXECUTED" | grep -q "^${FILENAME}$"; then
        echo "  ⏭ $FILENAME (already applied)"
        continue
    fi

    # Calculate checksum
    CHECKSUM=$(sha256sum "$SQL_FILE" | cut -d ' ' -f 1)

    echo "  ▶ Applying $FILENAME..."

    # Execute the SQL file
    docker exec -i -e PGPASSWORD="$POSTGRES_PASSWORD" fantasyrealm-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$SQL_FILE"

    # Record the migration
    docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" fantasyrealm-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c \
        "INSERT INTO __migrations (script_name, checksum) VALUES ('$FILENAME', '$CHECKSUM');"

    echo "  ✓ $FILENAME applied"
    MIGRATIONS_APPLIED=$((MIGRATIONS_APPLIED + 1))
done

if [ $MIGRATIONS_APPLIED -eq 0 ]; then
    echo "✓ Database is up to date (no new migrations)"
else
    echo "✓ Applied $MIGRATIONS_APPLIED migration(s)"
fi
