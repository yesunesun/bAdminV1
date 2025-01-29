/*
  # Property Management Schema

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `bedrooms` (integer)
      - `bathrooms` (numeric)
      - `square_feet` (numeric)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `property_images`
      - `id` (uuid, primary key)
      - `property_id` (uuid, references properties)
      - `url` (text)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on both tables
    - Property owners can manage their own properties
    - Anyone can view properties
*/

-- Properties table
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

-- Property images table
CREATE TABLE property_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid REFERENCES properties ON DELETE CASCADE,
    url text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Policies for properties
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

-- Policies for property_images
CREATE POLICY "Anyone can view property images"
    ON property_images
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Users can manage images for their properties"
    ON property_images
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM properties
            WHERE id = property_images.property_id
            AND owner_id = auth.uid()
        )
    );