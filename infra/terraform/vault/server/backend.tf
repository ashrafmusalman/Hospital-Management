# NOTE: key stays "vault/terraform.tfstate" (not "vault/server/...") even
# though this stack now lives under vault/server/ — this state is already
# applied against a real EC2 instance. Changing the key would point
# Terraform at empty state and make it think the instance needs to be
# created again. The S3 key is independent of the local folder path, so
# there's no need to ever change it just to match.
terraform {
  backend "s3" {
    bucket         = "ashraf-terraform-state-415571557408"
    key            = "vault/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
  }
}