-- CivicOp Database Schema for Anonymous Issue Reporting
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create civic_issues table
CREATE TABLE IF NOT EXISTS civic_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_civic_issues_status ON civic_issues(status);
CREATE INDEX IF NOT EXISTS idx_civic_issues_category ON civic_issues(category);
CREATE INDEX IF NOT EXISTS idx_civic_issues_created_at ON civic_issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_civic_issues_severity ON civic_issues(severity);
CREATE INDEX IF NOT EXISTS idx_civic_issues_location ON civic_issues USING GIST(location);

-- Create updated_at trigger function
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

-- Enable Row Level Security
ALTER TABLE civic_issues ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to INSERT (report issues)
CREATE POLICY "Allow public insert" ON civic_issues
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow public to SELECT (view issues)
CREATE POLICY "Allow public select" ON civic_issues
    FOR SELECT
    USING (true);

-- Policy: Only authenticated admin users can UPDATE
CREATE POLICY "Allow admin update" ON civic_issues
    FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Policy: Only authenticated admin users can DELETE
CREATE POLICY "Allow admin delete" ON civic_issues
    FOR DELETE
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Create storage bucket for issue images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'issues',
    'issues',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Allow public to upload images
CREATE POLICY "Allow public upload" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'issues');

-- Storage policy: Allow public to view images
CREATE POLICY "Allow public view" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'issues');

-- Storage policy: Only admins can delete images
CREATE POLICY "Allow admin delete storage" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'issues' AND (
            auth.jwt() ->> 'role' = 'admin' OR
            auth.jwt() ->> 'role' = 'service_role'
        )
    );

-- Create a function to get nearby issues
CREATE OR REPLACE FUNCTION nearby_civic_issues(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
    id UUID,
    description TEXT,
    image_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    severity INTEGER,
    category TEXT,
    status TEXT,
    distance_meters DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.id,
        ci.description,
        ci.image_url,
        ci.latitude,
        ci.longitude,
        ci.severity,
        ci.category,
        ci.status,
        ST_Distance(
            ci.location,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) as distance_meters,
        ci.created_at
    FROM civic_issues ci
    WHERE ST_DWithin(
        ci.location,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
        radius_meters
    )
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data for testing (optional - comment out for production)
-- INSERT INTO civic_issues (description, latitude, longitude, severity, category, image_url) VALUES
-- ('Large pothole on main road causing traffic issues', 28.6139, 77.2090, 4, 'Pothole', 'https://example.com/pothole1.jpg'),
-- ('Overflowing garbage bin at market', 28.6129, 77.2295, 3, 'Garbage', 'https://example.com/garbage1.jpg'),
-- ('Streetlight not working since 3 days', 28.6149, 77.2085, 2, 'Streetlight', 'https://example.com/light1.jpg');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON civic_issues TO anon, authenticated;
GRANT UPDATE, DELETE ON civic_issues TO authenticated;

COMMENT ON TABLE civic_issues IS 'Anonymous civic issue reports from citizens';
COMMENT ON COLUMN civic_issues.severity IS 'Severity level: 1=Low, 2=Minor, 3=Medium, 4=High, 5=Critical';
COMMENT ON COLUMN civic_issues.status IS 'Issue status: OPEN, IN_PROGRESS, RESOLVED, CLOSED';
