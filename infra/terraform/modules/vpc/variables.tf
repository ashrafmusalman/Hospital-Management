variable "vpc_cidr" {}
variable "public_subnet_cidr" {}
variable "private_subnet_cidr" {}

variable "private_subnet_2_cidr" {

}

variable "public_subnet_az" {
  description = "Availability zone for public subnet"
  type        = string
}

variable "private_subnet_az" {
  description = "Availability zone for private subnet"
  type        = string
}

variable "private_subnet_2_az" {
  description = "second az for the private subnet 2"
  type        = string

}