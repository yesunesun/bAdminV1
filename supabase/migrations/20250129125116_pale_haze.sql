/*
  # Add status field to properties

  1. Changes
    - Add status field to properties table
    - Set default status to 'draft'
*/

-- Add status field if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE properties ADD COLUMN status text DEFAULT 'draft';
  END IF;
END $$;