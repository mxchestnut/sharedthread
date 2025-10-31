#!/bin/bash
# Production smoke test for Shared Thread
# Tests critical paths and features on live deployment

set -euo pipefail

BASE_URL="${1:-https://sharedthread.co}"
FAILED=0
PASSED=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_test() {
  echo -e "\n${YELLOW}Testing:${NC} $1"
}

log_pass() {
  PASSED=$((PASSED + 1))
  echo -e "${GREEN}✅ PASS:${NC} $1"
}

log_fail() {
  FAILED=$((FAILED + 1))
  echo -e "${RED}❌ FAIL:${NC} $1"
}

check_http() {
  local path="$1"
  local expected_code="${2:-200}"
  local description="$3"
  
  local response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path" 2>&1)
  
  if [[ "$response" == "$expected_code" ]] || [[ "$expected_code" == *"$response"* ]]; then
    log_pass "$description (HTTP $response)"
    return 0
  else
    log_fail "$description (expected $expected_code, got $response)"
    return 1
  fi
}

check_content() {
  local path="$1"
  local search_text="$2"
  local description="$3"
  
  local content=$(curl -s "$BASE_URL$path" 2>&1)
  
  if echo "$content" | grep -q "$search_text"; then
    log_pass "$description"
    return 0
  else
    log_fail "$description (content not found)"
    return 1
  fi
}

check_ssl() {
  local domain="$1"
  local description="$2"
  
  local ssl_info=$(curl -vI "https://$domain" 2>&1 | grep -E "SSL connection|subject:|issuer:" | head -n 3)
  
  if echo "$ssl_info" | grep -q "SSL connection"; then
    log_pass "$description"
    echo "    $ssl_info" | sed 's/^/    /'
    return 0
  else
    log_fail "$description"
    return 1
  fi
}

echo "================================================"
echo "🧪 SMOKE TEST - Shared Thread Production"
echo "================================================"
echo "Target: $BASE_URL"
echo "Date: $(date)"
echo ""

# 1. SSL & Security
log_test "SSL Certificate & HTTPS"
check_ssl "sharedthread.co" "Custom domain SSL"

# 2. Core Pages
log_test "Landing & Auth Pages"
check_http "/" "200" "Homepage loads"
check_http "/login" "200" "Login page"
check_http "/signup" "200" "Signup page"

# 3. Main App Routes (should redirect to login if not authenticated)
log_test "Protected Routes (expect redirect to login)"
check_http "/library" "200|302|307" "Library page"
check_http "/atelier" "200|302|307" "Atelier page"

# 4. API Routes
log_test "API Health Checks"
check_http "/api/auth/csrf" "200" "Auth CSRF endpoint"

# 5. Static Assets
log_test "Static Assets & Resources"
check_http "/favicon.ico" "200|404" "Favicon (may not exist)"

# 6. Content Checks
log_test "Page Content Verification"
check_content "/login" "Shared Thread" "Login page contains branding"
check_content "/signup" "email" "Signup page has email field"

# 7. Response Times
log_test "Performance Checks"
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/")
if (( $(echo "$RESPONSE_TIME < 3.0" | bc -l) )); then
  log_pass "Homepage loads in ${RESPONSE_TIME}s (< 3s)"
else
  log_fail "Homepage slow: ${RESPONSE_TIME}s (> 3s threshold)"
fi

# 8. Security Headers
log_test "Security Headers"
HEADERS=$(curl -sI "$BASE_URL/" 2>&1)

if echo "$HEADERS" | grep -qi "x-powered-by: Next.js"; then
  log_pass "Next.js server running"
fi

if echo "$HEADERS" | grep -qi "cache-control"; then
  log_pass "Cache headers present"
fi

# 9. Database Connectivity (indirect check via working pages)
log_test "Database Connectivity (indirect)"
if check_http "/login" "200" "Login page loads (requires DB connection)"; then
  log_pass "Database appears to be connected"
fi

# 10. Environment Check
log_test "Production Environment"
ENV_CHECK=$(curl -s "$BASE_URL/login" 2>&1)
if echo "$ENV_CHECK" | grep -qi "development\|localhost\|console.log"; then
  log_fail "Possible development artifacts in production"
else
  log_pass "No obvious development artifacts"
fi

# Summary
echo ""
echo "================================================"
echo "📊 SMOKE TEST SUMMARY"
echo "================================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed! Production looks healthy.${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed. Review above for details.${NC}"
  exit 1
fi
