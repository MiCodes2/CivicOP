-- ============================================================================
-- Advanced Governance System Migration
-- Adds: Role hierarchy, Ward-based assignments, Issue assignments
-- ============================================================================

-- 1. Update users table to support new roles
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('citizen', 'official', 'admin', 'ward_admin', 'ward_executive_engineer'));

-- Add designation column for more detailed role info
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS designation VARCHAR(100);

-- Add assigned ward zones (can manage multiple wards)
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS assigned_wards INTEGER[];

COMMENT ON COLUMN users.role IS 'User role: citizen, official, admin, ward_admin, ward_executive_engineer';
COMMENT ON COLUMN users.designation IS 'Official job title (e.g., Executive Engineer - Ward 85)';
COMMENT ON COLUMN users.assigned_wards IS 'Array of ward numbers the user is responsible for';

-- 2. Add assignment fields to civic_issues table
ALTER TABLE civic_issues 
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE civic_issues 
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE civic_issues 
  ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE civic_issues 
  ADD COLUMN IF NOT EXISTS ward_number_parsed INTEGER;

COMMENT ON COLUMN civic_issues.assigned_to IS 'User (ward admin or executive engineer) assigned to this issue';
COMMENT ON COLUMN civic_issues.assigned_at IS 'Timestamp when issue was assigned';
COMMENT ON COLUMN civic_issues.assigned_by IS 'User who made the assignment';
COMMENT ON COLUMN civic_issues.ward_number_parsed IS 'Parsed ward number (1-198) for Bengaluru';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_civic_issues_assigned_to ON civic_issues(assigned_to);
CREATE INDEX IF NOT EXISTS idx_civic_issues_ward_number_parsed ON civic_issues(ward_number_parsed);
CREATE INDEX IF NOT EXISTS idx_users_assigned_wards ON users USING GIN(assigned_wards);

-- 3. Create assignment history table for audit trail
CREATE TABLE IF NOT EXISTS issue_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES civic_issues(id) ON DELETE CASCADE,
    assigned_from UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_issue_assignments_issue ON issue_assignments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_assignments_assigned_to ON issue_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_issue_assignments_created_at ON issue_assignments(created_at DESC);

COMMENT ON TABLE issue_assignments IS 'Audit trail of all issue assignments and reassignments';

-- 4. Function to auto-assign issues to ward admin based on ward number
CREATE OR REPLACE FUNCTION auto_assign_to_ward_admin()
RETURNS TRIGGER AS $$
DECLARE
    ward_num INTEGER;
    ward_admin_id UUID;
BEGIN
    -- Parse ward number from ward_number text field
    IF NEW.ward_number IS NOT NULL THEN
        -- Extract numeric ward number (handles formats like "Ward 85", "85", "Ward 85 - Koramangala")
        ward_num := (regexp_match(NEW.ward_number, '(\d+)'))[1]::INTEGER;
        NEW.ward_number_parsed := ward_num;
        
        -- Find ward admin responsible for this ward
        SELECT id INTO ward_admin_id
        FROM users
        WHERE role = 'ward_admin'
          AND is_active = true
          AND ward_num = ANY(assigned_wards)
        ORDER BY created_at ASC
        LIMIT 1;
        
        -- Auto-assign if ward admin found
        IF ward_admin_id IS NOT NULL THEN
            NEW.assigned_to := ward_admin_id;
            NEW.assigned_at := CURRENT_TIMESTAMP;
            -- assigned_by is NULL for auto-assignments (system assigned)
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-assignment on insert
DROP TRIGGER IF EXISTS trigger_auto_assign_ward ON civic_issues;
CREATE TRIGGER trigger_auto_assign_ward
    BEFORE INSERT ON civic_issues
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_to_ward_admin();

-- 5. Function to log assignment changes
CREATE OR REPLACE FUNCTION log_assignment_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if assigned_to changed
    IF (TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
        INSERT INTO issue_assignments (issue_id, assigned_from, assigned_to, assigned_by, notes)
        VALUES (
            NEW.id,
            OLD.assigned_to,
            NEW.assigned_to,
            NEW.assigned_by,
            CASE 
                WHEN NEW.assigned_by IS NULL THEN 'Auto-assigned by system'
                ELSE 'Reassigned by user'
            END
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logging assignments
DROP TRIGGER IF EXISTS trigger_log_assignment ON civic_issues;
CREATE TRIGGER trigger_log_assignment
    AFTER UPDATE ON civic_issues
    FOR EACH ROW
    EXECUTE FUNCTION log_assignment_change();

-- 6. Update RLS policies for ward-based access
-- Drop existing policies if any
DROP POLICY IF EXISTS "Ward admins can view their ward issues" ON civic_issues;
DROP POLICY IF EXISTS "Ward admins can update their ward issues" ON civic_issues;
DROP POLICY IF EXISTS "Executive engineers can view assigned issues" ON civic_issues;
DROP POLICY IF EXISTS "Executive engineers can update assigned issues" ON civic_issues;

-- Ward admins can view all issues in their assigned wards
CREATE POLICY "Ward admins can view their ward issues"
    ON civic_issues FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
              AND users.role = 'ward_admin'
              AND users.is_active = true
              AND civic_issues.ward_number_parsed = ANY(users.assigned_wards)
        )
    );

-- Ward admins can update issues in their assigned wards
CREATE POLICY "Ward admins can update their ward issues"
    ON civic_issues FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
              AND users.role = 'ward_admin'
              AND users.is_active = true
              AND civic_issues.ward_number_parsed = ANY(users.assigned_wards)
        )
    );

-- Executive engineers can view issues assigned to them
CREATE POLICY "Executive engineers can view assigned issues"
    ON civic_issues FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
              AND users.role = 'ward_executive_engineer'
              AND users.is_active = true
              AND civic_issues.assigned_to = users.id
        )
    );

-- Executive engineers can update issues assigned to them
CREATE POLICY "Executive engineers can update assigned issues"
    ON civic_issues FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
              AND users.role = 'ward_executive_engineer'
              AND users.is_active = true
              AND civic_issues.assigned_to = users.id
        )
    );

-- 7. Create view for ward statistics
CREATE OR REPLACE VIEW ward_statistics AS
SELECT 
    ward_number_parsed as ward_number,
    COUNT(*) as total_issues,
    COUNT(*) FILTER (WHERE status = 'OPEN') as open_issues,
    COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress_issues,
    COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_issues,
    COUNT(*) FILTER (WHERE status = 'CLOSED') as closed_issues,
    AVG(severity) as avg_severity,
    COUNT(*) FILTER (WHERE assigned_to IS NOT NULL) as assigned_issues,
    MAX(created_at) as last_issue_date
FROM civic_issues
WHERE ward_number_parsed IS NOT NULL
GROUP BY ward_number_parsed
ORDER BY ward_number_parsed;

COMMENT ON VIEW ward_statistics IS 'Statistics per ward for governance dashboard';

-- 8. Grant permissions
GRANT SELECT, INSERT ON issue_assignments TO authenticated;
GRANT SELECT ON ward_statistics TO authenticated;

-- ============================================================================
-- End of migration
-- ============================================================================
