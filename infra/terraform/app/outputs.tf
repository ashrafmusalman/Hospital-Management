output "app_public_ips" {
  value = module.app_cluster.public_ips
}

output "app_private_ips" {
  value = module.app_cluster.private_ips
}

output "db_endpoint" {
  value = module.rds.db_endpoint
}