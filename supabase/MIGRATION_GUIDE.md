# GuardTech Database Migration Guide

## Overview
GuardTech uses **Supabase** as its primary database. All database setup is handled through the consolidated `schema.sql` file.

## Setup Instructions

### For New Supabase Projects:
1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Copy the entire contents of `schema.sql` into the SQL Editor
4. Execute the script
5. Your database is now ready to use!

### Environment Variables:
```env
# Backend (.env)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres

# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Schema Contents

The `schema.sql` file includes:
- ✅ All required extensions (uuid-ossp, postgis, vector)
- ✅ Complete table definitions with proper constraints
- ✅ Row Level Security (RLS) policies
- ✅ Storage bucket configuration
- ✅ Performance indexes
- ✅ Audit logging setup

## Tables

| Table | Purpose |
|-------|---------|
| `wards` | City ward/district reference data |
| `users` | User accounts (citizen/official/admin) |
| `civic_issues` | Anonymous issue reports with geospatial data |
| `ai_analysis` | AI analysis results for detected issues |
| `audit_logs` | Audit trail of system changes |

## Storage Buckets

- **civic-issue-images** - Images uploaded with civic issues (5MB max per file)

## Key Features

✅ **Row Level Security** - Fine-grained access control  
✅ **PostGIS Integration** - Geospatial queries  
✅ **UUID Primary Keys** - Globally unique identifiers  
✅ **Timestamps** - Automatic created_at/updated_at  
✅ **Audit Logging** - Track all data changes  
✅ **Indexes** - Optimized query performance  

## Cleanup History

Old migration files have been removed:
- ~~init.sql~~ - Old Docker PostgreSQL initialization
- ~~migrate_to_supabase.sql~~ - Old manual migration script
- ~~migrate_supabase.py~~ - Old Python migration tool
- ~~add_title_column.sql~~ - Consolidated into schema.sql
- ~~add_address_ward_columns.sql~~ - Consolidated into schema.sql
- ~~civic_issues_schema.sql~~ - Superseded by schema.sql

Use only `schema.sql` for all database setup going forward!

## Support

For Supabase documentation: https://supabase.com/docs
