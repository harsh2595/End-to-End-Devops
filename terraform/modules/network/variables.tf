variable "name_prefix" {
  description = "Prefix for naming network resources."
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets."
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets."
  type        = list(string)
}

variable "availability_zones" {
  description = "Availability zones for the public subnets."
  type        = list(string)
}

variable "cluster_name" {
  description = "Optional EKS cluster name used for subnet tagging."
  type        = string
  default     = ""
}

variable "tags" {
  description = "Common tags for all resources."
  type        = map(string)
  default     = {}
}
