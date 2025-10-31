#!/bin/bash
# Azure App Service startup script
# This runs before the app starts

set -e

echo "🚀 Starting Shared Thread..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Start the Next.js app
echo "▲ Starting Next.js..."
node server.js || npm start
