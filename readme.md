# End-to-End DevOps Project

## Docker setup

This repo can now be started as a multi-container stack with Docker Compose.

### Services

- `frontend` on `http://localhost:3000`
- `api-gateway` on `http://localhost:5000`
- `auth-service` on `http://localhost:4000`
- `orders-service` on `http://localhost:7000`
- `rabbitmq` on `amqp://localhost:5672` and management UI on `http://localhost:15672`
- `redis` on `redis://localhost:6379`

### Run

```bash
docker compose up --build
```

### Stop

```bash
docker compose down
```

### Smoke test

After the containers are running, verify the stack with:

```bash
./smoke-test.sh
```

The script checks the frontend, gateway, auth service, and orders service, then logs in and submits a test order through the API gateway.
It also verifies that the same test item appears in the `order-consumer` logs.

You can override the defaults if needed:

```bash
TEST_USER=harsh TEST_ITEM=my-order TEST_QUANTITY=2 ./smoke-test.sh
```

If you only want the HTTP checks and want to skip consumer log verification:

```bash
VERIFY_QUEUE_LOGS=false ./smoke-test.sh
```

### Notes

- The frontend calls the API gateway through `NEXT_PUBLIC_API_URL`.
- The API gateway talks to the orders service through Docker service discovery using `http://orders-service:7000`.
- The orders service and consumer talk to RabbitMQ through `amqp://rabbitmq`.

## Stage 3 Terraform

Stage 3 introduces a Terraform foundation for AWS under `terraform/`.

What is included:

- a `bootstrap` environment for Terraform remote state
- a `dev` environment
- a reusable `network` module for VPC, public subnets, and internet gateway
- a reusable `ecr` module for Docker image repositories

Suggested workflow:

```bash
cd terraform/bootstrap
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply

cd ../environments/dev
cp terraform.tfvars.example terraform.tfvars
cp backend.hcl.example backend.hcl
terraform init -backend-config=backend.hcl
terraform plan
```

This gives the project a cloud-ready base for later stages like Kubernetes, Helm, and CI/CD.

### Remote state backend

Terraform is configured to use an S3 backend for remote state.

Create the backend resources first from `terraform/bootstrap`.

Update `terraform/environments/dev/backend.hcl` with your real values:

- S3 bucket for Terraform state
- state file key
- AWS region
- DynamoDB table for state locking

Example init flow:

```bash
cd terraform/bootstrap
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply

cd ../environments/dev
cp backend.hcl.example backend.hcl
cp terraform.tfvars.example terraform.tfvars
terraform init -backend-config=backend.hcl
terraform plan
```

## Stage 4 Kubernetes

Stage 4 prepares Kubernetes manifests under `k8s/`.

What is included:

- namespace
- config map
- secret example
- deployments and services for all app containers
- ingress placeholder for frontend and API gateway

Files are scaffolded to match the Dockerized services and are ready for Stage 5 Helm conversion.
