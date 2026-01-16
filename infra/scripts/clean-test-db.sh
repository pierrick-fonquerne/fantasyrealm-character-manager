#!/bin/bash
set -euo pipefail

################################################################################
# FantasyRealm Online - Clean Test Database
#
# Stops and removes the migration test database container.
# Use this to cleanup after testing migrations.
#
# Usage:
#   ./clean-test-db.sh [--force]
#
# Options:
#   --force    Skip confirmation prompt
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FORCE=false
TEST_CONTAINER_NAME="fantasyrealm-migration-test"

# Parse arguments
if [ $# -gt 0 ] && [ "$1" = "--force" ]; then
    FORCE=true
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Clean Migration Test Database${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if container exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^${TEST_CONTAINER_NAME}$"; then
    echo -e "${YELLOW}No test database container found${NC}"
    echo -e "${BLUE}Container name: $TEST_CONTAINER_NAME${NC}"
    exit 0
fi

# Check if container is running
IS_RUNNING=$(docker ps --format '{{.Names}}' | grep "^${TEST_CONTAINER_NAME}$" || true)

if [ -n "$IS_RUNNING" ]; then
    echo -e "${YELLOW}Container status:${NC} Running"
else
    echo -e "${YELLOW}Container status:${NC} Stopped"
fi

echo ""

# Confirmation
if [ "$FORCE" = false ]; then
    echo -e "${YELLOW}This will remove the test database container and all its data.${NC}"
    echo ""
    read -p "Are you sure? (y/N): " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Cancelled${NC}"
        exit 0
    fi
    echo ""
fi

# Stop container if running
if [ -n "$IS_RUNNING" ]; then
    echo -e "${YELLOW}Stopping container...${NC}"
    docker stop "$TEST_CONTAINER_NAME"
    echo -e "${GREEN}✓ Container stopped${NC}"
fi

# Remove container
echo -e "${YELLOW}Removing container...${NC}"
docker rm "$TEST_CONTAINER_NAME"
echo -e "${GREEN}✓ Container removed${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Cleanup completed${NC}"
echo -e "${GREEN}========================================${NC}"
