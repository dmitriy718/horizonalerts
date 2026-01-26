terraform {
  required_version = ">= 1.6.0"
}

variable "vps_ip" {
  type        = string
  description = "IONOS VPS public IP"
}

output "vps_ip" {
  value = var.vps_ip
}
