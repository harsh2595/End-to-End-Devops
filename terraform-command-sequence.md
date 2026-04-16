# Terraform Command Sequence

Run these commands from the project root:

## 1. Bootstrap Remote State

This creates the S3 bucket and DynamoDB table used by Terraform remote state.

```bash
cd terraform/bootstrap
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

## 2. Deploy Dev Environment

This creates the VPC, subnets, ECR, and EKS resources for the `dev` environment.

```bash
cd ../environments/dev
terraform init -backend-config="backend.hcl"
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

## 3. Check Outputs

After apply, you can inspect the Terraform outputs:

```bash
terraform output
```

## 4. If Bootstrap Is Already Done

If the backend resources already exist, you can skip the bootstrap step and start here:

```bash
cd terraform/environments/dev
terraform init -backend-config="backend.hcl"
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

## 5. Destroy In The Correct Order

Destroy the `dev` environment first, then destroy the bootstrap backend resources.

### Destroy Dev Environment

```bash
cd terraform/environments/dev
terraform destroy -var-file="terraform.tfvars"
```

### Destroy Bootstrap Resources

```bash
cd ../../bootstrap
terraform destroy -var-file="terraform.tfvars"
```
