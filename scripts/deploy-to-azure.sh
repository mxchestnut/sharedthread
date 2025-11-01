#!/bin/bash

# Shared Thread - Production Deployment Script
# Run this to deploy to Azure App Service

set -e  # Exit on error

echo "🚀 Shared Thread Production Deployment"
echo "======================================"
echo ""

# Step 1: Build verification
echo "📦 Step 1: Building application..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Fix errors before deploying."
  exit 1
fi

echo "✅ Build successful!"
echo ""

# Step 2: Database migrations (optional)
echo "🗄️  Step 2: Apply database migrations (optional)..."
read -p "Apply migrations to production? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Running migrations..."
  export DATABASE_URL="postgresql://sharedthread_admin:puNEFAWLtPxJgS5DfLfOJg@sharedthread-db.postgres.database.azure.com/sharedthread?sslmode=require"
  npx prisma migrate deploy
  echo "✅ Migrations applied!"
else
  echo "⏭️  Skipping migrations"
fi
echo ""

# Step 3: Azure deployment
echo "☁️  Step 3: Deploying to Azure..."
read -p "Deploy to Azure now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Deploying..."
  
  # Check if Azure CLI is installed
  if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Install it first:"
    echo "   brew install azure-cli"
    exit 1
  fi
  
  # Deploy
  az webapp up \
    --name sharedthread \
    --resource-group sharedthread-rg \
    --runtime "NODE:18-lts" \
    --location eastus
  
  echo "✅ Deployment complete!"
else
  echo "⏭️  Skipping Azure deployment"
  echo ""
  echo "Manual deployment options:"
  echo "  1. Push to GitHub (auto-deploys via Actions)"
  echo "  2. Use Azure Portal Deployment Center"
  echo "  3. Run: az webapp up --name sharedthread --resource-group sharedthread-rg"
fi
echo ""

# Step 4: Post-deployment checks
echo "✅ Step 4: Post-deployment verification"
echo "======================================"
echo ""
echo "Next steps:"
echo "  1. Visit https://sharedthread.co"
echo "  2. Check Sentry dashboard for errors"
echo "  3. Test user signup and login"
echo "  4. Verify notifications work"
echo "  5. Monitor Azure metrics"
echo ""
echo "🎉 Deployment process complete!"
echo ""
echo "Need help? Check DEPLOYMENT_CHECKLIST.md"
