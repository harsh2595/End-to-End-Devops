# Stage 4 Kubernetes

This directory contains the base Kubernetes manifests for the project.

Scope of this stage:

- deploy the microservices to Kubernetes
- keep service discovery internal through Kubernetes Services
- expose the frontend and API gateway through an Ingress
- prepare for Helm in Stage 5

## Prerequisites

Before applying these manifests, make sure:

- the EKS cluster is already created
- `kubectl` is installed
- `aws` CLI is configured for the correct AWS account
- Docker images are pushed to your ECR repositories
- an ingress controller is installed in the cluster

## 1. Connect kubectl to EKS

```bash
aws eks update-kubeconfig \
  --region ap-south-1 \
  --name end-to-end-devops-dev-eks
```

Verify access:

```bash
kubectl get nodes
```

## 2. Build and Push Images to ECR

Use the helper script:

```bash
./k8s/build-and-push-images.sh
```

Optional overrides:

```bash
AWS_ACCOUNT_ID=198452822403 AWS_REGION=ap-south-1 IMAGE_TAG=v1 ./k8s/build-and-push-images.sh
```

What the script does:

- logs in to ECR
- builds the `frontend`, `api-gateway`, `auth-service`, and `orders-service` images
- tags them with your ECR registry and the selected image tag
- pushes all four images

## 3. Update the Manifests

Before applying:

- replace the placeholder secret value in `k8s/base/secret.example.yaml`
- rename `k8s/base/secret.example.yaml` to a real secret file if you do not want to apply the example directly

## 4. Apply the Kubernetes Resources

Use the helper script:

```bash
./k8s/apply-stage4.sh
```

What the script does:

- applies the namespace first
- applies the config map and secret
- applies Redis and RabbitMQ before the app services
- applies backend services before the frontend
- applies the ingress last

## 5. Verify the Deployment

Use the helper script:

```bash
./k8s/verify-stage4.sh
```

Optional overrides:

```bash
NAMESPACE=end-to-end-devops LOG_LINES=100 ./k8s/verify-stage4.sh
```

What the script checks:

- all resources in the namespace
- ingress and services
- pod placement and status
- recent namespace events
- recent logs for the frontend, gateway, auth, orders, and consumer deployments

## Notes

- `Ingress` will not work until an ingress controller is installed
- the hostnames in `k8s/base/ingress.yaml` are placeholders and may need to be changed
- these manifests are the base version for Stage 4 and can later be converted into Helm charts in Stage 5
