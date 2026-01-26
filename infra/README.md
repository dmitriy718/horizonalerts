# Infrastructure

Terraform describes cloud resources. Ansible provisions the IONOS VPS and NGINX.

## Security rules
- SSH keys only. No passwords or root logins.
- TLS with HSTS and strong ciphers.
- Secrets provided via environment variables or secret stores.

## Usage
1. Provision a VPS on IONOS.
2. Add the host to `infra/ansible/hosts.ini`.
3. Run: `ansible-playbook -i infra/ansible/hosts.ini infra/ansible/site.yml`
