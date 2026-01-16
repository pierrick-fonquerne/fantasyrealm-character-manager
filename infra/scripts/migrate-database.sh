#!/bin/bash
set -euo pipefail

################################################################################
# FantasyRealm Online - Database Migration Script
#
# Applies SQL migrations from database/sql/ directory in order.
# Tracks applied migrations in migration_history table.
# Idempotent: safe to run multiple times.
#
# Usage:
#   ./migrate-database.sh <database_url>
#
# Example:
#   ./migrate-database.sh "postgresql://user:pass@host:5432/dbname"
################################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -ne 1 ]; then
    echo -e "${RED}Error: Missing database URL${NC}"
    echo "Usage: $0 <database_url>"
    echo "Example: $0 'postgresql://user:pass@host:5432/dbname'"
    exit 1
fi

DATABASE_URL="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SQL_DIR="$REPO_ROOT/database/sql"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}FantasyRealm Migration Tool${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if SQL directory exists
if [ ! -d "$SQL_DIR" ]; then
    echo -e "${RED}Error: SQL directory not found: $SQL_DIR${NC}"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found${NC}"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

# Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"
if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to database${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database connection successful${NC}"
echo ""

# Create migration_history table if it doesn't exist
echo -e "${YELLOW}Ensuring migration_history table exists...${NC}"
psql "$DATABASE_URL" -f "$SQL_DIR/000_migration_history.sql" > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Migration tracking ready${NC}"
echo ""

# Get list of already applied migrations
echo -e "${YELLOW}Checking applied migrations...${NC}"
APPLIED_MIGRATIONS=$(psql "$DATABASE_URL" -t -c "SELECT filename FROM migration_history ORDER BY filename;" | tr -d ' ')
echo -e "${GREEN}✓ Found $(echo "$APPLIED_MIGRATIONS" | grep -c . || echo 0) applied migrations${NC}"
echo ""

# Process each SQL file in order
MIGRATION_COUNT=0
NEW_MIGRATIONS=0
SKIPPED_MIGRATIONS=0

for SQL_FILE in "$SQL_DIR"/*.sql; do
    if [ ! -f "$SQL_FILE" ]; then
        continue
    fi

    FILENAME=$(basename "$SQL_FILE")
    MIGRATION_COUNT=$((MIGRATION_COUNT + 1))

    # Skip if already applied
    if echo "$APPLIED_MIGRATIONS" | grep -q "^${FILENAME}$"; then
        echo -e "${BLUE}[SKIP]${NC} $FILENAME (already applied)"
        SKIPPED_MIGRATIONS=$((SKIPPED_MIGRATIONS + 1))
        continue
    fi

    # Apply migration
    echo -e "${YELLOW}[RUN]${NC}  $FILENAME"
    START_TIME=$(date +%s%3N)

    if psql "$DATABASE_URL" -f "$SQL_FILE" > /dev/null 2>&1; then
        END_TIME=$(date +%s%3N)
        EXECUTION_TIME=$((END_TIME - START_TIME))

        # Calculate checksum
        if command -v sha256sum &> /dev/null; then
            CHECKSUM=$(sha256sum "$SQL_FILE" | awk '{print $1}')
        else
            CHECKSUM=$(shasum -a 256 "$SQL_FILE" | awk '{print $1}')
        fi

        # Record migration in history
        psql "$DATABASE_URL" -c "
            INSERT INTO migration_history (filename, checksum, execution_time_ms, applied_by)
            VALUES ('$FILENAME', '$CHECKSUM', $EXECUTION_TIME, 'github-actions')
            ON CONFLICT (filename) DO NOTHING;
        " > /dev/null 2>&1

        echo -e "${GREEN}[OK]${NC}   $FILENAME (${EXECUTION_TIME}ms)"
        NEW_MIGRATIONS=$((NEW_MIGRATIONS + 1))
    else
        echo -e "${RED}[FAIL]${NC} $FILENAME"
        echo -e "${RED}Error: Migration failed${NC}"
        exit 1
    fi
done

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Migration Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total migrations:   $MIGRATION_COUNT"
echo -e "New applied:        ${GREEN}$NEW_MIGRATIONS${NC}"
echo -e "Skipped:            ${BLUE}$SKIPPED_MIGRATIONS${NC}"
echo ""

if [ $NEW_MIGRATIONS -gt 0 ]; then
    echo -e "${GREEN}✓ Database migration completed successfully${NC}"
else
    echo -e "${BLUE}✓ Database is up to date${NC}"
fi
