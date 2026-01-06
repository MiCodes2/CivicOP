#!/bin/bash
# GuardTech Cache Cleanup - Quick Start Guide
# Run this to complete the cache cleanup in under 5 minutes

echo "🚀 GuardTech Cache Cleanup - Quick Start"
echo "========================================"
echo ""
echo "This will clean all caches and fix resolved issues appearing on the map."
echo ""

# Check if we're in the right directory
if [ ! -f "frontend/pages/map-view.js" ]; then
    echo "❌ Error: Please run this from the GuardTech project root"
    echo "   cd /workspaces/GuardTech"
    exit 1
fi

echo "✅ Found GuardTech project"
echo ""

# Step 1: Verify code fix
echo "📋 Step 1/4: Verifying code fix..."
if grep -q "!\\['RESOLVED', 'CLOSED'\\]" frontend/pages/map-view.js; then
    echo "✅ Code fix verified in frontend/pages/map-view.js"
else
    echo "⚠️  Could not verify code fix - please check manually"
fi
echo ""

# Step 2: Run cache cleanup
echo "🧹 Step 2/4: Cleaning caches..."
if [ -x "./cleanup_cache.sh" ]; then
    ./cleanup_cache.sh
else
    echo "⚠️  cleanup_cache.sh not executable - making it executable..."
    chmod +x cleanup_cache.sh
    ./cleanup_cache.sh
fi
echo ""

# Step 3: Instructions
echo "🔄 Step 3/4: Restarting frontend server..."
echo ""
echo "Run these commands in a new terminal:"
echo "  cd /workspaces/GuardTech/frontend"
echo "  npm run dev"
echo ""

# Step 4: Browser instructions
echo "🌐 Step 4/4: Hard refresh browser..."
echo ""
echo "Once the frontend is running:"
echo "  1. Open http://localhost:3000/map-view"
echo "  2. Press: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
echo "  3. Open DevTools (F12) and check Console for:"
echo "     ✅ Fetched X incidents: [...{status: 'OPEN'}, ...{status: 'IN_PROGRESS'}...]"
echo ""

# Verification
echo "✨ Verification Checklist:"
echo "  ☐ Code fix applied to map-view.js"
echo "  ☐ Browser cache cleared"
echo "  ☐ Frontend cache cleared"
echo "  ☐ Frontend server restarted"
echo "  ☐ Browser hard refreshed"
echo "  ☐ Default map shows only OPEN and IN_PROGRESS issues"
echo "  ☐ 'Resolved' filter tab shows completed issues"
echo ""

echo "📖 For detailed info, see:"
echo "  • QUICK_CACHE_CLEANUP.md - 4-step quick reference"
echo "  • CACHE_CLEANUP_GUIDE.md - Comprehensive guide"
echo "  • CACHE_CLEANUP_IMPLEMENTATION.md - Technical details"
echo ""

echo "✅ Cache cleanup setup complete!"
echo "========================================"
