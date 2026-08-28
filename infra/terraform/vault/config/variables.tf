variable "vault_addr" {
  type        = string
  description = "http://<vault_private_ip>:8200 — vault_private_ip comes from `terraform output` in ../server. Apply this stack from master (or via an SSH tunnel through it) since vault_sg only allows port 8200 from the app cluster's security group."
}

variable "kubernetes_host" {
  type        = string
  description = "https://<k8s-api-server>:6443 — the API endpoint Vault calls to validate service account tokens presented to it"
}

variable "kubernetes_ca_cert" {
  type        = string
  description = "PEM-encoded CA cert of the cluster's API server (e.g. contents of /etc/kubernetes/pki/ca.crt on the master node)"
}

variable "token_reviewer_jwt" {
  type        = string
  sensitive   = true
  description = "Token for the vault-auth ServiceAccount (kube-system, bound to system:auth-delegator — see infra/k8s/vault/vault-auth-rbac.yaml). Get one with: kubectl create token vault-auth -n kube-system --duration=8760h"
}

variable "postgres_user" {
  type      = string
  sensitive = true
}

variable "postgres_password" {
  type      = string
  sensitive = true
}

variable "postgres_db" {
  type      = string
  sensitive = true
}

variable "app_secret_key" {
  type        = string
  sensitive   = true
  description = "Signing key for the backend's sessions/tokens (was SECRET_KEY in the old plaintext k8s Secret)"
}

# --- AWS secrets engine ---
#
# These are the one pair of static AWS keys that still has to exist outside
# Vault — Vault needs its own credentials to be able to call IAM and hand
# out short-lived ones to everyone else. Root of trust has to start
# somewhere. Keep this IAM user's permissions to exactly what
# vault_aws_secret_backend_role.terraform_operator needs to grant
# (iam:CreateUser/DeleteUser/CreateAccessKey/DeleteAccessKey/PutUserPolicy/
# ListAccessKeys, scoped with a path or permissions-boundary condition if
# your AWS org supports it), not full admin — this key can mint IAM users,
# so it's worth minimizing on its own.
variable "vault_aws_root_access_key" {
  type        = string
  sensitive   = true
  description = "Access key for the IAM user Vault itself uses to create/delete temporary IAM users via the AWS secrets engine"
}

variable "vault_aws_root_secret_key" {
  type        = string
  sensitive   = true
  description = "Secret key for the IAM user Vault itself uses to create/delete temporary IAM users via the AWS secrets engine"
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "Region the AWS secrets engine issues credentials for"
}
