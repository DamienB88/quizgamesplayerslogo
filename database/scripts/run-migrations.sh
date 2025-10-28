#!/bin/bash

# Database Migration Runner Script
# Runs all SQL migration files in order

set -e # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MIGRATIONS_DIR="$(dirname "$0")/../migrations"
SUPABASE_DB_URL="${SUPABASE_DB_URL:-}"

echo -e "${GREEN}=== Privacy Social Database Migration Runner ===${NC}\n"

# Check if Supabase URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}Error: SUPABASE_DB_URL environment variable is not set${NC}"
    echo "Set it using:"
    echo "  export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres'"
    exit 1
fi

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}Error: Migrations directory not found: $MIGRATIONS_DIR${NC}"
    exit 1
fi

# Count migration files
MIGRATION_COUNT=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l)

if [ "$MIGRATION_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}No migration files found in $MIGRATIONS_DIR${NC}"
    exit 0
fi

echo -e "Found ${GREEN}$MIGRATION_COUNT${NC} migration files\n"

# Run migrations in order
for migration_file in "$MIGRATIONS_DIR"/*.sql; do
    filename=$(basename "$migration_file")
    echo -e "${YELLOW}Running migration: $filename${NC}"

    # Execute migration
    if psql "$SUPABASE_DB_URL" -f "$migration_file" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $filename completed successfully${NC}\n"
    else
        echo -e "${RED}✗ $filename failed${NC}"
        echo -e "${RED}Error details:${NC}"
        psql "$SUPABASE_DB_URL" -f "$migration_file"
        exit 1
    fi
done

echo -e "${GREEN}=== All migrations completed successfully! ===${NC}"
echo -e "\nDatabase schema is up to date."
