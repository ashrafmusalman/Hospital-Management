

####  this boot strapping folder will create the infra for the tf state file 
## right now it is createding onlyh the s3 and the dynamo db table 

provider "aws" {
  region = var.region

}


resource "aws_s3_bucket" "tf_state" {

  bucket        = var.bucket_name
  force_destroy = true

}


resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.tf_state.id
  versioning_configuration {
    status = "Enabled"
  }


}

resource "aws_dynamodb_table" "tf_lock_tabl" {
  name         = var.dynamodb_table
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }


}