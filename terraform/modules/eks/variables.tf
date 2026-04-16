variable "cluster_name" {
  description = "EKS cluster name."
  type        = string
}

variable "cluster_version" {
  description = "EKS cluster version."
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for the cluster."
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for the cluster and node group."
  type        = list(string)
}

variable "node_instance_types" {
  description = "Instance types for the managed node group."
  type        = list(string)
}

variable "node_desired_size" {
  description = "Desired number of nodes."
  type        = number
}

variable "node_min_size" {
  description = "Minimum number of nodes."
  type        = number
}

variable "node_max_size" {
  description = "Maximum number of nodes."
  type        = number
}

variable "tags" {
  description = "Common tags for all EKS resources."
  type        = map(string)
  default     = {}
}
