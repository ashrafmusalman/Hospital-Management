resource "aws_db_subnet_group" "hospital_db_subnet_group" {

  name = "hospital-db-subnet-group"

  subnet_ids = [
    var.private_subnet_id,
    var.private_subnet_2_id
  ]

  tags = {
    Name = "hospital-db-subnet-group"
  }
}


resource "aws_db_instance" "hospital_postgres" {

  identifier = "hospital-postgres-db"

  engine         = "postgres"
  engine_version = "15"

  instance_class = "db.t3.micro"

  allocated_storage = 20

  db_name  = var.db_name
  username = var.db_user
  password = var.db_password

  vpc_security_group_ids = [var.rds_security_group_id]

  db_subnet_group_name = aws_db_subnet_group.hospital_db_subnet_group.name

  publicly_accessible = false

  skip_final_snapshot = true

  tags = {
    Name = "hospital-postgres-db"
  }
}