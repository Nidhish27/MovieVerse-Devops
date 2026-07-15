#################################################
# Terraform Configuration
#################################################

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

#################################################
# Latest Ubuntu AMI
#################################################

data "aws_ami" "ubuntu" {

  most_recent = true

  owners = ["099720109477"]

  filter {
    name = "name"

    values = [
      "ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"
    ]
  }

  filter {
    name = "virtualization-type"

    values = ["hvm"]
  }

}

#################################################
# VPC
#################################################

resource "aws_vpc" "movieverse" {

  cidr_block = "10.0.0.0/16"

  enable_dns_support = true

  enable_dns_hostnames = true

  tags = {

    Name = "MovieVerse-VPC"

  }

}

#################################################
# Public Subnet
#################################################

resource "aws_subnet" "public" {

  vpc_id = aws_vpc.movieverse.id

  cidr_block = "10.0.1.0/24"

  availability_zone = "ap-south-1a"

  map_public_ip_on_launch = true

  tags = {

    Name = "MovieVerse-Public-Subnet"

  }

}

#################################################
# Internet Gateway
#################################################

resource "aws_internet_gateway" "igw" {

  vpc_id = aws_vpc.movieverse.id

  tags = {

    Name = "MovieVerse-IGW"

  }

}

#################################################
# Route Table
#################################################

resource "aws_route_table" "public" {

  vpc_id = aws_vpc.movieverse.id

  route {

    cidr_block = "0.0.0.0/0"

    gateway_id = aws_internet_gateway.igw.id

  }

}

resource "aws_route_table_association" "public" {

  subnet_id = aws_subnet.public.id

  route_table_id = aws_route_table.public.id

}

#################################################
# Security Group
#################################################

resource "aws_security_group" "movieverse" {

  name = "movieverse-sg"

  description = "MovieVerse Security Group"

  vpc_id = aws_vpc.movieverse.id

  ingress {

    from_port = 22

    to_port = 22

    protocol = "tcp"

    cidr_blocks = ["0.0.0.0/0"]

  }

  ingress {

    from_port = 80

    to_port = 80

    protocol = "tcp"

    cidr_blocks = ["0.0.0.0/0"]

  }

  ingress {

    from_port = 8080

    to_port = 8080

    protocol = "tcp"

    cidr_blocks = ["0.0.0.0/0"]

  }

  ingress {

    from_port = 30000

    to_port = 32767

    protocol = "tcp"

    cidr_blocks = ["0.0.0.0/0"]

  }

  egress {

    from_port = 0

    to_port = 0

    protocol = "-1"

    cidr_blocks = ["0.0.0.0/0"]

  }

  tags = {

    Name = "MovieVerse-SG"

  }

}

#################################################
# Jenkins EC2
#################################################

resource "aws_instance" "jenkins" {

  # Pin the current AMI so Jenkins is not recreated
  ami = "ami-001e7cc215773c7fb"

  instance_type = "t3.micro"

  subnet_id = aws_subnet.public.id

  key_name = var.key_name

  vpc_security_group_ids = [
    aws_security_group.movieverse.id
  ]

  associate_public_ip_address = true

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [ami]
  }

  tags = {
    Name = "MovieVerse-Jenkins"
  }
}

#################################################
# Kubernetes EC2
#################################################

resource "aws_instance" "kubernetes" {

  ami = data.aws_ami.ubuntu.id

  instance_type = "c7i-flex.large"

  subnet_id = aws_subnet.public.id

  key_name = var.key_name

  vpc_security_group_ids = [
    aws_security_group.movieverse.id
  ]

  associate_public_ip_address = true

  tags = {
    Name = "MovieVerse-Kubernetes"
  }
}

#################################################
# Variable
#################################################

variable "key_name" {}