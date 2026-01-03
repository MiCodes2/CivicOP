#!/usr/bin/env python3
"""
Clean up old migration files from supabase directory
"""
import os
import sys

supabase_dir = "/workspaces/GuardTech/supabase"

# Files to remove
old_files = [
    "add_address_ward_columns.sql",
    "add_title_column.sql",
    "civic_issues_schema.sql"
]

print("🧹 Cleaning up old migration files...\n")

for file in old_files:
    filepath = os.path.join(supabase_dir, file)
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
            print(f"✅ Deleted: {file}")
        except Exception as e:
            print(f"❌ Error deleting {file}: {e}")
    else:
        print(f"⏭️  Already deleted or doesn't exist: {file}")

print("\n📁 Remaining files in supabase/:")
remaining = os.listdir(supabase_dir)
for item in remaining:
    print(f"  • {item}")

print("\n✨ Cleanup complete!")
