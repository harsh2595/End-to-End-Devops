# Stage 6 GitHub Settings Steps

Use these steps to prepare GitHub for the Stage 6 workflows.

## 1. Open Repository Settings

Go to:

```text
Settings -> Secrets and variables -> Actions
```

If you are adding environment-scoped values instead of repository-wide values, use:

```text
Settings -> Environments -> <environment-name>
```

## 2. Add Repository Variables

Add these under `Variables`:

- `AWS_ACCOUNT_ID`
- `AWS_REGION`

Recommended values:

- `AWS_ACCOUNT_ID`: your AWS account ID
- `AWS_REGION`: `ap-south-1`

In GitHub, click `New repository variable`, paste the name, then paste the value.

These are used by:

- `.github/workflows/deploy.yml`
- `.github/workflows/terraform-provision.yml`

## 3. Add Repository Secrets

Add these under `Secrets`:

- `AWS_ROLE_TO_ASSUME`

In GitHub, click `New repository secret`, paste the full IAM role ARN, and save it.

Optional if you are not using OIDC:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

## 4. Configure AWS IAM for OIDC

If you are using `AWS_ROLE_TO_ASSUME`, make sure:

- GitHub Actions OIDC is enabled for the repository
- the IAM role trusts GitHub Actions OIDC
- the role has permissions for Terraform, EKS, ECR, S3, and DynamoDB
- the role ARN is stored in `AWS_ROLE_TO_ASSUME`

## 5. Workflow Inputs

Terraform provisioning workflow:

- `action=apply`
- `action=destroy`

For teardown, open the `Terraform Provision` workflow in GitHub Actions and change the `action` input from `apply` to `destroy` before clicking `Run workflow`.

Deployment workflow:

- `image_tag`
- `jwt_secret`

Destroy workflow:

When you run the workflow manually from the GitHub Actions tab, just click `Run workflow` because it does not take extra inputs now.

## 6. What Each Workflow Needs

`terraform-provision.yml`:

- `AWS_ROLE_TO_ASSUME`
- `AWS_REGION`

`deploy.yml`:

- `AWS_ROLE_TO_ASSUME`
- `AWS_ACCOUNT_ID`
- `AWS_REGION`
- `image_tag`
- `jwt_secret`

`destroy.yml`:

- `AWS_ROLE_TO_ASSUME`

## 7. Validate Access

Before running the workflows, confirm:

- the repository variables are saved
- the secret is saved
- the IAM role can be assumed by GitHub Actions
- the target AWS resources already exist for deployment

Also verify the repository has permission to use Actions and that workflow runs are not blocked by branch protection rules.

For a compact before-run checklist, see [Stage 6 Pre-Flight Checklist](stage6-preflight-checklist.md).

## 8. Ingress Controller and Load Balancer

The AWS load balancer for the frontend is created by the deploy workflow, not by Terraform.

The deploy workflow does this with Helm:

- installs the `ingress-nginx` controller into its own namespace
- sets the ingress controller service type to `LoadBalancer`
- lets AWS provision the external load balancer automatically

This means:

- Terraform provisions the AWS infrastructure
- GitHub Actions deploys the app
- Helm installs the ingress controller and creates the load balancer path for browser traffic

## 9. Destroying the Helm Release

Use `.github/workflows/destroy.yml` when you want to remove the Helm deployment from the cluster.

It can:

- uninstall the `end-to-end-devops` Helm release
- delete the `end-to-end-devops` namespace
- uninstall `ingress-nginx`
- delete the `ingress-nginx` namespace

## 10. Final Bootstrap Cleanup

If the Terraform destroy workflow leaves the bootstrap S3 bucket and DynamoDB table behind, run [Stage 6 final destroy script](stage6-final-destroy.sh) from the repo root.

That script removes:

- `harsh-end-to-end-devops-tf-state`
- `end-to-end-devops-tf-locks`

It also verifies the deletion and prints:

- `S3 bucket destroyed: ...`
- `DynamoDB table destroyed: ...`
- `S3 and DynamoDB destroyed successfully.`

## Notes

- `AWS_ACCOUNT_ID` must be a repository variable, not a secret, because the deploy workflow uses it to build the ECR registry URL.
- `AWS_REGION` is used by both workflows.
- `AWS_ROLE_TO_ASSUME` is the main secret both workflows depend on.
