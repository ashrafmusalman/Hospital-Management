
variable "region" {
  description = "aws region to deploy resources in"
  type        = string

}
provider "aws" {
  region = var.region
}