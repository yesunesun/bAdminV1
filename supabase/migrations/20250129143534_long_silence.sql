/*
  # Add property status field

  1. Changes
    - Add status field to properties table with default value 'draft'
    - Add check constraint to ensure status is either 'draft' or 'published'
    - Update existing records to have 'draft' status if null

  2. Security
    - No changes to RLS policies needed
*/

-- Add status field if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE properties ADD COLUMN status text DEFAULT 'draft' NOT NULL;
    
    -- Add check constraint
    ALTER TABLE properties ADD CONSTRAINT valid_status CHECK (status IN ('draft', 'published'));
    
    -- Update any existing records
    UPDATE properties SET status = 'draft' WHERE status IS NULL;
  END IF;
END $$;