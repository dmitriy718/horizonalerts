# VPS Deploy (Docker + NGINX)

## Prereqs
- Non-root SSH user with sudo (example: `deploy`)
- SSH key auth enabled for that user
- DNS for `horizonsvc.com` points to the VPS

## Steps
1. Copy repo to the VPS (git clone or rsync).
2. Create `.env` from `.env.example` on the VPS and fill secrets.
3. Run Ansible to install Docker + NGINX:
   - `ansible-playbook -i infra/ansible/hosts.ini infra/ansible/site.yml`
4. Start services:
   - `docker compose -f docker-compose.prod.yml up -d --build`
5. Run DB migration once:
   - `docker compose -f docker-compose.prod.yml exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -f /db/001_init.sql`

## Notes
- NGINX terminates TLS and proxies `/api/` to port 4000.
- Web runs on port 3000 behind NGINX.
- For SSL, ensure certs exist at `/etc/letsencrypt/live/horizonsvc.com/`.
