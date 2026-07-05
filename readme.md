# End-to-End DevOps Project

This repository walks through a full app delivery pipeline in four stages:

1. local development with Node.js
2. Docker Compose
3. AWS infrastructure with Terraform
4. Kubernetes on EKS

The stage-by-stage command sequences live in:

- [Stage 1](stage1-command-sequence.md)
- [Stage 2](stage2-command-sequence.md)
- [Stage 3](stage3-command-sequence.md)
- [Stage 4](stage4-command-sequence.md)

## Project Layout

- `services/` contains the application services
- `terraform/` contains the AWS bootstrap and dev infrastructure
- `k8s/` contains the Kubernetes manifests and helper scripts
- `smoke-test.sh` validates the app flow across the services

## Stage Overview

### Stage 1: Local Node.js

Run the backend services locally and use Docker only for Redis and RabbitMQ.

Main checks:

- frontend on `http://localhost:3000`
- API gateway on `http://localhost:5000`
- auth service on `http://localhost:4000`
- orders service on `http://localhost:7000`

Use the Stage 1 sequence for the exact start and stop commands:

- [Stage 1 command sequence](stage1-command-sequence.md)

### Stage 2: Docker Compose

Run the full stack as containers with Docker Compose.

Services started:

- `frontend`
- `api-gateway`
- `auth-service`
- `orders-service`
- `order-consumer`
- `redis`
- `rabbitmq`

Start and stop:

```bash
docker compose up --build
docker compose down
```

Verify the stack with:

```bash
./smoke-test.sh
```

Useful overrides:

```bash
TEST_USER=harsh TEST_ITEM=my-order TEST_QUANTITY=2 ./smoke-test.sh
VERIFY_QUEUE_LOGS=false ./smoke-test.sh
```

### Stage 3: Terraform on AWS

Stage 3 provisions the cloud foundation:

- Terraform remote state bootstrap
- dev environment resources
- VPC and networking
- ECR repositories
- EKS cluster and node group

Follow the Stage 3 command sequence for the bootstrap and dev workflow:

- [Stage 3 command sequence](stage3-command-sequence.md)

### Stage 4: Kubernetes on EKS

Stage 4 deploys the app to Kubernetes using the EKS cluster from Stage 3.

Included helper scripts:

- `k8s/build-and-push-images.sh`
- `k8s/apply-stage4.sh`
- `k8s/verify-stage4.sh`
- `k8s/destroy-stage4.sh`

Important prerequisites:

- AWS credentials configured
- `kubectl` connected to the EKS cluster
- Docker images pushed to ECR
- an ingress controller installed in the cluster

Follow the Stage 4 command sequence for the exact apply and teardown flow:

- [Stage 4 command sequence](stage4-command-sequence.md)

## Quick Start

If you want the shortest path through the repo:

1. Use Stage 1 to validate the services locally.
2. Use Stage 2 to validate the full containerized stack.
3. Use Stage 3 to provision AWS infrastructure.
4. Use Stage 4 to deploy the app to Kubernetes.

## Notes

- The frontend talks to the API gateway through `NEXT_PUBLIC_API_URL`.
- The API gateway talks to the orders service through Docker or Kubernetes service discovery, depending on the stage.
- The orders service and consumer talk to RabbitMQ.
- Keep the Terraform infrastructure alive until Stage 4 is completely finished, because the Kubernetes deployment depends on the EKS cluster and ECR repositories.
