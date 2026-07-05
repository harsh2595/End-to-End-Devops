# Stage 6: CI/CD Pipelines

Stage 6 automates the project with GitHub Actions.

## Goal

- provision Terraform infrastructure from GitHub Actions
- deploy the Helm chart to the created EKS cluster
- keep the pipelines separate so infra and app deploys are independent

## Workflows

- `.github/workflows/terraform-provision.yml`
- `.github/workflows/deploy.yml`

## Required Secrets

- `AWS_ROLE_TO_ASSUME`
- `AWS_ACCOUNT_ID`

## Inputs

Terraform provisioning workflow:

- `action` with values `apply` or `destroy`

Deployment workflow:

- `image_tag`
- `jwt_secret`

## Notes

- Terraform provisioning uses the existing `terraform/bootstrap` and `terraform/environments/dev` directories.
- Deployment uses the Helm chart in `helm/end-to-end-devops`.
- The ingress controller is installed as a separate `ingress-nginx` Helm release.
- The ingress controller service is set to `LoadBalancer`, so AWS creates the external load balancer for browser traffic.
- Terraform does not create the ingress controller or load balancer; GitHub Actions + Helm do that during deployment.
