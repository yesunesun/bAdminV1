/*
  # Fix properties table schema

  1. Changes
    - Ensure properties table has correct structure
    - Add missing columns if needed
    - Maintain data integrity
  
  2. Security
    - Preserve existing RLS policies
*/

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- First ensure the table exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'properties'
  ) THEN
    CREATE TABLE properties (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id uuid REFERENCES auth.users NOT NULL,
      title text NOT NULL,
      description text,
      price numeric NOT NULL,
      bedrooms integer,
      bathrooms numeric,
      square_feet numeric,
      address text,
      city text,
      state text,
      zip_code text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;

  -- Then add any missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'owner_id') THEN
    ALTER TABLE properties ADD COLUMN owner_id uuid REFERENCES auth.users NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'title') THEN
    ALTER TABLE properties ADD COLUMN title text NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'price') THEN
    ALTER TABLE properties ADD COLUMN price numeric NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'description') THEN
    ALTER TABLE properties ADD COLUMN description text;
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

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'created_at') THEN
    ALTER TABLE properties ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'updated_at') THEN
    ALTER TABLE properties ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Recreate policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'properties' 
    AND policyname = 'Anyone can view properties'
  ) THEN
    CREATE POLICY "Anyone can view properties"
      ON properties
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'properties' 
    AND policyname = 'Users can insert their own properties'
  ) THEN
    CREATE POLICY "Users can insert their own properties"
      ON properties
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = owner_id);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'properties' 
    AND policyname = 'Users can update their own properties'
  ) THEN
    CREATE POLICY "Users can update their own properties"
      ON properties
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = owner_id)
      WITH CHECK (auth.uid() = owner_id);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'properties' 
    AND policyname = 'Users can delete their own properties'
  ) THEN
    CREATE POLICY "Users can delete their own properties"
      ON properties
      FOR DELETE
      TO authenticated
      USING (auth.uid() = owner_id);
  END IF;
END $$;