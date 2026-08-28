# Secrets engine: application secrets live at secret/data/hospital.
resource "vault_mount" "kv" {
  path = "secret"
  type = "kv-v2"
}

resource "vault_kv_secret_v2" "hospital" {
  mount = vault_mount.kv.path
  name  = "hospital"

  data_json = jsonencode({
    POSTGRES_USER     = var.postgres_user
    POSTGRES_PASSWORD = var.postgres_password
    POSTGRES_DB       = var.postgres_db
    SECRET_KEY        = var.app_secret_key
  })
}

# Auth method: lets pods in our cluster log in to Vault using their own
# ServiceAccount token instead of a static Vault token being handed out.
resource "vault_auth_backend" "kubernetes" {
  type = "kubernetes"
}

resource "vault_kubernetes_auth_backend_config" "this" {
  backend            = vault_auth_backend.kubernetes.path
  kubernetes_host    = var.kubernetes_host
  kubernetes_ca_cert = var.kubernetes_ca_cert
  token_reviewer_jwt = var.token_reviewer_jwt
}

# Policy: read-only access to exactly the one secret path the app needs.
resource "vault_policy" "hospital_api" {
  name = "hospital-api"

  policy = <<-EOT
    path "secret/data/hospital" {
      capabilities = ["read"]
    }
  EOT
}

# Role: only hospital-api-sa, only in the hospital namespace, gets that
# policy — this is what the VaultAuth CR in infra/k8s/vault references.
resource "vault_kubernetes_auth_backend_role" "hospital_api" {
  backend                          = vault_auth_backend.kubernetes.path
  role_name                        = "hospital-api"
  bound_service_account_names      = ["hospital-api-sa"]
  bound_service_account_namespaces = ["hospital"]
  token_policies                   = [vault_policy.hospital_api.name]
  token_ttl                        = 900
}
