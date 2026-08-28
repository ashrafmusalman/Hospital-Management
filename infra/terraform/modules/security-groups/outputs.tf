output "ec2_security_group_id" {
  description = "Security group ID for EC2"
  value       = aws_security_group.ec2_sg.id
}

output "rds_security_group_id" {
  description = "Security group ID for RDS"
  value       = aws_security_group.rds_sg.id
}

output "vault_security_group_id" {
  value = aws_security_group.vault_sg.id
}

output "bastion_security_group_id" {
  value = aws_security_group.bastion_sg.id
}