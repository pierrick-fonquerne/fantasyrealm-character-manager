#!/bin/bash

# FantasyRealm Character Manager - Stop Script
# Stops the Docker containers without removing volumes.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Stopping FantasyRealm services..."

docker compose -f "$ROOT_DIR/infra/docker-compose.yml" --env-file "$ROOT_DIR/.env" down

echo "✓ Services stopped"
