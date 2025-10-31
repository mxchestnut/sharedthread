#!/bin/bash
# Fix Azure App Service startup command and redeploy
# This script corrects the startup command and restarts the app

set -euo pipefail

APP_NAME="sharedthread"
RESOURCE_GROUP="SharedThread"

echo "🔧 Fixing Azure App Service startup command..."

# Set a clean startup command
az webapp config set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --startup-file "npx prisma migrate deploy && npm start" \
  --output none

echo "✅ Startup command updated"

# Verify the change
echo ""
echo "📋 Current configuration:"
az webapp config show \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "{nodeVersion:nodeVersion, linuxFxVersion:linuxFxVersion, appCommandLine:appCommandLine}" \
  -o json

echo ""
echo "🔄 Restarting app service..."
az webapp restart \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --output none

echo "✅ App restarted"

# Wait a moment for startup
echo ""
echo "⏳ Waiting 15 seconds for app to initialize..."
sleep 15

# Check the site
echo ""
echo "🌐 Checking site status..."
URL="https://sharedthread-ggeheafjamb9hxc2.centralus-01.azurewebsites.net"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
  echo "✅ Site is responding! HTTP $HTTP_CODE"
  echo "🎉 Deployment successful!"
  echo ""
  echo "Visit: $URL"
elif [ "$HTTP_CODE" = "503" ]; then
  echo "⚠️  Still getting 503. Checking logs..."
  echo ""
  echo "Run this to see logs:"
  echo "  az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
else
  echo "❌ Unexpected response: HTTP $HTTP_CODE"
fi
