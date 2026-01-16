#!/bin/bash
set -euo pipefail

################################################################################
# FantasyRealm Online - Railway Staging Environment Setup
#
# This script helps you set up the Railway staging environment.
# It guides you through the process of creating Railway services and
# configuring environment variables.
#
# Prerequisites:
#   - Railway CLI installed (https://docs.railway.app/develop/cli)
#   - Railway account created
#   - Logged in via: railway login
#
# Usage:
#   ./setup-railway-staging.sh
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}FantasyRealm Railway Staging Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}Error: Railway CLI not found${NC}"
    echo ""
    echo "Please install Railway CLI:"
    echo "  npm install -g @railway/cli"
    echo ""
    echo "Or visit: https://docs.railway.app/develop/cli"
    exit 1
fi

echo -e "${GREEN}✓ Railway CLI found${NC}"
echo ""

# Check if logged in
echo -e "${YELLOW}Checking Railway authentication...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${RED}Error: Not logged in to Railway${NC}"
    echo ""
    echo "Please login first:"
    echo "  railway login"
    exit 1
fi

RAILWAY_USER=$(railway whoami)
echo -e "${GREEN}✓ Logged in as: $RAILWAY_USER${NC}"
echo ""

# Project setup
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Step 1: Project Setup${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo "This script will guide you through creating a Railway project for staging."
echo ""
echo -e "${YELLOW}Options:${NC}"
echo "  1. Create a new Railway project"
echo "  2. Link to an existing Railway project"
echo ""
read -p "Choose option (1 or 2): " PROJECT_OPTION

if [ "$PROJECT_OPTION" = "1" ]; then
    echo ""
    echo -e "${YELLOW}Creating new Railway project...${NC}"
    railway init --name "fantasyrealm-staging"
    echo -e "${GREEN}✓ Project created${NC}"
elif [ "$PROJECT_OPTION" = "2" ]; then
    echo ""
    echo -e "${YELLOW}Linking to existing project...${NC}"
    railway link
    echo -e "${GREEN}✓ Project linked${NC}"
else
    echo -e "${RED}Invalid option${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Step 2: PostgreSQL Database${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo "Railway will provision a PostgreSQL database for you."
echo ""
read -p "Create PostgreSQL database? (y/n): " CREATE_POSTGRES

if [ "$CREATE_POSTGRES" = "y" ]; then
    echo -e "${YELLOW}Creating PostgreSQL service...${NC}"
    railway add --database postgres
    echo -e "${GREEN}✓ PostgreSQL service created${NC}"
    echo ""
    echo -e "${BLUE}Note: DATABASE_URL will be automatically available as an environment variable${NC}"
fi

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Step 3: Backend API Service${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo "Now we'll create the .NET API service."
echo ""
echo -e "${YELLOW}Setting up backend service...${NC}"

# The backend will be deployed via GitHub Actions, but we need to create the service
echo ""
echo "You'll need to configure the following in Railway dashboard:"
echo ""
echo -e "${YELLOW}1. Root Directory:${NC} src/backend"
echo -e "${YELLOW}2. Build Command:${NC} dotnet publish -c Release -o out"
echo -e "${YELLOW}3. Start Command:${NC} dotnet out/FantasyRealm.Api.dll"
echo ""
echo "Railway will auto-detect .NET and use Nixpacks to build."
echo ""

read -p "Press Enter to continue..."

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Step 4: Environment Variables${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo "Configure these environment variables in Railway dashboard:"
echo ""
echo -e "${YELLOW}Required variables:${NC}"
echo "  - ASPNETCORE_ENVIRONMENT=Staging"
echo "  - ConnectionStrings__PostgreSQL=\${{Postgres.DATABASE_URL}}"
echo "  - ConnectionStrings__MongoDB=<your-mongodb-atlas-connection-string>"
echo "  - Jwt__Secret=<generate-secure-random-string>"
echo "  - Jwt__Issuer=FantasyRealm.Api"
echo "  - Jwt__Audience=FantasyRealm.Client"
echo "  - Jwt__ExpirationMinutes=60"
echo "  - Email__SmtpServer=<smtp-server>"
echo "  - Email__SmtpPort=587"
echo "  - Email__Username=<smtp-username>"
echo "  - Email__Password=<smtp-password>"
echo "  - Email__FromAddress=noreply@fantasy-realm.com"
echo "  - Email__FromName=FantasyRealm Online"
echo "  - Email__BaseUrl=<vercel-preview-url>"
echo ""
echo -e "${BLUE}Tip: You can set these via Railway CLI:${NC}"
echo "  railway variables set KEY=VALUE"
echo ""

read -p "Press Enter when variables are configured..."

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Step 5: GitHub Actions Integration${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo "To enable automatic deployments from GitHub Actions:"
echo ""
echo -e "${YELLOW}1. Get your Railway API token:${NC}"
echo "   railway tokens"
echo ""
echo -e "${YELLOW}2. Add to GitHub Secrets:${NC}"
echo "   - Go to: https://github.com/<your-repo>/settings/secrets/actions"
echo "   - Add secret: RAILWAY_TOKEN_STAGING"
echo "   - Paste your Railway token"
echo ""
echo -e "${YELLOW}3. Get your Railway Service ID:${NC}"
echo "   railway service"
echo ""
echo -e "${YELLOW}4. Add to GitHub Secrets:${NC}"
echo "   - Add secret: RAILWAY_SERVICE_ID_STAGING"
echo "   - Paste your service ID"
echo ""

read -p "Press Enter when GitHub secrets are configured..."

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Step 6: Database Migration${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo "Initial database setup will be done automatically by GitHub Actions"
echo "when you push to the develop branch."
echo ""
echo "Alternatively, you can run migrations manually:"
echo ""
echo "  DATABASE_URL=\$(railway variables get DATABASE_URL)"
echo "  ./infra/scripts/migrate-database.sh \"\$DATABASE_URL\""
echo ""

read -p "Run initial migration now? (y/n): " RUN_MIGRATION

if [ "$RUN_MIGRATION" = "y" ]; then
    echo ""
    echo -e "${YELLOW}Running database migrations...${NC}"
    DATABASE_URL=$(railway variables get DATABASE_URL)

    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}Error: DATABASE_URL not found${NC}"
        echo "Please ensure PostgreSQL service is running"
        exit 1
    fi

    bash "$(dirname "$0")/migrate-database.sh" "$DATABASE_URL"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Railway Staging Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Verify all environment variables in Railway dashboard"
echo "  2. Push to develop branch to trigger automatic deployment"
echo "  3. Check Railway logs: railway logs"
echo "  4. Get service URL: railway domain"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  railway logs          # View logs"
echo "  railway status        # Check service status"
echo "  railway open          # Open Railway dashboard"
echo "  railway variables     # List environment variables"
echo ""
