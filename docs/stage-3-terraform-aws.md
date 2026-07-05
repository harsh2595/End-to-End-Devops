# Stage 3: Terraform AWS Infrastructure

Stage 3 provisions the AWS infrastructure used by the later Kubernetes deployment. Terraform creates a remote state backend first, then creates the dev environment resources.

## Goal

- Create an S3 backend for Terraform state.
- Create a DynamoDB table for Terraform state locking.
- Provision the dev VPC and subnets.
- Create ECR repositories for app images.
- Create an EKS cluster and managed node group.

## Main Files

- `terraform/bootstrap/`
- `terraform/environments/dev/`
- `terraform/modules/network/`
- `terraform/modules/ecr/`
- `terraform/modules/eks/`
- `terraform-command-sequence.md`

## Infrastructure Created

Bootstrap environment:

- S3 bucket for remote Terraform state
- DynamoDB table for state locking
- S3 versioning, encryption, and public access blocking

Dev environment:

- VPC
- public subnets
- private subnets
- internet gateway
- NAT gateway
- ECR repositories for:
  - `frontend`
  - `api-gateway`
  - `auth-service`
  - `orders-service`
- EKS cluster
- EKS managed node group

Default region:

```text
ap-south-1
```

Default EKS cluster name:

```text
end-to-end-devops-dev-eks
```

## Prerequisites

- AWS CLI installed and authenticated.
- Terraform installed.
- AWS credentials configured for the target account.
- Unique S3 bucket name selected for Terraform state.

Check AWS access:

```bash
aws sts get-caller-identity
```

## 1. Bootstrap Remote State

Go to the bootstrap directory:

```bash
cd terraform/bootstrap
```

Create or update the real variable file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and set:

- `state_bucket_name`
- `lock_table_name`
- `aws_region`

Initialize and apply:

```bash
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

## 2. Configure Dev Backend

Go to the dev environment:

```bash
cd ../environments/dev
```

Create real config files from the examples if needed:

```bash
cp backend.hcl.example backend.hcl
cp terraform.tfvars.example terraform.tfvars
```

Edit `backend.hcl` so it points to the S3 bucket and DynamoDB table created during bootstrap.

## 3. Deploy Dev Environment

Initialize with the remote backend:

```bash
terraform init -backend-config="backend.hcl"
```

Review the plan:

```bash
terraform plan -var-file="terraform.tfvars"
```

Apply the infrastructure:

```bash
terraform apply -var-file="terraform.tfvars"
```

## 4. Check Outputs

```bash
terraform output
```

Important outputs:

- `vpc_id`
- `public_subnet_ids`
- `private_subnet_ids`
- `ecr_repository_urls`
- `eks_cluster_name`
- `eks_cluster_endpoint`

## 5. Connect kubectl to EKS

After the EKS cluster is created:

```bash
aws eks update-kubeconfig --region ap-south-1 --name end-to-end-devops-dev-eks
kubectl get nodes
```

This prepares the workstation for Stage 4.

## 6. Destroy Order

Destroy the dev environment first:

```bash
cd terraform/environments/dev
terraform destroy -var-file="terraform.tfvars"
```

Then destroy the bootstrap resources:

```bash
cd ../../bootstrap
terraform destroy -var-file="terraform.tfvars"
```

## Completion Checklist

- Bootstrap state bucket exists.
- DynamoDB lock table exists.
- Dev Terraform backend initializes successfully.
- VPC and subnets are created.
- Four ECR repositories are created.
- EKS cluster is active.
- `kubectl get nodes` works after updating kubeconfig.
