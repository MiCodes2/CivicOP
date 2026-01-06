#!/bin/bash

# ============================================================================
# GuardTech Cache Verification Script
# Verifies that the stale data fixes are working correctly
# ============================================================================

echo "🔍 Verifying Stale Data Fixes..."
echo ""

# Check 1: Verify polling interval was changed
echo "1️⃣ Checking polling interval in map-view.js..."
if grep -q "30000" "/workspaces/GuardTech/frontend/pages/map-view.js"; then
    echo "   ✅ Polling interval correctly set to 30000ms (30 seconds)"
else
    echo "   ❌ Polling interval not updated in map-view.js"
    exit 1
fi

# Check 2: Verify polling interval in index.js
echo "2️⃣ Checking polling interval in index.js..."
if grep -q "30000" "/workspaces/GuardTech/frontend/pages/index.js"; then
    echo "   ✅ Polling interval correctly set to 30000ms in index.js"
else
    echo "   ❌ Polling interval not updated in index.js"
    exit 1
fi

# Check 3: Verify realtime subscriptions removed
echo "3️⃣ Checking that realtime subscriptions are removed..."
if ! grep -q "postgres_changes" "/workspaces/GuardTech/frontend/pages/index.js"; then
    echo "   ✅ Realtime subscriptions removed from index.js"
else
    echo "   ❌ Realtime subscriptions still present in index.js"
    exit 1
fi

# Check 4: Verify cache-busting headers added
echo "4️⃣ Checking for cache-busting headers..."
if grep -q "Cache-Control.*no-cache.*no-store" "/workspaces/GuardTech/frontend/pages/index.js"; then
    echo "   ✅ Cache-busting headers added to index.js"
else
    echo "   ❌ Cache-busting headers not found in index.js"
    exit 1
fi

if grep -q "Cache-Control.*no-cache.*no-store" "/workspaces/GuardTech/frontend/pages/map-view.js"; then
    echo "   ✅ Cache-busting headers added to map-view.js"
else
    echo "   ❌ Cache-busting headers not found in map-view.js"
    exit 1
fi

# Check 5: Verify REST API usage
echo "5️⃣ Checking for direct REST API usage (not Supabase client)..."
if grep -q "\/rest\/v1\/civic_issues" "/workspaces/GuardTech/frontend/pages/index.js"; then
    echo "   ✅ Direct REST API calls implemented in index.js"
else
    echo "   ❌ REST API calls not found in index.js"
    exit 1
fi

if grep -q "\/rest\/v1\/civic_issues" "/workspaces/GuardTech/frontend/pages/map-view.js"; then
    echo "   ✅ Direct REST API calls implemented in map-view.js"
else
    echo "   ❌ REST API calls not found in map-view.js"
    exit 1
fi

echo ""
echo "============================================"
echo "✅ All fixes verified successfully!"
echo "============================================"
echo ""
echo "📋 Next Steps:"
echo "1. Clear browser cache (Ctrl+Shift+R)"
echo "2. Clear LocalStorage and Service Workers (F12 → Application)"
echo "3. Reload page and watch for:"
echo "   - Map updates every 30 seconds (not 5)"
echo "   - No stale resolved issues appearing"
echo "   - Smooth non-jittery updates"
echo ""
echo "📊 Changes Summary:"
echo "   • Polling: 5 seconds → 30 seconds (6x load reduction)"
echo "   • Cache headers: None → Full cache-busting"
echo "   • Realtime subscriptions: Active → Disabled"
echo "   • Data source: Supabase client → Direct REST API"
echo ""
