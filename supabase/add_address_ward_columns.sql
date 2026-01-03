-- Migration: Add address and ward_number columns to civic_issues table
-- Run this in your Supabase SQL Editor if the table already exists

-- Add address column
ALTER TABLE civic_issues 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add ward_number column
ALTER TABLE civic_issues 
ADD COLUMN IF NOT EXISTS ward_number TEXT;

-- Add comments for new columns
COMMENT ON COLUMN civic_issues.address IS 'Full address of the issue location';
COMMENT ON COLUMN civic_issues.ward_number IS 'Ward number where the issue is located (optional)';
