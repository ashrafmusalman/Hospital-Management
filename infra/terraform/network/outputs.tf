output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_id" {
  value = module.vpc.public_subnet_id
}

output "private_subnet_id" {
  value = module.vpc.private_subnet_id
}

output "vault_security_group_id" {
  value = module.security_groups.vault_security_group_id
}

output "ec2_security_group_id" {
  value = module.security_groups.ec2_security_group_id
}


output "private_subnet_2_id" {
  value = module.vpc.private_subnet_2_id
}

output "rds_security_group_id" {
  value = module.security_groups.rds_security_group_id
}
