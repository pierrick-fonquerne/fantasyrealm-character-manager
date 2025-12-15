#!/bin/bash

# FantasyRealm Character Manager - Reset Database Script
# WARNING: This will delete all data and re-run migrations.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "⚠️  WARNING: This will delete ALL data from PostgreSQL and MongoDB!"
echo ""
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Resetting databases..."

# Stop containers and remove volumes
docker compose -f "$ROOT_DIR/infra/docker-compose.yml" --env-file "$ROOT_DIR/.env" down -v

# Restart containers
docker compose -f "$ROOT_DIR/infra/docker-compose.yml" --env-file "$ROOT_DIR/.env" up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
timeout=60
elapsed=0
while ! docker exec fantasyrealm-postgres pg_isready -U fantasyrealm &> /dev/null; do
    if [ $elapsed -ge $timeout ]; then
        echo "❌ PostgreSQL failed to start"
        exit 1
    fi
    sleep 2
    elapsed=$((elapsed + 2))
done

# Run migrations
"$SCRIPT_DIR/migrate.sh"

echo ""
echo "✓ Databases reset successfully"
