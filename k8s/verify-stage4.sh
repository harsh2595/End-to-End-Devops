#!/usr/bin/env bash

set -euo pipefail

NAMESPACE="${NAMESPACE:-end-to-end-devops}"
LOG_LINES="${LOG_LINES:-50}"

print_step() {
  printf '\n==> %s\n' "$1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

print_logs() {
  local target="$1"
  local title="$2"

  print_step "${title}"
  kubectl logs "${target}" -n "${NAMESPACE}" --tail="${LOG_LINES}" || true
}

require_cmd kubectl

print_step "Namespace resources"
kubectl get all -n "${NAMESPACE}"

print_step "Ingress"
kubectl get ingress -n "${NAMESPACE}" || true

print_step "Pods"
kubectl get pods -n "${NAMESPACE}" -o wide

print_step "Services"
kubectl get svc -n "${NAMESPACE}"

print_step "Recent events"
kubectl get events -n "${NAMESPACE}" --sort-by=.lastTimestamp | tail -n 20 || true

print_logs "deployment/frontend" "Frontend logs"
print_logs "deployment/api-gateway" "API gateway logs"
print_logs "deployment/auth-service" "Auth service logs"
print_logs "deployment/orders-service" "Orders service logs"
print_logs "deployment/order-consumer" "Order consumer logs"

print_step "Verification complete"
echo "Namespace: ${NAMESPACE}"
