resource "aws_instance" "vault" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = [var.sg_id]
  associate_public_ip_address = false
  key_name                    = var.key_name

  root_block_device {
    volume_size           = var.volume
    volume_type           = "gp2"
    delete_on_termination = true
  }

  tags = {
    Name = var.name
    Role = "vault"
  }
}