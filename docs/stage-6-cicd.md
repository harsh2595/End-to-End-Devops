# Stage 6: CI/CD Pipelines

Stage 6 automates the project with GitHub Actions.

## Goal

- provision Terraform infrastructure from GitHub Actions
- deploy the Helm chart to the created EKS cluster
- keep the pipelines separate so infra and app deploys are independent

## Workflows

- `.github/workflows/terraform-provision.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/destroy.yml`

## Required Secrets

- `AWS_ROLE_TO_ASSUME`
- `AWS_ACCOUNT_ID`

## Inputs

Terraform provisioning workflow:

- `action` with values `apply` or `destroy`

Deployment workflow:

- `image_tag`
- `jwt_secret`

Destroy workflow:

## Notes

- Terraform provisioning uses the existing `terraform/bootstrap` and `terraform/environments/dev` directories.
- Deployment uses the Helm chart in `helm/end-to-end-devops`.
- The ingress controller is installed as a separate `ingress-nginx` Helm release.
- The ingress controller service is set to `LoadBalancer`, so AWS creates the external load balancer for browser traffic.
- Terraform does not create the ingress controller or load balancer; GitHub Actions + Helm do that during deployment.
- The destroy workflow removes the Helm release and can optionally remove `ingress-nginx` too.
- The destroy workflow removes the Helm release and also removes `ingress-nginx` and its namespace.
- If the Terraform bootstrap bucket and lock table remain after destroy, use `docs/stage6-final-destroy.sh` to remove them and confirm `S3 and DynamoDB destroyed successfully.`

## Screenshots

- [Added IAM user to access created cluster](../screenshots/stage6-ss/added%20iam%20user%20to%20access%20created%20cluster.png)
- [Added repo secrets](../screenshots/stage6-ss/added%20repo%20secrets.png)
- [Added repo variables](../screenshots/stage6-ss/added%20repo%20variables.png)
- [Bash script created to delete S3 and DynamoDB](../screenshots/stage6-ss/bash%20script%20created%20to%20delete%20s3%20and%20dynamodb%20as%20tak%20as%20executed%20on%20github%20actions%20.png)
- [Bootstrap destruction shows 0 to destroy](../screenshots/stage6-ss/bootstrap%20distruction%20says%200%20to%20destroy%20as%20it%20runs%20on%20github%20actions%20os%20and%20deleted%20after%20pipeline%20completes%20%20.png)
- [Bootstrap phase applied successfully](../screenshots/stage6-ss/bootstrap-phase-applied-succesfully.png)
- [Created access entry for IAM user for local access](../screenshots/stage6-ss/created%20access%20entry%20for%20iam%20user%20for%20local%20access.png)
- [Created IAM user](../screenshots/stage6-ss/created%20iam%20user.png)
- [Created role to attached to trust policy](../screenshots/stage6-ss/created%20role%20to%20attahced%20to%20trust%20policy.png)
- [Destroy Helm pipeline run successfully](../screenshots/stage6-ss/destroy%20helm%20pipeline%20runned%20successfully.png)
- [Dev destruction](../screenshots/stage6-ss/dev%20distruction.png)
- [Dev applied successfully via GitHub Actions](../screenshots/stage6-ss/dev-applied-succesfully-via-github-actions.png)
- [Frontend deployed via GitHub Actions](../screenshots/stage6-ss/frontend-deployed-via-github-actions.png)
- [Helm chart deployed successfully](../screenshots/stage6-ss/helm%20chart%20deployed%20successfully.png)
- [Ingress-nginx Helm chart deployed successfully](../screenshots/stage6-ss/ingress-nginx-helm-chart-deployed-successfully.png)
- [Installing ingress-nginx Helm chart](../screenshots/stage6-ss/installing-ingress-nginx-helm-chart.png)
- [Running Kubernetes deployment](../screenshots/stage6-ss/running-k8s-deployment.png)
- [Terraform dev and bootstrap code destroyed](../screenshots/stage6-ss/terraform%20dev%20and%20bootstrap%20code%20destroyed.png)
- [Terraform provisioning via GitHub Actions](../screenshots/stage6-ss/terraform-provisioning-via-github-actions.png)
