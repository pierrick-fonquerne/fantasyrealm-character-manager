#!/bin/bash

# FantasyRealm Character Manager - Start Script
# Starts the Docker containers.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Starting FantasyRealm services..."

if [ ! -f "$ROOT_DIR/.env" ]; then
    echo "❌ .env file not found. Run ./scripts/install.sh first."
    exit 1
fi

docker compose -f "$ROOT_DIR/infra/docker-compose.yml" --env-file "$ROOT_DIR/.env" up -d

echo ""
echo "✓ Services started"
echo ""
echo "  • API:        http://localhost:5000"
echo "  • PostgreSQL: localhost:5432"
echo "  • MongoDB:    localhost:27017"
