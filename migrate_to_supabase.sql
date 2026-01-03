-- GuardTech Selective Database Migration for Supabase
-- This script sets up only the tables needed for the GuardTech app
-- Run this in the Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- 1. CIVIC_ISSUES TABLE (Main - Anonymous reporting)
-- ============================================
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

-- Create indexes for civic_issues
CREATE INDEX IF NOT EXISTS idx_civic_issues_status ON civic_issues(status);
CREATE INDEX IF NOT EXISTS idx_civic_issues_category ON civic_issues(category);
CREATE INDEX IF NOT EXISTS idx_civic_issues_created_at ON civic_issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_civic_issues_severity ON civic_issues(severity);
CREATE INDEX IF NOT EXISTS idx_civic_issues_location ON civic_issues USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_civic_issues_title ON civic_issues(title);

-- Create updated_at trigger function for civic_issues
CREATE OR REPLACE FUNCTION update_civic_issues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER update_civic_issues_timestamp
    BEFORE UPDATE ON civic_issues
    FOR EACH ROW
    EXECUTE FUNCTION update_civic_issues_updated_at();

-- ============================================
-- 2. USERS TABLE (For authenticated users/officials)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'citizen' CHECK (role IN ('citizen', 'official', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Create updated_at trigger function for users
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- ============================================
-- 3. WARDS TABLE (Ward/District information)
-- ============================================
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

-- ============================================
-- 4. AI_ANALYSIS TABLE (AI results for issues)
-- ============================================
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

-- ============================================
-- 5. AUDIT_LOGS TABLE (Audit trail)
-- ============================================
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

-- ============================================
-- 6. STORAGE BUCKET (For issue images)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'civic-issues',
    'civic-issues',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Civic Issues RLS
ALTER TABLE civic_issues ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT (report issues)
CREATE POLICY "Allow public insert on civic_issues" ON civic_issues
    FOR INSERT
    WITH CHECK (true);

-- Allow public to SELECT (view issues)
CREATE POLICY "Allow public select on civic_issues" ON civic_issues
    FOR SELECT
    USING (true);

-- Only authenticated users can UPDATE civic_issues
CREATE POLICY "Allow authenticated update on civic_issues" ON civic_issues
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Users table RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- AI Analysis RLS
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view AI analysis
CREATE POLICY "Authenticated users can view ai_analysis" ON ai_analysis
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Audit Logs RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view audit logs
CREATE POLICY "Authenticated users can view audit_logs" ON audit_logs
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Wards RLS
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;

-- Public can view wards
CREATE POLICY "Public can view wards" ON wards
    FOR SELECT
    USING (true);

-- Storage policies
CREATE POLICY "Allow public upload to civic-issues" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'civic-issues');

CREATE POLICY "Allow public view civic-issues" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'civic-issues');

CREATE POLICY "Allow admin delete from civic-issues" ON storage.objects
    FOR DELETE
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'service_role'
    );

-- ============================================
-- Migration Complete
-- ============================================
-- Tables created:
-- 1. civic_issues - Main issue reporting table
-- 2. users - User accounts and roles
-- 3. wards - Ward/district information
-- 4. ai_analysis - AI analysis results
-- 5. audit_logs - Audit trail
--
-- Note: Other tables from the main app are not included to avoid conflicts.
-- This ensures only tables needed by GuardTech are migrated.
