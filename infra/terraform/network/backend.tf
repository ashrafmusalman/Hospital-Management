terraform {
  backend "s3" {
    bucket         = "ashraf-terraform-state-415571557408"
    key            = "network/terraform.tfstate" # 
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
  }
}