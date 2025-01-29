/*
  # Refresh properties table schema

  1. Changes
    - Recreate properties table with all required columns
    - Preserve existing data
    - Ensure all required columns are present

  2. Security
    - Maintain existing RLS policies
*/

-- Create a temporary table to store existing data
CREATE TABLE IF NOT EXISTS properties_temp (LIKE properties INCLUDING ALL);
INSERT INTO properties_temp SELECT * FROM properties;

-- Drop and recreate the properties table
DROP TABLE IF EXISTS properties CASCADE;

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

-- Copy data back from temporary table
INSERT INTO properties 
SELECT * FROM properties_temp;

-- Drop temporary table
DROP TABLE properties_temp;

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Anyone can view properties"
    ON properties
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Users can insert their own properties"
    ON properties
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own properties"
    ON properties
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own properties"
    ON properties
    FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);