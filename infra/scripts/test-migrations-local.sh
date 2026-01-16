#!/bin/bash
set -euo pipefail

################################################################################
# FantasyRealm Online - Local Migration Testing Script
#
# Tests database migrations on a local PostgreSQL instance before deploying.
# Creates a temporary database, applies all migrations, and validates schema.
#
# Prerequisites:
#   - Docker & Docker Compose installed
#   - PostgreSQL client (psql) installed
#
# Usage:
#   ./test-migrations-local.sh [options]
#
# Options:
#   --clean       Clean up test database after success
#   --keep-db     Keep test database running after test
#   --reset       Reset and re-run all migrations
#   --validate    Run additional schema validation checks
#
# Examples:
#   ./test-migrations-local.sh                    # Run test, keep DB
#   ./test-migrations-local.sh --clean            # Run test, cleanup
#   ./test-migrations-local.sh --reset --validate # Reset and validate
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Default options
CLEAN_UP=false
KEEP_DB=false
RESET_DB=false
VALIDATE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN_UP=true
            shift
            ;;
        --keep-db)
            KEEP_DB=true
            shift
            ;;
        --reset)
            RESET_DB=true
            shift
            ;;
        --validate)
            VALIDATE=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 [--clean] [--keep-db] [--reset] [--validate]"
            exit 1
            ;;
    esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SQL_DIR="$REPO_ROOT/database/sql"

# Test database configuration
TEST_DB_NAME="fantasyrealm_migration_test"
TEST_DB_USER="test_user"
TEST_DB_PASSWORD="test_password_123"
TEST_DB_HOST="localhost"
TEST_DB_PORT="5433"  # Different port to avoid conflict with dev
TEST_CONTAINER_NAME="fantasyrealm-migration-test"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}FantasyRealm Migration Test${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker not found${NC}"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql not found${NC}"
    echo "Install: sudo apt-get install postgresql-client"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# Check if SQL directory exists
if [ ! -d "$SQL_DIR" ]; then
    echo -e "${RED}Error: SQL directory not found: $SQL_DIR${NC}"
    exit 1
fi

# Count migration files
MIGRATION_COUNT=$(find "$SQL_DIR" -name "*.sql" | wc -l)
echo -e "${BLUE}Found $MIGRATION_COUNT migration files${NC}"
echo ""

# Stop and remove existing test container if resetting
if [ "$RESET_DB" = true ]; then
    echo -e "${YELLOW}Resetting test database...${NC}"
    docker stop "$TEST_CONTAINER_NAME" 2>/dev/null || true
    docker rm "$TEST_CONTAINER_NAME" 2>/dev/null || true
    echo -e "${GREEN}✓ Test container removed${NC}"
    echo ""
fi

# Start test PostgreSQL container
echo -e "${YELLOW}Starting test PostgreSQL container...${NC}"

if docker ps -a --format '{{.Names}}' | grep -q "^${TEST_CONTAINER_NAME}$"; then
    if docker ps --format '{{.Names}}' | grep -q "^${TEST_CONTAINER_NAME}$"; then
        echo -e "${BLUE}Test container already running${NC}"
    else
        echo -e "${YELLOW}Starting existing container...${NC}"
        docker start "$TEST_CONTAINER_NAME"
        sleep 2
    fi
else
    docker run -d \
        --name "$TEST_CONTAINER_NAME" \
        -e POSTGRES_USER="$TEST_DB_USER" \
        -e POSTGRES_PASSWORD="$TEST_DB_PASSWORD" \
        -e POSTGRES_DB="$TEST_DB_NAME" \
        -p "${TEST_DB_PORT}:5432" \
        postgres:18-alpine

    echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
    sleep 5

    # Wait for database to be ready
    MAX_RETRIES=30
    RETRY_COUNT=0
    while ! docker exec "$TEST_CONTAINER_NAME" pg_isready -U "$TEST_DB_USER" &>/dev/null; do
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
            echo -e "${RED}Error: PostgreSQL failed to start${NC}"
            docker logs "$TEST_CONTAINER_NAME"
            exit 1
        fi
        echo -n "."
        sleep 1
    done
    echo ""
fi

echo -e "${GREEN}✓ PostgreSQL ready${NC}"
echo ""

# Build connection string
DATABASE_URL="postgresql://${TEST_DB_USER}:${TEST_DB_PASSWORD}@${TEST_DB_HOST}:${TEST_DB_PORT}/${TEST_DB_NAME}"

# Test connection
echo -e "${YELLOW}Testing database connection...${NC}"
if ! PGPASSWORD="$TEST_DB_PASSWORD" psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U "$TEST_DB_USER" -d "$TEST_DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to test database${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Connection successful${NC}"
echo ""

# Run migrations
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Running Migrations${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

START_TIME=$(date +%s)

if bash "$SCRIPT_DIR/migrate-database.sh" "$DATABASE_URL"; then
    END_TIME=$(date +%s)
    TOTAL_TIME=$((END_TIME - START_TIME))
    echo ""
    echo -e "${GREEN}✓ All migrations applied successfully (${TOTAL_TIME}s)${NC}"
else
    echo -e "${RED}✗ Migration failed${NC}"
    echo ""
    echo -e "${YELLOW}Database logs:${NC}"
    docker logs "$TEST_CONTAINER_NAME" --tail 50
    exit 1
fi

echo ""

# Validation checks
if [ "$VALIDATE" = true ]; then
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}Schema Validation${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""

    # Check migration_history table
    echo -e "${YELLOW}Checking migration_history table...${NC}"
    MIGRATION_HISTORY_COUNT=$(PGPASSWORD="$TEST_DB_PASSWORD" psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U "$TEST_DB_USER" -d "$TEST_DB_NAME" -t -c "SELECT COUNT(*) FROM migration_history;" | tr -d ' ')
    echo -e "${GREEN}✓ Found $MIGRATION_HISTORY_COUNT entries in migration_history${NC}"
    echo ""

    # List all tables
    echo -e "${YELLOW}Database tables:${NC}"
    PGPASSWORD="$TEST_DB_PASSWORD" psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U "$TEST_DB_USER" -d "$TEST_DB_NAME" -c "\dt"
    echo ""

    # Check expected tables
    echo -e "${YELLOW}Validating expected tables...${NC}"
    EXPECTED_TABLES=("roles" "users" "characters" "articles" "character_articles" "comments" "migration_history")

    for table in "${EXPECTED_TABLES[@]}"; do
        TABLE_EXISTS=$(PGPASSWORD="$TEST_DB_PASSWORD" psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U "$TEST_DB_USER" -d "$TEST_DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '$table';" | tr -d ' ')

        if [ "$TABLE_EXISTS" -eq "1" ]; then
            echo -e "${GREEN}✓${NC} Table '$table' exists"
        else
            echo -e "${RED}✗${NC} Table '$table' NOT found"
        fi
    done
    echo ""

    # Check indexes
    echo -e "${YELLOW}Checking indexes...${NC}"
    INDEX_COUNT=$(PGPASSWORD="$TEST_DB_PASSWORD" psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U "$TEST_DB_USER" -d "$TEST_DB_NAME" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';" | tr -d ' ')
    echo -e "${GREEN}✓ Found $INDEX_COUNT indexes${NC}"
    echo ""

    # Check foreign keys
    echo -e "${YELLOW}Checking foreign key constraints...${NC}"
    FK_COUNT=$(PGPASSWORD="$TEST_DB_PASSWORD" psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U "$TEST_DB_USER" -d "$TEST_DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';" | tr -d ' ')
    echo -e "${GREEN}✓ Found $FK_COUNT foreign key constraints${NC}"
    echo ""

    # Check initial data (roles)
    echo -e "${YELLOW}Checking seed data...${NC}"
    ROLES_COUNT=$(PGPASSWORD="$TEST_DB_PASSWORD" psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U "$TEST_DB_USER" -d "$TEST_DB_NAME" -t -c "SELECT COUNT(*) FROM roles;" | tr -d ' ')
    echo -e "${GREEN}✓ Found $ROLES_COUNT roles (expected: 3)${NC}"

    if [ "$ROLES_COUNT" -eq "3" ]; then
        PGPASSWORD="$TEST_DB_PASSWORD" psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U "$TEST_DB_USER" -d "$TEST_DB_NAME" -c "SELECT * FROM roles;"
    else
        echo -e "${RED}⚠ Warning: Expected 3 roles, found $ROLES_COUNT${NC}"
    fi
    echo ""
fi

# Display migration history
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Migration History${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
PGPASSWORD="$TEST_DB_PASSWORD" psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U "$TEST_DB_USER" -d "$TEST_DB_NAME" -c "
    SELECT
        filename,
        applied_at,
        execution_time_ms || 'ms' as duration,
        applied_by
    FROM migration_history
    ORDER BY applied_at;
"
echo ""

# Cleanup or keep database
if [ "$CLEAN_UP" = true ]; then
    echo -e "${YELLOW}Cleaning up test database...${NC}"
    docker stop "$TEST_CONTAINER_NAME"
    docker rm "$TEST_CONTAINER_NAME"
    echo -e "${GREEN}✓ Test database removed${NC}"
elif [ "$KEEP_DB" = true ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Test Database Info${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Container:${NC} $TEST_CONTAINER_NAME"
    echo -e "${YELLOW}Host:${NC}      $TEST_DB_HOST"
    echo -e "${YELLOW}Port:${NC}      $TEST_DB_PORT"
    echo -e "${YELLOW}Database:${NC}  $TEST_DB_NAME"
    echo -e "${YELLOW}User:${NC}      $TEST_DB_USER"
    echo -e "${YELLOW}Password:${NC}  $TEST_DB_PASSWORD"
    echo ""
    echo -e "${BLUE}Connect with:${NC}"
    echo "  PGPASSWORD='$TEST_DB_PASSWORD' psql -h $TEST_DB_HOST -p $TEST_DB_PORT -U $TEST_DB_USER -d $TEST_DB_NAME"
    echo ""
    echo -e "${BLUE}Stop container:${NC}"
    echo "  docker stop $TEST_CONTAINER_NAME"
    echo ""
    echo -e "${BLUE}Remove container:${NC}"
    echo "  docker rm $TEST_CONTAINER_NAME"
    echo ""
else
    echo -e "${BLUE}Test database is still running${NC}"
    echo -e "${YELLOW}To stop:${NC} docker stop $TEST_CONTAINER_NAME"
    echo -e "${YELLOW}To remove:${NC} docker rm $TEST_CONTAINER_NAME"
    echo ""
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Migration test completed successfully${NC}"
echo -e "${GREEN}========================================${NC}"
