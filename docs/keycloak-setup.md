# Keycloak Production Setup Guide

## 1. Server Requirements
- Ubuntu 20.04+ LTS
- 2GB+ RAM
- 10GB+ disk space
- Public IP or domain name

## 2. Installation Steps

### On your Ubuntu server, run:
```bash
# Download the setup script
wget https://raw.githubusercontent.com/mxchestnut/sharedthread/main/scripts/setup-keycloak-server.sh

# Make it executable
chmod +x setup-keycloak-server.sh

# Run as root
sudo ./setup-keycloak-server.sh
```

## 3. Post-Installation Configuration

### A. Access Keycloak Admin Console
1. Go to `http://your-server-ip:8080`
2. Login with:
   - Username: `admin`
   - Password: `TempAdminPassword123!`

### B. Create Realm for Shared Thread
1. Click "Create Realm"
2. Name: `sharedthread`
3. Enable: `true`

### C. Create Client for NextAuth
1. Go to Clients → Create Client
2. Client ID: `sharedthread-nextjs`
3. Client Protocol: `openid-connect`
4. Root URL: `https://sharedthread.co`
5. Valid Redirect URIs: 
   - `https://sharedthread.co/api/auth/callback/keycloak`
   - `http://localhost:3000/api/auth/callback/keycloak` (for development)
6. Web Origins: `https://sharedthread.co`
7. Access Type: `confidential`

### D. Get Client Credentials
1. Go to Clients → sharedthread-nextjs → Credentials
2. Copy the Client Secret

### E. Create Your User
1. Go to Users → Add User
2. Username: `kitchestnut` (or your preferred username)
3. Email: `kitchestnut@hotmail.com`
4. First Name: `Kit`
5. Email Verified: `true`
6. Enabled: `true`
7. Set Password (temporary: false)

## 4. Environment Variables for Shared Thread

Add these to your `.env.local` and Azure:

```bash
# Keycloak Configuration
KEYCLOAK_CLIENT_ID=sharedthread-nextjs
KEYCLOAK_CLIENT_SECRET=your_client_secret_from_step_D
KEYCLOAK_ISSUER=http://your-keycloak-server:8080/realms/sharedthread

# NextAuth Configuration
NEXTAUTH_URL=https://sharedthread.co
NEXTAUTH_SECRET=iQjhC0Z4yG13lPZdVYPgSXSVTX283FhTyftZt7RMJnk=
```

## 5. SSL Setup (Recommended)

### Using Let's Encrypt:
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d your-keycloak-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 3 * * * certbot renew --quiet
```

## 6. Security Hardening

### A. Change Default Passwords
```bash
# Change Keycloak admin password via admin console
# Change database password:
sudo -u postgres psql
ALTER USER keycloak WITH PASSWORD 'new_secure_password_here';
```

### B. Firewall Rules
```bash
# Only allow necessary ports
sudo ufw enable
sudo ufw allow 22     # SSH
sudo ufw allow 80     # HTTP (Nginx)
sudo ufw allow 443    # HTTPS (Nginx)
# Block direct access to Keycloak port 8080 from outside
```

### C. Update Keycloak Config
Edit `/opt/keycloak/conf/keycloak.conf`:
```
# Update password
db-password=new_secure_password_here

# Enable HTTPS only for production
http-enabled=false
https-port=8443
```

## 7. Monitoring Commands

```bash
# Check Keycloak status
sudo systemctl status keycloak

# View logs
sudo journalctl -u keycloak -f

# Restart if needed
sudo systemctl restart keycloak

# Check database connection
sudo -u postgres psql -d keycloak -c "SELECT version();"
```

## 8. Backup Strategy

```bash
# Database backup
sudo -u postgres pg_dump keycloak > keycloak-backup-$(date +%Y%m%d).sql

# Config backup
sudo tar -czf keycloak-config-backup-$(date +%Y%m%d).tar.gz /opt/keycloak/conf/
```

## Troubleshooting

### Common Issues:
1. **Keycloak won't start**: Check logs with `journalctl -u keycloak -f`
2. **Database connection issues**: Verify PostgreSQL is running and credentials are correct
3. **Memory issues**: Increase server RAM or adjust Java heap settings
4. **SSL certificate issues**: Check Nginx config and certificate paths

### Performance Tuning:
- For production, allocate at least 2GB RAM to Keycloak
- Consider using a separate database server for larger deployments
- Enable caching and clustering for high availability