#!/usr/bin/env bash

set -euo pipefail

FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
GATEWAY_URL="${GATEWAY_URL:-http://localhost:5000}"
AUTH_URL="${AUTH_URL:-http://localhost:4000}"
ORDERS_URL="${ORDERS_URL:-http://localhost:7000}"
TEST_USER="${TEST_USER:-harsh}"
DEFAULT_TEST_ITEM="test-order-$(date +%s)"
TEST_ITEM="${TEST_ITEM:-$DEFAULT_TEST_ITEM}"
TEST_QUANTITY="${TEST_QUANTITY:-1}"
VERIFY_QUEUE_LOGS="${VERIFY_QUEUE_LOGS:-true}"

print_step() {
  printf '\n==> %s\n' "$1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd curl
require_cmd node

verify_queue_logs() {
  local log_output

  if ! command -v docker >/dev/null 2>&1; then
    echo "Skipping queue log verification: docker command not found."
    return 0
  fi

  if ! docker compose ps >/dev/null 2>&1; then
    echo "Skipping queue log verification: docker compose is not available for this stack."
    return 0
  fi

  log_output="$(docker compose logs order-consumer --tail=120 2>/dev/null || true)"

  if printf '%s' "$log_output" | grep -F "item: '$TEST_ITEM'" >/dev/null 2>&1; then
    echo "Consumer log check OK: found item '$TEST_ITEM'."
    return 0
  fi

  echo "Consumer log check failed: item '$TEST_ITEM' not found in recent order-consumer logs." >&2
  return 1
}

print_step "Checking service health"
curl -fsS "$FRONTEND_URL" >/dev/null
echo "Frontend OK: $FRONTEND_URL"

gateway_health="$(curl -fsS "$GATEWAY_URL/health")"
echo "Gateway OK: $gateway_health"

auth_health="$(curl -fsS "$AUTH_URL/health")"
echo "Auth OK: $auth_health"

orders_health="$(curl -fsS "$ORDERS_URL/health")"
echo "Orders OK: $orders_health"

print_step "Requesting auth token"
login_response="$(curl -fsS -X POST "$AUTH_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USER\"}")"
echo "Login response: $login_response"

token="$(node -e 'const data = JSON.parse(process.argv[1]); if (!data.token) process.exit(1); process.stdout.write(data.token);' "$login_response")"

print_step "Submitting test order through API gateway"
order_payload="{\"item\":\"$TEST_ITEM\",\"quantity\":$TEST_QUANTITY}"
order_response="$(curl -fsS -X POST "$GATEWAY_URL/order" \
  -H "Content-Type: application/json" \
  -H "Authorization: $token" \
  -d "$order_payload")"
echo "Order response: $order_response"

if [ "$VERIFY_QUEUE_LOGS" = "true" ]; then
  print_step "Verifying queue processing from consumer logs"
  verify_queue_logs
fi

print_step "Smoke test passed"
echo "Test item: $TEST_ITEM"
echo "Use 'docker compose logs -f order-consumer' to watch queue processing in real time."
