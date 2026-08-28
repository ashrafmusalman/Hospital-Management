

#  this is just the templates for the ec2 instances the actual values for the instances are 
#defined in the main.tf file of the root module (terraform/main.tf) and passed to this module as variables


resource "aws_instance" "nodes" {
  for_each                    = var.instances # loop through the instances map defined in variables.tf
  ami                         = var.ami_id
  instance_type               = each.value.instance_type
  subnet_id                   = each.value.subnet_id
  vpc_security_group_ids      = [each.value.sg]
  associate_public_ip_address = each.value.associate_public_ip
  key_name                    = var.key_name


  root_block_device {
    volume_size           = each.value.volume
    volume_type           = each.value.volume_type
    delete_on_termination = true

  }


  ### merge takes two maps and merges them together
  tags = merge({
    Name = each.value.name
    key  = each.key
    }, var.tags

  )

}