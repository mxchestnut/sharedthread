#!/bin/bash

# Keycloak Production Setup Script for Ubuntu Server
# Run this on your Ubuntu server as root or with sudo

set -e

echo "🔐 Setting up Keycloak on Ubuntu Server..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Java 11 (required for Keycloak)
echo "☕ Installing Java 11..."
apt install -y openjdk-11-jdk

# Verify Java installation
java -version

# Install PostgreSQL
echo "🐘 Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create Keycloak database and user
echo "🗄️ Setting up Keycloak database..."
sudo -u postgres psql <<EOF
CREATE DATABASE keycloak;
CREATE USER keycloak WITH ENCRYPTED PASSWORD 'secure_keycloak_password_2024';
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;
\q
EOF

# Create keycloak user
echo "👤 Creating keycloak system user..."
useradd -r -s /bin/false keycloak

# Download and install Keycloak
echo "⬇️ Downloading Keycloak..."
cd /opt
wget https://github.com/keycloak/keycloak/releases/download/23.0.1/keycloak-23.0.1.tar.gz
tar -xzf keycloak-23.0.1.tar.gz
mv keycloak-23.0.1 keycloak
chown -R keycloak:keycloak /opt/keycloak

# Create Keycloak configuration
echo "⚙️ Creating Keycloak configuration..."
cat > /opt/keycloak/conf/keycloak.conf <<EOF
# Database configuration
db=postgres
db-url=jdbc:postgresql://localhost:5432/keycloak
db-username=keycloak
db-password=secure_keycloak_password_2024

# HTTP configuration
http-enabled=true
http-port=8080
hostname-strict=false

# HTTPS configuration (for production)
# https-port=8443
# https-certificate-file=/path/to/certificate.pem
# https-certificate-key-file=/path/to/private-key.pem

# Production optimizations
cache=ispn
cache-stack=tcp
EOF

# Create systemd service
echo "🔧 Creating systemd service..."
cat > /etc/systemd/system/keycloak.service <<EOF
[Unit]
Description=Keycloak Application Server
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=notify
User=keycloak
Group=keycloak
ExecStart=/opt/keycloak/bin/kc.sh start
Restart=on-failure
RestartSec=5
Environment=KEYCLOAK_ADMIN=admin
Environment=KEYCLOAK_ADMIN_PASSWORD=TempAdminPassword123!
TimeoutStartSec=600
TimeoutStopSec=600

[Install]
WantedBy=multi-user.target
EOF

# Build Keycloak (optimized for production)
echo "🏗️ Building Keycloak for production..."
sudo -u keycloak /opt/keycloak/bin/kc.sh build

# Enable and start Keycloak
echo "🚀 Starting Keycloak service..."
systemctl daemon-reload
systemctl enable keycloak
systemctl start keycloak

# Setup firewall (if ufw is installed)
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    ufw allow 8080/tcp
    ufw allow 22/tcp  # SSH
    echo "Firewall configured. Don't forget to enable it with: ufw enable"
fi

# Install Nginx for reverse proxy
echo "🌐 Installing Nginx..."
apt install -y nginx

# Create Nginx configuration for Keycloak
cat > /etc/nginx/sites-available/keycloak <<EOF
server {
    listen 80;
    server_name your-keycloak-domain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/keycloak /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

echo "✅ Keycloak installation complete!"
echo ""
echo "🔗 Access Keycloak at: http://your-server-ip:8080"
echo "👤 Admin username: admin"
echo "🔑 Admin password: TempAdminPassword123!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your domain name in Nginx config"
echo "2. Set up SSL certificate (Let's Encrypt recommended)"
echo "3. Change the admin password"
echo "4. Create a realm and client for your application"
echo ""
echo "🔧 Service management commands:"
echo "  sudo systemctl status keycloak    # Check status"
echo "  sudo systemctl restart keycloak   # Restart"
echo "  sudo journalctl -u keycloak -f    # View logs"