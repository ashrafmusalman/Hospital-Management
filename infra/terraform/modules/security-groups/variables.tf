variable "vpc_id" {
  description = "VPC ID where security groups will be created"
  type        = string
}

variable "bastion_allowed_cidr" {
  description = "CIDR allowed to SSH into the bastion host — set this to your own IP as x.x.x.x/32, not 0.0.0.0/0"
  type        = string
}