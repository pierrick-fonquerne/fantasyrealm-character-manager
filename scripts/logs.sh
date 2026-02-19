#!/bin/bash

# FantasyRealm Online Character Manager - Logs Script
# Shows logs from all containers or a specific service.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

SERVICE=$1

if [ -z "$SERVICE" ]; then
    echo "Showing logs for all services (Ctrl+C to exit)..."
    docker compose -f "$ROOT_DIR/infra/docker-compose.yml" --env-file "$ROOT_DIR/.env" logs -f
else
    echo "Showing logs for $SERVICE (Ctrl+C to exit)..."
    docker compose -f "$ROOT_DIR/infra/docker-compose.yml" --env-file "$ROOT_DIR/.env" logs -f "$SERVICE"
fi
