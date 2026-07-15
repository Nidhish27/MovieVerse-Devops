output "jenkins_ip" {

  value = aws_instance.jenkins.public_ip

}

output "kubernetes_ip" {

  value = aws_instance.kubernetes.public_ip

}