#!/bin/bash
set -euo pipefail

################################################################################
# FantasyRealm Online - Database Schema Dump
#
# Dumps the database schema (DDL only, no data) for comparison or backup.
# Useful for comparing local vs staging vs production schemas.
#
# Usage:
#   ./dump-schema.sh <database_url> [output_file]
#
# Examples:
#   ./dump-schema.sh "postgresql://user:pass@localhost:5432/db" schema.sql
#   ./dump-schema.sh "postgresql://user:pass@localhost:5433/test"
#
# Environment detection:
#   ./dump-schema.sh local     # Dumps local dev database
#   ./dump-schema.sh test      # Dumps test database
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUTPUT_DIR="$REPO_ROOT/database/schema-dumps"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Check arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}Error: Missing database URL${NC}"
    echo ""
    echo "Usage: $0 <database_url> [output_file]"
    echo ""
    echo "Shortcuts:"
    echo "  $0 local    # Dump local dev database"
    echo "  $0 test     # Dump test database"
    echo ""
    echo "Full URL:"
    echo "  $0 'postgresql://user:pass@host:5432/dbname' [output.sql]"
    exit 1
fi

# Resolve shortcuts
case "$1" in
    local)
        # Try to get from docker-compose
        if [ -f "$REPO_ROOT/.env" ]; then
            source "$REPO_ROOT/.env"
            DATABASE_URL="postgresql://${POSTGRES_USER:-fantasyrealm}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB:-fantasyrealm}"
            ENV_NAME="local"
        else
            echo -e "${RED}Error: .env file not found${NC}"
            exit 1
        fi
        ;;
    test)
        DATABASE_URL="postgresql://test_user:test_password_123@localhost:5433/fantasyrealm_migration_test"
        ENV_NAME="test"
        ;;
    *)
        DATABASE_URL="$1"
        ENV_NAME="custom"
        ;;
esac

# Determine output file
if [ $# -ge 2 ]; then
    OUTPUT_FILE="$2"
else
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    OUTPUT_FILE="$OUTPUT_DIR/schema_${ENV_NAME}_${TIMESTAMP}.sql"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Database Schema Dump${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Environment:${NC} $ENV_NAME"
echo -e "${YELLOW}Output file:${NC} $OUTPUT_FILE"
echo ""

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}Error: pg_dump not found${NC}"
    echo "Install: sudo apt-get install postgresql-client"
    exit 1
fi

# Test connection
echo -e "${YELLOW}Testing database connection...${NC}"
if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to database${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Connection successful${NC}"
echo ""

# Dump schema
echo -e "${YELLOW}Dumping schema...${NC}"

pg_dump "$DATABASE_URL" \
    --schema-only \
    --no-owner \
    --no-privileges \
    --no-tablespaces \
    --no-security-labels \
    --no-comments \
    > "$OUTPUT_FILE"

echo -e "${GREEN}✓ Schema dumped successfully${NC}"
echo ""

# Statistics
LINES=$(wc -l < "$OUTPUT_FILE")
SIZE=$(du -h "$OUTPUT_FILE" | awk '{print $1}')

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Schema Statistics${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Count objects
TABLES=$(grep -c "CREATE TABLE" "$OUTPUT_FILE" || echo 0)
INDEXES=$(grep -c "CREATE INDEX" "$OUTPUT_FILE" || echo 0)
SEQUENCES=$(grep -c "CREATE SEQUENCE" "$OUTPUT_FILE" || echo 0)
CONSTRAINTS=$(grep -c "ADD CONSTRAINT" "$OUTPUT_FILE" || echo 0)

echo -e "${YELLOW}Tables:${NC}      $TABLES"
echo -e "${YELLOW}Indexes:${NC}     $INDEXES"
echo -e "${YELLOW}Sequences:${NC}   $SEQUENCES"
echo -e "${YELLOW}Constraints:${NC} $CONSTRAINTS"
echo ""
echo -e "${YELLOW}File size:${NC}   $SIZE ($LINES lines)"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Schema dump completed${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Output file:${NC} $OUTPUT_FILE"
echo ""
echo -e "${YELLOW}Compare schemas:${NC}"
echo "  diff $OUTPUT_FILE <other-schema-file>"
echo ""
echo -e "${YELLOW}View schema:${NC}"
echo "  cat $OUTPUT_FILE"
echo ""
