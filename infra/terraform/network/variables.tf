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
