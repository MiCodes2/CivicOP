-- Migration: Add title column to civic_issues table
-- Run this if you already have the civic_issues table created

-- Add title column (nullable initially to allow for existing records)
ALTER TABLE civic_issues 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Update existing records with a default title based on category
UPDATE civic_issues 
SET title = category || ' Issue'
WHERE title IS NULL;

-- Now make the column NOT NULL
ALTER TABLE civic_issues 
ALTER COLUMN title SET NOT NULL;

-- Add index on title for search performance
CREATE INDEX IF NOT EXISTS idx_civic_issues_title ON civic_issues(title);
