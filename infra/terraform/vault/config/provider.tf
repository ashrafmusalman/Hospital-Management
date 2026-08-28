# This stack configures the *inside* of Vault (secrets engines, auth
# method, policies) — it's separate from ../server, which only provisions
# the EC2 box Vault runs on. Vault has to already be unsealed and reachable
# before this can apply.
#
# The Vault security group only allows port 8200 from the ec2_sg (the
# master box running k3s + Jenkins) — see infra/terraform/modules/security-groups
# — so `terraform apply` for this stack has to run from there, not
# from an arbitrary laptop. Set VAULT_TOKEN in the environment; never put a
# Vault token in a .tf/.tfvars file.
terraform {
  required_providers {
    vault = {
      source  = "hashicorp/vault"
      version = ">= 4.0"
    }
  }
}

provider "vault" {
  address = var.vault_addr
}
