# Stage 3 Command Sequence

Stage 3 provisions the AWS infrastructure with Terraform. It creates the remote state backend first, then the dev environment resources used by later stages.

## 1. Check AWS Access

Run this from anywhere with AWS credentials configured:

```bash
aws sts get-caller-identity
```

## 2. Bootstrap Terraform State

Go to the bootstrap directory:

```bash
cd terraform/bootstrap
```

Create the local variable file from the example:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and replace the placeholder values with real names for:

- `state_bucket_name`
- `lock_table_name`

Initialize Terraform:

```bash
terraform init
```

Review and apply the bootstrap stack:

```bash
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

## 3. Configure the Dev Environment

Move to the dev environment:

```bash
cd ../environments/dev
```

Create the config files from the examples:

```bash
cp backend.hcl.example backend.hcl
cp terraform.tfvars.example terraform.tfvars
```

Edit `backend.hcl` so it points to the S3 bucket and DynamoDB table created in bootstrap.

## 4. Deploy the Dev Stack

Initialize Terraform with the remote backend:

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

## 5. Inspect Outputs

Show the created infrastructure details:

```bash
terraform output
```

Useful outputs include:

- VPC ID
- public subnet IDs
- private subnet IDs
- ECR repository URLs
- EKS cluster name
- EKS cluster endpoint

## 6. Connect kubectl to EKS

After the cluster is ready, update your kubeconfig:

```bash
aws eks update-kubeconfig --region ap-south-1 --name end-to-end-devops-dev-eks
kubectl get nodes
```

## 7. Destroy Stage 3 Later

Only after you are completely done with the Kubernetes stage, destroy the dev environment first:

```bash
cd terraform/environments/dev
terraform destroy -var-file="terraform.tfvars"
```

Then destroy the bootstrap resources:

```bash
cd ../../bootstrap
terraform destroy -var-file="terraform.tfvars"
```

## 8. Launch Stage 4

Stage 4 comes after Stage 3 is applied. Do not destroy the Terraform infrastructure before running the Kubernetes stage, because Stage 4 depends on the EKS cluster and ECR repositories created here.

## 9. Destroy Everything

When you want to tear the whole stack down, destroy the layers in this order:

```bash
./k8s/destroy-stage4.sh
kubectl get svc -A | grep LoadBalancer || true
kubectl get ns ingress-nginx || true
cd terraform/environments/dev
terraform destroy -var-file="terraform.tfvars"
```

If you want to keep the ingress controller namespace for some reason, set:

```bash
KEEP_INGRESS_CONTROLLER=true ./k8s/destroy-stage4.sh
```

Wait until the `ingress-nginx` namespace is gone and there are no remaining `LoadBalancer` services before running Terraform destroy. That gives AWS time to release the ENIs, security groups, and public addresses attached to the controller.

The Stage 3 Terraform destroy should remove:

- EKS cluster
- EKS node group
- VPC
- subnets
- internet gateway
- NAT gateway
- ECR repositories

After destroy, verify that the infrastructure is gone:

```bash
aws eks describe-cluster --region ap-south-1 --name end-to-end-devops-dev-eks
aws eks list-nodegroups --region ap-south-1 --cluster-name end-to-end-devops-dev-eks
```
