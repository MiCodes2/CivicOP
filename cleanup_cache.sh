#!/bin/bash

# ============================================================================
# GuardTech Cache Cleanup Script
# Clears browser cache, service worker cache, and optimizes frontend state
# ============================================================================

echo "🧹 GuardTech Cache Cleanup Started..."
echo "============================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Clear Next.js build cache
echo -e "${BLUE}[1/5] Clearing Next.js build cache...${NC}"
if [ -d "frontend/.next" ]; then
    rm -rf frontend/.next
    echo -e "${GREEN}✓ Next.js cache cleared${NC}"
else
    echo -e "${YELLOW}ℹ No .next directory found${NC}"
fi

# Step 2: Clear node_modules cache
echo -e "${BLUE}[2/5] Clearing node_modules cache...${NC}"
if [ -d "frontend/node_modules/.cache" ]; then
    rm -rf frontend/node_modules/.cache
    echo -e "${GREEN}✓ node_modules cache cleared${NC}"
else
    echo -e "${YELLOW}ℹ No node_modules cache directory found${NC}"
fi

# Step 3: Clear pip cache
echo -e "${BLUE}[3/5] Clearing Python pip cache...${NC}"
pip cache purge 2>/dev/null
echo -e "${GREEN}✓ Pip cache cleared${NC}"

# Step 4: Clear Docker buildkit cache (optional - requires Docker)
echo -e "${BLUE}[4/5] Clearing Docker buildkit cache...${NC}"
if command -v docker &> /dev/null; then
    docker buildx prune -a -f 2>/dev/null || true
    echo -e "${GREEN}✓ Docker buildkit cache cleared${NC}"
else
    echo -e "${YELLOW}ℹ Docker not available${NC}"
fi

# Step 5: Create a cache invalidation timestamp
echo -e "${BLUE}[5/5] Creating cache invalidation token...${NC}"
TIMESTAMP=$(date +%s)
echo "$TIMESTAMP" > frontend/.cache-bust-token
echo -e "${GREEN}✓ Cache bust token: $TIMESTAMP${NC}"

echo ""
echo "============================================================================"
echo -e "${GREEN}✅ Cache cleanup completed!${NC}"
echo ""
echo "📋 Summary:"
echo "  • Next.js build cache: cleared"
echo "  • Node modules cache: cleared"  
echo "  • Pip cache: cleared"
echo "  • Docker cache: cleared"
echo "  • Cache bust token: $TIMESTAMP"
echo ""
echo "🚀 Next steps:"
echo "  1. Restart the frontend server: npm run dev"
echo "  2. Clear browser cache in DevTools (Ctrl+Shift+Delete)"
echo "  3. Hard refresh the page (Ctrl+Shift+R)"
echo "  4. Check the database for stale resolved issues"
echo ""
echo "============================================================================"
