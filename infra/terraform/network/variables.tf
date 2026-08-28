variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "public_subnet_cidr" {
  description = "CIDR for public subnet"
  type        = string
}

variable "private_subnet_cidr" {
  description = "CIDR for private subnet"
  type        = string
}

variable "private_subnet_2_cidr" {
  description = "CIDR for second private subnet"
  type        = string
}

variable "public_subnet_az" {
  description = "AZ for public subnet"
  type        = string
}

variable "private_subnet_az" {
  description = "AZ for private subnet"
  type        = string
}

variable "private_subnet_2_az" {
  description = "AZ for second private subnet"
  type        = string
}

variable "bastion_allowed_cidr" {
  description = "CIDR allowed to SSH into the bastion host — set this to your own IP as x.x.x.x/32, not 0.0.0.0/0"
  type        = string
}