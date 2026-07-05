project_name         = "end-to-end-devops"
environment          = "dev"
aws_region           = "ap-south-1"
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.11.0/24", "10.0.12.0/24"]
availability_zones   = ["ap-south-1a", "ap-south-1b"]
eks_cluster_name     = "end-to-end-devops-dev-eks"
eks_cluster_version  = "1.31"
eks_node_instance_types = ["t3.medium"]
eks_node_desired_size   = 2
eks_node_min_size       = 1
eks_node_max_size       = 3

ecr_repository_names = [
  "frontend",
  "api-gateway",
  "auth-service",
  "orders-service"
]
