#!/usr/bin/env bash
set -euo pipefail

# LaunchTerminal — Database Migration Script
# Usage: ./scripts/migrate.sh [up|down|status]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load environment
if [ -f "$PROJECT_DIR/.env" ]; then
  set -a
  source "$PROJECT_DIR/.env"
  set +a
fi

ACTION="${1:-up}"

echo "🗄️  LaunchTerminal Database Migration"
echo "   Action: $ACTION"
echo "   Database: ${DATABASE_URL%%@*}@***"
echo ""

case "$ACTION" in
  up)
    echo "Running migrations..."
    cd "$PROJECT_DIR" && npx drizzle-kit migrate
    echo "✅ Migrations complete"
    ;;
  down)
    echo "Rolling back last migration..."
    cd "$PROJECT_DIR" && npx drizzle-kit drop
    echo "✅ Rollback complete"
    ;;
  status)
    echo "Checking migration status..."
    cd "$PROJECT_DIR" && npx drizzle-kit check
    ;;
  generate)
    echo "Generating migration from schema changes..."
    cd "$PROJECT_DIR" && npx drizzle-kit generate
    echo "✅ Migration generated"
    ;;
  *)
    echo "Usage: $0 {up|down|status|generate}"
    exit 1
    ;;
esac
