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

apply_file() {
  local file_path="$1"
  kubectl apply -f "${file_path}"
}

require_cmd kubectl

print_step "Applying namespace"
apply_file "${BASE_DIR}/namespace.yaml"

print_step "Applying shared configuration"
apply_file "${BASE_DIR}/configmap.yaml"
apply_file "${BASE_DIR}/secret.example.yaml"

print_step "Applying stateful dependencies"
apply_file "${BASE_DIR}/redis-deployment.yaml"
apply_file "${BASE_DIR}/redis-service.yaml"
apply_file "${BASE_DIR}/rabbitmq-deployment.yaml"
apply_file "${BASE_DIR}/rabbitmq-service.yaml"

print_step "Applying backend services"
apply_file "${BASE_DIR}/auth-service-deployment.yaml"
apply_file "${BASE_DIR}/auth-service-service.yaml"
apply_file "${BASE_DIR}/orders-service-deployment.yaml"
apply_file "${BASE_DIR}/orders-service-service.yaml"
apply_file "${BASE_DIR}/order-consumer-deployment.yaml"
apply_file "${BASE_DIR}/api-gateway-deployment.yaml"
apply_file "${BASE_DIR}/api-gateway-service.yaml"

print_step "Applying frontend and ingress"
apply_file "${BASE_DIR}/frontend-deployment.yaml"
apply_file "${BASE_DIR}/frontend-service.yaml"
apply_file "${BASE_DIR}/ingress.yaml"

print_step "Stage 4 manifests applied"
echo "Namespace: ${NAMESPACE}"
echo "Verify with: kubectl get all -n ${NAMESPACE}"
