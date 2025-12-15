#!/bin/bash

# FantasyRealm Online Character Manager - Installation Script
# This script sets up the local development environment with Docker Compose.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=========================================="
echo "  FantasyRealm Online Character Manager"
echo "  Local Development Setup"
echo "=========================================="
echo ""

# Step 1: Check Docker is installed
echo "[1/5] Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    echo "   https://www.docker.com/products/docker-desktop/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✓ Docker is installed and running"

# Step 2: Generate .env file with secure passwords
echo ""
echo "[2/5] Configuring environment variables..."

if [ ! -f "$ROOT_DIR/.env" ]; then
    # Generate random passwords (16 characters, URL-safe)
    POSTGRES_PWD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16)
    MONGO_PWD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16)
    PGADMIN_PWD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16)

    # Create .env from template
    sed -e "s/__POSTGRES_PASSWORD__/$POSTGRES_PWD/" \
        -e "s/__MONGO_PASSWORD__/$MONGO_PWD/" \
        -e "s/__PGADMIN_PASSWORD__/$PGADMIN_PWD/" \
        "$ROOT_DIR/.env.example" > "$ROOT_DIR/.env"

    echo "✓ Generated .env with secure passwords"
else
    echo "✓ .env already exists (skipped)"
fi

# Step 3: Start Docker containers
echo ""
echo "[3/5] Starting Docker containers..."
docker compose -f "$ROOT_DIR/infra/docker-compose.yml" --env-file "$ROOT_DIR/.env" up -d --build

# Step 4: Wait for services to be healthy
echo ""
echo "[4/5] Waiting for services to be ready..."

echo "  Waiting for PostgreSQL..."
timeout=60
elapsed=0
while ! docker exec fantasyrealm-postgres pg_isready -U fantasyrealm &> /dev/null; do
    if [ $elapsed -ge $timeout ]; then
        echo "❌ PostgreSQL failed to start within ${timeout}s"
        exit 1
    fi
    sleep 2
    elapsed=$((elapsed + 2))
done
echo "  ✓ PostgreSQL is ready"

echo "  Waiting for MongoDB..."
elapsed=0
while ! docker exec fantasyrealm-mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; do
    if [ $elapsed -ge $timeout ]; then
        echo "❌ MongoDB failed to start within ${timeout}s"
        exit 1
    fi
    sleep 2
    elapsed=$((elapsed + 2))
done
echo "  ✓ MongoDB is ready"

# Step 5: Run database migrations
echo ""
echo "[5/5] Running database migrations..."
"$SCRIPT_DIR/migrate.sh"

# Display summary
echo ""
echo "=========================================="
echo "  ✓ Installation Complete!"
echo "=========================================="
echo ""
echo "Services running:"
echo "  • Frontend:   http://localhost:5173"
echo "  • API:        http://localhost:5000"
echo "  • Swagger:    http://localhost:5000/swagger"
echo "  • pgAdmin:    http://localhost:5050"
echo "  • PostgreSQL: localhost:5432"
echo "  • MongoDB:    localhost:27017"
echo ""
echo "pgAdmin credentials:"
echo "  • Email:    contact@fantasy-realm.com"
echo "  • Password: (see .env file)"
echo ""
echo "Useful commands:"
echo "  ./scripts/start.sh     Start the environment"
echo "  ./scripts/stop.sh      Stop the environment"
echo "  ./scripts/logs.sh      View logs"
echo "  ./scripts/migrate.sh   Run new migrations"
echo "  ./scripts/reset-db.sh  Reset databases"
echo ""
