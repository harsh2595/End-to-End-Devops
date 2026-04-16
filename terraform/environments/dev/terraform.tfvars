project_name        = "end-to-end-devops"
environment         = "dev"
aws_region          = "ap-south-1"
vpc_cidr            = "10.0.0.0/16"
public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
availability_zones  = ["ap-south-1a", "ap-south-1b"]

ecr_repository_names = [
  "frontend",
  "api-gateway",
  "auth-service",
  "orders-service"
]

eks_node_instance_types = ["t3.micro"]
