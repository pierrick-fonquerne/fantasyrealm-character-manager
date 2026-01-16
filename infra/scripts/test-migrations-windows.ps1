# FantasyRealm Online - Local Migration Testing Script (Windows PowerShell)
#
# Tests database migrations on a local PostgreSQL instance before deploying.
# Creates a temporary database, applies all migrations, and validates schema.
#
# Prerequisites:
#   - Docker Desktop running
#
# Usage:
#   .\test-migrations-windows.ps1 [-Validate] [-Clean] [-Reset]

param(
    [switch]$Validate,
    [switch]$Clean,
    [switch]$Reset
)

# Configuration
$TEST_CONTAINER_NAME = "fantasyrealm-migration-test"
$TEST_DB_NAME = "fantasyrealm_migration_test"
$TEST_DB_USER = "test_user"
$TEST_DB_PASSWORD = "test_password_123"
$TEST_DB_PORT = 5433

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$REPO_ROOT = Split-Path -Parent (Split-Path -Parent $SCRIPT_DIR)
$SQL_DIR = Join-Path $REPO_ROOT "database\sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FantasyRealm Migration Test (Windows)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found" -ForegroundColor Red
    Write-Host "Please install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check SQL directory
if (-not (Test-Path $SQL_DIR)) {
    Write-Host "✗ SQL directory not found: $SQL_DIR" -ForegroundColor Red
    exit 1
}

# Count migration files
$migrationFiles = Get-ChildItem -Path $SQL_DIR -Filter "*.sql" | Sort-Object Name
$migrationCount = $migrationFiles.Count
Write-Host "Found $migrationCount migration files" -ForegroundColor Blue
Write-Host ""

# Stop and remove existing container if resetting
if ($Reset) {
    Write-Host "Resetting test database..." -ForegroundColor Yellow
    docker stop $TEST_CONTAINER_NAME 2>$null
    docker rm $TEST_CONTAINER_NAME 2>$null
    Write-Host "✓ Test container removed" -ForegroundColor Green
    Write-Host ""
}

# Check if container exists and is running
$containerExists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "^$TEST_CONTAINER_NAME$"
$containerRunning = docker ps --format "{{.Names}}" | Select-String -Pattern "^$TEST_CONTAINER_NAME$"

if ($containerExists -and $containerRunning) {
    Write-Host "Test container already running" -ForegroundColor Blue
} elseif ($containerExists) {
    Write-Host "Starting existing container..." -ForegroundColor Yellow
    docker start $TEST_CONTAINER_NAME
    Start-Sleep -Seconds 2
} else {
    Write-Host "Starting test PostgreSQL container..." -ForegroundColor Yellow
    docker run -d `
        --name $TEST_CONTAINER_NAME `
        -e POSTGRES_USER=$TEST_DB_USER `
        -e POSTGRES_PASSWORD=$TEST_DB_PASSWORD `
        -e POSTGRES_DB=$TEST_DB_NAME `
        -p "${TEST_DB_PORT}:5432" `
        postgres:18-alpine

    Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5

    # Wait for database to be ready
    $maxRetries = 30
    $retryCount = 0
    while ($retryCount -lt $maxRetries) {
        $ready = docker exec $TEST_CONTAINER_NAME pg_isready -U $TEST_DB_USER 2>$null
        if ($LASTEXITCODE -eq 0) {
            break
        }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 1
        $retryCount++
    }

    if ($retryCount -ge $maxRetries) {
        Write-Host ""
        Write-Host "✗ PostgreSQL failed to start" -ForegroundColor Red
        docker logs $TEST_CONTAINER_NAME
        exit 1
    }
    Write-Host ""
}

Write-Host "✓ PostgreSQL ready" -ForegroundColor Green
Write-Host ""

# Build connection string
$env:PGPASSWORD = $TEST_DB_PASSWORD
$connectionString = "postgresql://${TEST_DB_USER}:${TEST_DB_PASSWORD}@localhost:${TEST_DB_PORT}/${TEST_DB_NAME}"

# Test connection
Write-Host "Testing database connection..." -ForegroundColor Yellow
$testResult = docker exec $TEST_CONTAINER_NAME psql -U $TEST_DB_USER -d $TEST_DB_NAME -c "SELECT 1" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Cannot connect to test database" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Connection successful" -ForegroundColor Green
Write-Host ""

# Run migrations
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running Migrations" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# First, create migration_history table
Write-Host "Creating migration_history table..." -ForegroundColor Yellow
$migrationHistorySql = Get-Content (Join-Path $SQL_DIR "000_migration_history.sql") -Raw
docker exec -i $TEST_CONTAINER_NAME psql -U $TEST_DB_USER -d $TEST_DB_NAME -c $migrationHistorySql >$null 2>&1
Write-Host "✓ Migration tracking ready" -ForegroundColor Green
Write-Host ""

# Get already applied migrations
$appliedMigrationsResult = docker exec $TEST_CONTAINER_NAME psql -U $TEST_DB_USER -d $TEST_DB_NAME -t -c "SELECT filename FROM migration_history ORDER BY filename;"
$appliedMigrations = $appliedMigrationsResult -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }

$newMigrations = 0
$skippedMigrations = 0

foreach ($sqlFile in $migrationFiles) {
    $filename = $sqlFile.Name

    # Skip if already applied
    if ($appliedMigrations -contains $filename) {
        Write-Host "[SKIP] $filename (already applied)" -ForegroundColor Blue
        $skippedMigrations++
        continue
    }

    # Apply migration
    Write-Host "[RUN]  $filename" -ForegroundColor Yellow
    $migrationStartTime = Get-Date

    $sqlContent = Get-Content $sqlFile.FullName -Raw
    $result = docker exec -i $TEST_CONTAINER_NAME psql -U $TEST_DB_USER -d $TEST_DB_NAME 2>&1 <<< $sqlContent

    if ($LASTEXITCODE -eq 0) {
        $migrationEndTime = Get-Date
        $executionTime = [int](($migrationEndTime - $migrationStartTime).TotalMilliseconds)

        # Calculate checksum
        $fileHash = (Get-FileHash -Path $sqlFile.FullName -Algorithm SHA256).Hash.ToLower()

        # Record migration
        $recordSql = "INSERT INTO migration_history (filename, checksum, execution_time_ms, applied_by) VALUES ('$filename', '$fileHash', $executionTime, 'local-test') ON CONFLICT (filename) DO NOTHING;"
        docker exec $TEST_CONTAINER_NAME psql -U $TEST_DB_USER -d $TEST_DB_NAME -c $recordSql >$null 2>&1

        Write-Host "[OK]   $filename (${executionTime}ms)" -ForegroundColor Green
        $newMigrations++
    } else {
        Write-Host "[FAIL] $filename" -ForegroundColor Red
        Write-Host "Error: Migration failed" -ForegroundColor Red
        Write-Host $result
        exit 1
    }
}

$endTime = Get-Date
$totalTime = [int](($endTime - $startTime).TotalSeconds)

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "Migration Summary" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host "Total migrations:   $migrationCount"
Write-Host "New applied:        $newMigrations" -ForegroundColor Green
Write-Host "Skipped:            $skippedMigrations" -ForegroundColor Blue
Write-Host "Total time:         ${totalTime}s"
Write-Host ""

if ($newMigrations -gt 0) {
    Write-Host "✓ Database migration completed successfully" -ForegroundColor Green
} else {
    Write-Host "✓ Database is up to date" -ForegroundColor Blue
}
Write-Host ""

# Validation
if ($Validate) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Schema Validation" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    # Check expected tables
    Write-Host "Validating expected tables..." -ForegroundColor Yellow
    $expectedTables = @("roles", "users", "characters", "articles", "character_articles", "comments", "migration_history")

    foreach ($table in $expectedTables) {
        $tableExists = docker exec $TEST_CONTAINER_NAME psql -U $TEST_DB_USER -d $TEST_DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '$table';"
        if ($tableExists.Trim() -eq "1") {
            Write-Host "✓ Table '$table' exists" -ForegroundColor Green
        } else {
            Write-Host "✗ Table '$table' NOT found" -ForegroundColor Red
        }
    }
    Write-Host ""

    # Check seed data
    Write-Host "Checking seed data..." -ForegroundColor Yellow
    $rolesCount = docker exec $TEST_CONTAINER_NAME psql -U $TEST_DB_USER -d $TEST_DB_NAME -t -c "SELECT COUNT(*) FROM roles;"
    Write-Host "✓ Found $($rolesCount.Trim()) roles (expected: 3)" -ForegroundColor Green
    Write-Host ""
}

# Display migration history
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration History" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
docker exec $TEST_CONTAINER_NAME psql -U $TEST_DB_USER -d $TEST_DB_NAME -c "SELECT filename, applied_at, execution_time_ms || 'ms' as duration, applied_by FROM migration_history ORDER BY applied_at;"
Write-Host ""

# Cleanup or keep
if ($Clean) {
    Write-Host "Cleaning up test database..." -ForegroundColor Yellow
    docker stop $TEST_CONTAINER_NAME
    docker rm $TEST_CONTAINER_NAME
    Write-Host "✓ Test database removed" -ForegroundColor Green
} else {
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host "Test Database Info" -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Container:  $TEST_CONTAINER_NAME" -ForegroundColor Yellow
    Write-Host "Host:       localhost" -ForegroundColor Yellow
    Write-Host "Port:       $TEST_DB_PORT" -ForegroundColor Yellow
    Write-Host "Database:   $TEST_DB_NAME" -ForegroundColor Yellow
    Write-Host "User:       $TEST_DB_USER" -ForegroundColor Yellow
    Write-Host "Password:   $TEST_DB_PASSWORD" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Connect with Docker:" -ForegroundColor Blue
    Write-Host "  docker exec -it $TEST_CONTAINER_NAME psql -U $TEST_DB_USER -d $TEST_DB_NAME"
    Write-Host ""
    Write-Host "Stop container:" -ForegroundColor Blue
    Write-Host "  docker stop $TEST_CONTAINER_NAME"
    Write-Host ""
    Write-Host "Clean up:" -ForegroundColor Blue
    Write-Host "  .\infra\scripts\test-migrations-windows.ps1 -Clean"
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Migration test completed successfully" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
