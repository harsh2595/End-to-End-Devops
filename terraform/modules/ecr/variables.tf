variable "name_prefix" {
  description = "Prefix for naming ECR repositories."
  type        = string
}

variable "repository_names" {
  description = "Service repository names."
  type        = list(string)
}

variable "tags" {
  description = "Common tags for all repositories."
  type        = map(string)
  default     = {}
}
