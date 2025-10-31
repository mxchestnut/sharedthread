#!/bin/bash
# Shared Thread - Production Deployment Script
# Last Updated: October 30, 2025

set -e  # Exit on error

echo "🚀 Shared Thread Production Deployment"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Pre-flight checks
echo "📋 Step 1: Pre-flight Checks"
echo "----------------------------"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the project root?${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} In project directory"

# Check Node version
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓${NC} Node version: $NODE_VERSION"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ Error: .env.local not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Environment file found"

# Step 2: Install dependencies
echo ""
echo "📦 Step 2: Installing Dependencies"
echo "-----------------------------------"
npm ci --silent
echo -e "${GREEN}✓${NC} Dependencies installed"

# Step 3: Generate Prisma Client
echo ""
echo "🗄️  Step 3: Generate Prisma Client"
echo "-----------------------------------"
npx prisma generate
echo -e "${GREEN}✓${NC} Prisma client generated"

# Step 4: Run database migrations (optional - uncomment for first deployment)
# echo ""
# echo "🗄️  Step 4: Database Migrations"
# echo "--------------------------------"
# echo -e "${YELLOW}⚠️  This will apply migrations to your production database${NC}"
# read -p "Continue? (y/N) " -n 1 -r
# echo
# if [[ $REPLY =~ ^[Yy]$ ]]; then
#     npx prisma migrate deploy
#     echo -e "${GREEN}✓${NC} Migrations applied"
# else
#     echo -e "${YELLOW}⊘${NC} Migrations skipped"
# fi

# Step 5: Build application
echo ""
echo "🔨 Step 5: Building Application"
echo "--------------------------------"
npm run build
echo -e "${GREEN}✓${NC} Build completed successfully"

# Step 6: Run tests (if you have them)
# echo ""
# echo "🧪 Step 6: Running Tests"
# echo "------------------------"
# npm test
# echo -e "${GREEN}✓${NC} Tests passed"

# Step 7: Production readiness check
echo ""
echo "✅ Step 7: Production Readiness"
echo "--------------------------------"

# Check critical environment variables
MISSING_VARS=()

if [ -z "$JWT_SECRET" ]; then
    MISSING_VARS+=("JWT_SECRET")
fi

if [ -z "$DATABASE_URL" ]; then
    MISSING_VARS+=("DATABASE_URL")
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    MISSING_VARS+=("NEXTAUTH_SECRET")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing critical environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    exit 1
fi

echo -e "${GREEN}✓${NC} Critical environment variables set"
echo -e "${GREEN}✓${NC} Application ready for production"

# Final summary
echo ""
echo "🎉 Deployment Preparation Complete!"
echo "===================================="
echo ""
echo "Next steps:"
echo "1. Deploy to Azure: az webapp up or GitHub Actions"
echo "2. Verify environment variables in Azure Portal"
echo "3. Run smoke tests after deployment"
echo "4. Monitor application logs for errors"
echo ""
echo "Documentation: See PRODUCTION_READINESS.md"
echo ""
