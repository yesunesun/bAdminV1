/*
  # Update property status system

  1. Changes
    - Ensure status is either 'draft' or 'published'
    - Remove 'private' from tags
    - Set all properties to 'draft' by default
    - Update existing records

  2. Security
    - Maintain existing RLS policies
*/

-- Ensure status has correct default and constraint
ALTER TABLE properties 
ALTER COLUMN status SET DEFAULT 'draft',
ALTER COLUMN status SET NOT NULL;

-- Drop existing constraint if it exists
ALTER TABLE properties 
DROP CONSTRAINT IF EXISTS valid_status;

-- Add new constraint
ALTER TABLE properties 
ADD CONSTRAINT valid_status 
CHECK (status IN ('draft', 'published'));

-- Update existing records
UPDATE properties 
SET status = 'draft' 
WHERE status IS NULL;

-- Remove 'private' from tags and ensure correct tags
UPDATE properties 
SET tags = CASE 
  WHEN status = 'published' THEN ARRAY['public']
  ELSE '{}'
END
WHERE true;