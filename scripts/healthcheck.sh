#!/usr/bin/env bash
set -euo pipefail

# LaunchTerminal — Health Check Script
# Usage: ./scripts/healthcheck.sh [host] [port]

HOST="${1:-localhost}"
PORT="${2:-3000}"
URL="http://${HOST}:${PORT}"

echo "🏥 LaunchTerminal Health Check"
echo "   Target: $URL"
echo ""

# Check HTTP health endpoint
echo -n "HTTP /health: "
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/health" 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ OK ($HTTP_STATUS)"
else
  echo "❌ FAIL ($HTTP_STATUS)"
fi

# Check readiness endpoint
echo -n "HTTP /ready:  "
READY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/ready" 2>/dev/null || echo "000")
if [ "$READY_STATUS" = "200" ]; then
  echo "✅ OK ($READY_STATUS)"
else
  echo "❌ FAIL ($READY_STATUS)"
fi

# Check metrics endpoint
echo -n "HTTP /metrics: "
METRICS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/metrics" 2>/dev/null || echo "000")
if [ "$METRICS_STATUS" = "200" ]; then
  echo "✅ OK ($METRICS_STATUS)"
else
  echo "⚠️  UNAVAILABLE ($METRICS_STATUS)"
fi

echo ""
echo "Done."
