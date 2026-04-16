output "vpc_id" {
  description = "VPC ID for the dev environment."
  value       = module.network.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs for the dev environment."
  value       = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs for the dev environment."
  value       = module.network.private_subnet_ids
}

output "internet_gateway_id" {
  description = "Internet gateway ID."
  value       = module.network.internet_gateway_id
}

output "nat_gateway_id" {
  description = "NAT gateway ID."
  value       = module.network.nat_gateway_id
}

output "ecr_repository_urls" {
  description = "ECR repository URLs keyed by service name."
  value       = module.ecr.repository_urls
}

output "eks_cluster_name" {
  description = "EKS cluster name."
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster API endpoint."
  value       = module.eks.cluster_endpoint
}

output "eks_node_role_arn" {
  description = "IAM role ARN used by the EKS managed node group."
  value       = module.eks.node_role_arn
}
