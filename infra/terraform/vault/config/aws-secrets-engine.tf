# Dynamic AWS credentials: instead of a long-lived AWS access key sitting
# in someone's ~/.aws/credentials or a CI secret forever, Vault hands out
# a short-lived IAM user + key pair on demand (`vault read
# aws/creds/terraform-operator`) and deletes it again when the lease
# expires. Anyone who currently runs `terraform apply` against this repo's
# AWS account with a personal static key should switch to this instead.
resource "vault_aws_secret_backend" "aws" {
  path       = "aws"
  access_key = var.vault_aws_root_access_key
  secret_key = var.vault_aws_root_secret_key
  region     = var.aws_region

  default_lease_ttl_seconds = 3600  # 1h — long enough for a terraform apply, short enough to not linger
  max_lease_ttl_seconds     = 14400 # 4h ceiling even if renewed
}

# Scoped to what this repo's Terraform stacks actually touch (VPC/EC2,
# the S3 state bucket, the DynamoDB lock table, RDS) — review against
# `terraform plan` output and tighten further before treating this as
# final; it's a starting point, not a blank check.
resource "vault_aws_secret_backend_role" "terraform_operator" {
  backend         = vault_aws_secret_backend.aws.path
  name            = "terraform-operator"
  credential_type = "iam_user"

  policy_document = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Networking"
        Effect = "Allow"
        Action = [
          "ec2:*",
        ]
        Resource = "*"
      },
      {
        Sid      = "Database"
        Effect   = "Allow"
        Action   = ["rds:*"]
        Resource = "*"
      },
      {
        Sid    = "TerraformState"
        Effect = "Allow"
        Action = ["s3:GetObject", "s3:PutObject", "s3:ListBucket"]
        Resource = [
          "arn:aws:s3:::ashraf-terraform-state-415571557408",
          "arn:aws:s3:::ashraf-terraform-state-415571557408/*",
        ]
      },
      {
        Sid      = "TerraformLock"
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"]
        Resource = "arn:aws:dynamodb:*:*:table/terraform-locks"
      },
    ]
  })
}

resource "vault_policy" "terraform_operator" {
  name = "terraform-operator"

  policy = <<-EOT
    path "aws/creds/terraform-operator" {
      capabilities = ["read"]
    }
  EOT
}
