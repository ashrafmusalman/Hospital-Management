module "vault_ec2" { ### this module is responsible for creating the EC2 instance for vault 
  source = "../../modules/vault_ec2"

  ami_id        = var.ami_id
  instance_type = var.instance_type

  subnet_id = data.terraform_remote_state.network.outputs.private_subnet_id # private now — reached via the bastion / from the app cluster over the VPC, not the internet

  sg_id = data.terraform_remote_state.network.outputs.vault_security_group_id # we are reusing the vault security group id which is created by the security group module

  volume   = 25
  name     = "vault"
  key_name = var.key_name
}