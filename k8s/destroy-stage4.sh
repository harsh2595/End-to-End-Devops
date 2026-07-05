#!/usr/bin/env bash

set -euo pipefail

NAMESPACE="${NAMESPACE:-end-to-end-devops}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="${SCRIPT_DIR}/base"

print_step() {
  printf '\n==> %s\n' "$1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

delete_file() {
  local file_path="$1"
  kubectl delete --ignore-not-found=true -f "${file_path}"
}

require_cmd kubectl

print_step "Deleting frontend and ingress"
delete_file "${BASE_DIR}/ingress.yaml"
delete_file "${BASE_DIR}/frontend-service.yaml"
delete_file "${BASE_DIR}/frontend-deployment.yaml"

print_step "Deleting backend services"
delete_file "${BASE_DIR}/api-gateway-service.yaml"
delete_file "${BASE_DIR}/api-gateway-deployment.yaml"
delete_file "${BASE_DIR}/order-consumer-deployment.yaml"
delete_file "${BASE_DIR}/orders-service-service.yaml"
delete_file "${BASE_DIR}/orders-service-deployment.yaml"
delete_file "${BASE_DIR}/auth-service-service.yaml"
delete_file "${BASE_DIR}/auth-service-deployment.yaml"

print_step "Deleting stateful dependencies"
delete_file "${BASE_DIR}/rabbitmq-service.yaml"
delete_file "${BASE_DIR}/rabbitmq-deployment.yaml"
delete_file "${BASE_DIR}/redis-service.yaml"
delete_file "${BASE_DIR}/redis-deployment.yaml"

print_step "Deleting shared configuration"
delete_file "${BASE_DIR}/secret.example.yaml"
delete_file "${BASE_DIR}/configmap.yaml"

print_step "Deleting namespace"
kubectl delete namespace "${NAMESPACE}" --ignore-not-found=true
kubectl wait --for=delete namespace/"${NAMESPACE}" --timeout=120s || true

if [ "${KEEP_INGRESS_CONTROLLER:-false}" != "true" ]; then
  print_step "Deleting ingress controller namespace"
  kubectl delete namespace ingress-nginx --ignore-not-found=true
  kubectl wait --for=delete namespace/ingress-nginx --timeout=120s || true
fi

print_step "Stage 4 teardown complete"
echo "Namespace: ${NAMESPACE}"
