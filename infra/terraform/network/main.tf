module "vpc" {
  source = "../modules/vpc"

  vpc_cidr              = var.vpc_cidr
  public_subnet_cidr    = var.public_subnet_cidr
  private_subnet_cidr   = var.private_subnet_cidr
  private_subnet_2_cidr = var.private_subnet_2_cidr

  public_subnet_az    = var.public_subnet_az
  private_subnet_az   = var.private_subnet_az
  private_subnet_2_az = var.private_subnet_2_az
}

module "security_groups" {
  source = "../modules/security-groups"

  vpc_id               = module.vpc.vpc_id
  bastion_allowed_cidr = var.bastion_allowed_cidr
}