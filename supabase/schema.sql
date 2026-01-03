-- ============================================================================
-- GuardTech Database Schema for Supabase
-- Complete schema with all tables, storage, and RLS policies
-- ============================================================================
-- Run this entire script in Supabase SQL Editor to set up your database
-- ============================================================================

-- ============================================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- WARDS TABLE (City ward/location data)
CREATE TABLE IF NOT EXISTS wards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(255),
    city VARCHAR(255) DEFAULT 'Bengaluru',
    boundary TEXT,  -- GeoJSON for ward boundaries
    population INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, district)
);

CREATE INDEX IF NOT EXISTS idx_wards_name ON wards(name);
CREATE INDEX IF NOT EXISTS idx_wards_district ON wards(district);
CREATE INDEX IF NOT EXISTS idx_wards_city ON wards(city);

-- USERS TABLE (User accounts)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'citizen' CHECK (role IN ('citizen', 'official', 'admin')),
    ward_id INTEGER REFERENCES wards(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_ward_id ON users(ward_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- CIVIC_ISSUES TABLE (Main anonymous issue reporting)
CREATE TABLE IF NOT EXISTS civic_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
    category TEXT NOT NULL,
    address TEXT,
    ward_number TEXT,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography) STORED
);

CREATE INDEX IF NOT EXISTS idx_civic_issues_status ON civic_issues(status);
CREATE INDEX IF NOT EXISTS idx_civic_issues_category ON civic_issues(category);
CREATE INDEX IF NOT EXISTS idx_civic_issues_created_at ON civic_issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_civic_issues_severity ON civic_issues(severity);
CREATE INDEX IF NOT EXISTS idx_civic_issues_location ON civic_issues USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_civic_issues_title ON civic_issues(title);

-- AI_ANALYSIS TABLE (AI analysis results)
CREATE TABLE IF NOT EXISTS ai_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    civic_issue_id UUID REFERENCES civic_issues(id) ON DELETE CASCADE,
    analysis_type VARCHAR(100),
    model_version VARCHAR(50),
    confidence_score DOUBLE PRECISION,
    detected_objects JSONB,
    is_duplicate BOOLEAN DEFAULT false,
    severity_rating INTEGER,
    privacy_masked_image_url TEXT,
    results JSONB,
    embeddings vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_issue ON ai_analysis(civic_issue_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_created_at ON ai_analysis(created_at DESC);

-- AUDIT_LOGS TABLE (Audit trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    civic_issue_id UUID REFERENCES civic_issues(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    sla_breach BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_issue ON audit_logs(civic_issue_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- 3. CREATE TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_civic_issues_updated_at
    BEFORE UPDATE ON civic_issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. CREATE STORAGE BUCKET FOR ISSUE IMAGES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'civic-issue-images',
    'civic-issue-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE civic_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. CREATE RLS POLICIES
-- ============================================================================

-- WARDS: Public can view
CREATE POLICY "Public can view wards" ON wards
    FOR SELECT USING (true);

-- USERS: Own profile access
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- CIVIC_ISSUES: Public anonymous reporting and viewing
CREATE POLICY "Allow public insert on civic_issues" ON civic_issues
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on civic_issues" ON civic_issues
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated update on civic_issues" ON civic_issues
    FOR UPDATE USING (auth.role() = 'authenticated');

-- AI_ANALYSIS: Authenticated users only
CREATE POLICY "Authenticated users can view ai_analysis" ON ai_analysis
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can insert ai_analysis" ON ai_analysis
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- AUDIT_LOGS: Authenticated users only
CREATE POLICY "Authenticated users can view audit_logs" ON audit_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can insert audit_logs" ON audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 7. CREATE STORAGE POLICIES FOR IMAGE BUCKET
-- ============================================================================

CREATE POLICY "Allow public upload to civic-issue-images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'civic-issue-images');

CREATE POLICY "Allow public view civic-issue-images" ON storage.objects
    FOR SELECT USING (bucket_id = 'civic-issue-images');

CREATE POLICY "Allow admin delete from civic-issue-images" ON storage.objects
    FOR DELETE USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'service_role'
    );

-- ============================================================================
-- SCHEMA SETUP COMPLETE
-- ============================================================================
-- Tables created:
--   ✓ wards             - City ward/location data
--   ✓ users             - User accounts (citizen/official/admin)
--   ✓ civic_issues      - Anonymous issue reports (main table)
--   ✓ ai_analysis       - AI analysis results
--   ✓ audit_logs        - Audit trail
--
-- Storage Bucket:
--   ✓ civic-issue-images - For uploading issue images (5MB per file)
--
-- Features included:
--   ✓ UUID primary keys
--   ✓ PostGIS geospatial support
--   ✓ Vector embeddings for AI
--   ✓ Automatic timestamps
--   ✓ Cascading deletes
--   ✓ Row Level Security (RLS)
--   ✓ Storage bucket for images
--   ✓ Comprehensive indexes for performance
--
-- Next steps:
--   1. Run this script in Supabase SQL Editor
--   2. Verify all tables exist in Table Editor
--   3. Check RLS policies are active
--   4. Test image upload to civic-issue-images bucket
--   5. Test API endpoints
-- ============================================================================
