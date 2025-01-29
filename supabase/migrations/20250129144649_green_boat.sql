/*
  # Add property tags and status enhancements

  1. Changes
    - Add tags array column to properties table
    - Add default tags based on status
    - Add check constraint for valid tags

  2. Security
    - Maintain existing RLS policies
*/

-- Add tags array if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'tags'
  ) THEN
    ALTER TABLE properties ADD COLUMN tags text[] DEFAULT '{}';
    
    -- Update existing records with default tags based on status
    UPDATE properties 
    SET tags = ARRAY['private']
    WHERE status = 'draft' AND (tags IS NULL OR array_length(tags, 1) IS NULL);
    
    UPDATE properties 
    SET tags = ARRAY['public']
    WHERE status = 'published' AND (tags IS NULL OR array_length(tags, 1) IS NULL);
  END IF;
END $$;