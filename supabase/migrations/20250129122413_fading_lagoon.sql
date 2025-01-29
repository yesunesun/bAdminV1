/*
  # Add property_details column

  1. Changes
    - Add JSONB column `property_details` to store additional property information
    - This column will store all the form data that doesn't fit into the standard columns

  2. Notes
    - Using JSONB for flexible schema and better query performance
    - Allows storing all form fields while maintaining the core columns for common queries
*/

-- Add property_details column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'property_details'
  ) THEN
    ALTER TABLE properties ADD COLUMN property_details JSONB;
  END IF;
END $$;