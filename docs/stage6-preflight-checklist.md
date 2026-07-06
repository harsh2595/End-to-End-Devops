# Stage 6 Pre-Flight Checklist

Use this checklist before running the GitHub Actions workflows for Stage 6.

## GitHub Repository Settings

- `AWS_ACCOUNT_ID` exists as a repository variable
- `AWS_REGION` exists as a repository variable
- `AWS_ROLE_TO_ASSUME` exists as a repository secret

## AWS Access

- the IAM role in `AWS_ROLE_TO_ASSUME` trusts GitHub Actions OIDC
- the role has permissions for Terraform, EKS, ECR, S3, and DynamoDB
- the AWS account and region match the Terraform setup

## Terraform State

- backend configuration exists and is reachable
- bootstrap resources already exist if the workflow expects them
- dev environment state is healthy
- if you are doing a full cleanup, `docs/stage6-final-destroy.sh` exists and can be run from the repo root
- if you are doing a full cleanup, the script should finish with `S3 and DynamoDB destroyed successfully.`

## EKS and ECR

- the EKS cluster exists
- the node group is healthy
- the ECR repositories exist

## Helm Chart

- `helm template ./helm/end-to-end-devops` renders successfully
- `values.yaml` contains a real JWT secret when deploying
- image tags match the images you built or pushed

## Ingress and Load Balancer

- `ingress-nginx` can be installed by Helm
- the `ingress-nginx` namespace does not conflict with an old broken install
- the cluster can create a `LoadBalancer` service in AWS

## Workflow Inputs

- Terraform workflow uses `action=apply` or `action=destroy`
- Deploy workflow uses `image_tag`
- Deploy workflow uses `jwt_secret`

## GitHub Actions

- Actions are enabled for the repository
- the branch is allowed by repository protections
