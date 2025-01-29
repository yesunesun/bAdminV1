/*
  # Create property images table

  1. New Tables
    - `property_images`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key to properties)
      - `url` (text, not null)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `property_images` table
    - Add policies for:
      - Public viewing of images
      - Authenticated users can manage images for their properties
*/

-- Create property images table
CREATE TABLE IF NOT EXISTS property_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid REFERENCES properties ON DELETE CASCADE,
    url text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

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