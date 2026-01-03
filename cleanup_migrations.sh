#!/bin/bash
# Cleanup old migration SQL files
cd /workspaces/GuardTech/supabase
rm -f add_address_ward_columns.sql add_title_column.sql civic_issues_schema.sql
echo "Old migration files removed. Keeping only schema.sql and MIGRATION_GUIDE.md"
ls -la
