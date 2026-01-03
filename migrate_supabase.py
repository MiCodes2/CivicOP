#!/usr/bin/env python3
"""
GuardTech Database Migration Script for Supabase
Selectively migrates only required tables (civic_issues, users, wards, ai_analysis, audit_logs)
"""

import os
import sys
from pathlib import Path
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
SUPABASE_DB_URL = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")
SUPABASE_ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")

# Tables to migrate (in dependency order)
TABLES_TO_MIGRATE = [
    "wards",           # No dependencies
    "users",           # No dependencies
    "civic_issues",    # No dependencies
    "ai_analysis",     # Depends on civic_issues
    "audit_logs",      # Depends on users and civic_issues
]

def get_connection(connection_string):
    """Establish database connection"""
    if not connection_string:
        raise ValueError("Database connection string not provided")
    try:
        conn = psycopg2.connect(connection_string)
        return conn
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        sys.exit(1)

def check_table_exists(conn, table_name):
    """Check if a table exists in the database"""
    cursor = conn.cursor()
    try:
        cursor.execute(f"""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = %s
            )
        """, (table_name,))
        exists = cursor.fetchone()[0]
        return exists
    finally:
        cursor.close()

def get_table_row_count(conn, table_name):
    """Get the number of rows in a table"""
    cursor = conn.cursor()
    try:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        return count
    finally:
        cursor.close()

def run_migration_script(conn):
    """Run the SQL migration script"""
    script_path = Path(__file__).parent / "migrate_to_supabase.sql"
    
    if not script_path.exists():
        print(f"❌ Migration script not found: {script_path}")
        return False
    
    try:
        with open(script_path, 'r') as f:
            sql_script = f.read()
        
        cursor = conn.cursor()
        cursor.execute(sql_script)
        conn.commit()
        cursor.close()
        print("✅ Migration script executed successfully")
        return True
    except Exception as e:
        conn.rollback()
        print(f"❌ Error executing migration script: {e}")
        return False

def verify_migration(conn):
    """Verify that all required tables exist"""
    print("\n📋 Verifying migration...")
    all_exist = True
    
    for table in TABLES_TO_MIGRATE:
        exists = check_table_exists(conn, table)
        if exists:
            count = get_table_row_count(conn, table)
            print(f"✅ {table:<20} - {count} rows")
        else:
            print(f"❌ {table:<20} - NOT FOUND")
            all_exist = False
    
    return all_exist

def main():
    """Main migration function"""
    print("🚀 GuardTech Database Migration to Supabase")
    print("=" * 50)
    
    if not SUPABASE_DB_URL:
        print("""
❌ Missing database configuration!

Please set up your environment:
1. Add DATABASE_URL or SUPABASE_DB_URL to .env or .env.local
2. Get your Supabase connection string:
   - Go to your Supabase project
   - Settings → Database → Connection string
   - Copy the PostgreSQL connection string
   - Set it as DATABASE_URL in .env

Example:
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
        """)
        sys.exit(1)
    
    print("\n🔗 Connecting to Supabase database...")
    conn = get_connection(SUPABASE_DB_URL)
    print("✅ Connected successfully")
    
    print("\n📦 Running migration script...")
    if not run_migration_script(conn):
        conn.close()
        sys.exit(1)
    
    if not verify_migration(conn):
        conn.close()
        print("\n⚠️  Some tables may not have been created properly")
        sys.exit(1)
    
    conn.close()
    
    print("\n" + "=" * 50)
    print("✅ Migration completed successfully!")
    print("\n📝 Next steps:")
    print("1. Verify data in Supabase dashboard")
    print("2. Check Row Level Security (RLS) policies are active")
    print("3. Test API connections with your frontend")
    print("\n🔗 Tables migrated:")
    for table in TABLES_TO_MIGRATE:
        print(f"   - {table}")
    
if __name__ == "__main__":
    main()
