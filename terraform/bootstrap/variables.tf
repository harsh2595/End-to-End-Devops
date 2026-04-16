variable "project_name" {
  description = "Project name used for naming bootstrap resources."
  type        = string
  default     = "end-to-end-devops"
}

variable "environment" {
  description = "Environment name for the bootstrap resources."
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region for the Terraform backend resources."
  type        = string
  default     = "ap-south-1"
}

variable "state_bucket_name" {
  description = "S3 bucket name for Terraform remote state."
  type        = string
}

variable "lock_table_name" {
  description = "DynamoDB table name for Terraform state locking."
  type        = string
}
