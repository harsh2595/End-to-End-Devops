# Stage 6 Command Sequence

Stage 6 uses GitHub Actions to automate provisioning and deployment.

## 1. Terraform Provisioning Workflow

Run the GitHub Actions workflow named `Terraform Provision`.

Inputs:

- `action=apply` to provision infrastructure
- `action=destroy` to tear it down

What it does:

- initializes Terraform in `terraform/bootstrap`
- validates and applies the bootstrap stack
- initializes Terraform in `terraform/environments/dev`
- validates and applies the dev stack

## 2. Deployment Workflow

Run the GitHub Actions workflow named `Deploy to EKS`.

Inputs:

- `image_tag`
- `jwt_secret`

What it does:

- builds and pushes Docker images
- installs or upgrades the `ingress-nginx` Helm release
- creates or reuses the `ingress-nginx` namespace
- sets the ingress controller service to `LoadBalancer`, which makes AWS provision the public load balancer
- deploys the `helm/end-to-end-devops` chart
- verifies the release and services

## 3. Required Secrets

- `AWS_ROLE_TO_ASSUME`
- `AWS_ACCOUNT_ID`

## 4. Environment Dependencies

- Terraform stage outputs must exist before the deployment workflow runs
- EKS must already be active
- the Helm chart must render successfully
- the ingress controller must have an AWS load balancer
- Terraform is not responsible for the ingress controller or the load balancer
