#!/usr/bin/env bash

set -euo pipefail

AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-198452822403}"
AWS_REGION="${AWS_REGION:-ap-south-1}"
PROJECT_PREFIX="${PROJECT_PREFIX:-end-to-end-devops-dev}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

print_step() {
  printf '\n==> %s\n' "$1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

build_and_push() {
  local service_name="$1"
  local dockerfile_path="$2"
  local image_ref="${ECR_REGISTRY}/${PROJECT_PREFIX}-${service_name}:${IMAGE_TAG}"

  print_step "Building ${service_name}"
  docker build -f "${dockerfile_path}" -t "${image_ref}" "${REPO_ROOT}"

  print_step "Pushing ${service_name}"
  docker push "${image_ref}"
}

require_cmd aws
require_cmd docker

print_step "Logging in to ECR"
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

build_and_push "frontend" "${REPO_ROOT}/docker/frontend.Dockerfile"
build_and_push "api-gateway" "${REPO_ROOT}/docker/api-gateway.Dockerfile"
build_and_push "auth-service" "${REPO_ROOT}/docker/auth-service.Dockerfile"
build_and_push "orders-service" "${REPO_ROOT}/docker/orders-service.Dockerfile"

print_step "Image push complete"
echo "Registry: ${ECR_REGISTRY}"
echo "Tag: ${IMAGE_TAG}"
