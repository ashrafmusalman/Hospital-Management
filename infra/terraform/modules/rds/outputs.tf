output "db_endpoint" {
  value = aws_db_instance.hospital_postgres.endpoint
}

output "db_identifier" {
  value = aws_db_instance.hospital_postgres.id
}