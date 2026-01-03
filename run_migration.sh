#!/bin/bash
# GuardTech Database Migration - Quick Start Script

set -e

echo "🚀 GuardTech Database Migration"
echo "=================================="
echo ""

# Check if database URL is set
if [ -z "$DATABASE_URL" ] && [ -z "$SUPABASE_DB_URL" ]; then
    echo "❌ Error: DATABASE_URL not set!"
    echo ""
    echo "Please set your Supabase connection string:"
    echo "export DATABASE_URL='postgresql://postgres.[id]:[pass]@aws-0-region.pooler.supabase.com:6543/postgres'"
    exit 1
fi

# Use DATABASE_URL or SUPABASE_DB_URL
DB_URL=${DATABASE_URL:-$SUPABASE_DB_URL}
echo "✅ Database URL found"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

echo "📦 Checking Python dependencies..."
python3 -c "import psycopg2" 2>/dev/null || {
    echo "Installing psycopg2..."
    pip install psycopg2-binary
}

python3 -c "import dotenv" 2>/dev/null || {
    echo "Installing python-dotenv..."
    pip install python-dotenv
}

echo "✅ Dependencies ready"
echo ""

echo "🔄 Running migration..."
python3 migrate_supabase.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Verify tables in Supabase dashboard"
    echo "2. Check RLS policies are enabled"
    echo "3. Test API endpoints"
    echo ""
    echo "📚 See MIGRATION_GUIDE.md for detailed instructions"
else
    echo ""
    echo "❌ Migration failed. Check the errors above."
    exit 1
fi
