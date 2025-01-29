/*
  # Add missing columns to properties table

  1. Changes
    - Add missing columns for property details:
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `bedrooms` (integer)
      - `bathrooms` (numeric)
      - `square_feet` (numeric)
      - `description` (text)

  2. Security
    - No changes to RLS policies needed
*/

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'address') THEN
    ALTER TABLE properties ADD COLUMN address text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'city') THEN
    ALTER TABLE properties ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'state') THEN
    ALTER TABLE properties ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'zip_code') THEN
    ALTER TABLE properties ADD COLUMN zip_code text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bedrooms') THEN
    ALTER TABLE properties ADD COLUMN bedrooms integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bathrooms') THEN
    ALTER TABLE properties ADD COLUMN bathrooms numeric;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'square_feet') THEN
    ALTER TABLE properties ADD COLUMN square_feet numeric;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'description') THEN
    ALTER TABLE properties ADD COLUMN description text;
  END IF;
END $$;