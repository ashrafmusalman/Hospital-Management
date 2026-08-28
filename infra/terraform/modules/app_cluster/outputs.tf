output "public_ips" {
  value = {
    for key, value in aws_instance.nodes : key => value.public_ip
  }
}

output "private_ips" {
  value = {
    for key, value in aws_instance.nodes : key => value.private_ip
  }
}