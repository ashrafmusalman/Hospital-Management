provider "aws" {
  region = "us-east-1"
  # Terraform gets your AWS key from environment variables automatically:
  # export AWS_ACCESS_KEY_ID="your-key"
  # export AWS_SECRET_ACCESS_KEY="your-secret"
}





data "aws_ami" "instance_ami" {    #### this block will go and fetch the ami id from aws 
    most_recent = true
    owners = ["099720109477"]  # Canonical (Ubuntu)

    filter {
        name = "name"
        values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
    }
}

variable "allowed_port" {
  default = ["22", "80", "443", "8080", "3000"]
}
resource "aws_security_group" "web_sg" {   ## this block means it can access every internet resource of evdery protocol and every port
    name = "web_sg"
    description = "allow all multiple port at once"
    egress  {
        from_port = 0  #### starting port 
        to_port = 0 # ending port
        protocol = "-1" # -1 means all protocol
        cidr_blocks = ["0.0.0.0/0"] # means all ip address can access this security group
        
    }
  
}

resource "aws_security_group_rule" "web_inbound" {
    for_each = toset(var.allowed_port)
    type = "ingress"
    from_port = each.value
    to_port = each.value
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    security_group_id = aws_security_group.web_sg.id

  
}

resource "aws_instance" "web"{
    ami=data.aws_ami.instance_ami.id
    instance_type = "t3.small"
    associate_public_ip_address = true
    vpc_security_group_ids = [aws_security_group.web_sg.id]
     tags = {
        Name = "web"
    }

    lifecycle {
      create_before_destroy = true
      
      

    }

    
    

}

output "ipaddress" {
    value = aws_instance.web.public_ip
  
}

