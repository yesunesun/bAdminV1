/*
  # Fix storage bucket setup for property images

  1. Storage Setup
    - Ensures storage extension is enabled
    - Creates property-images bucket with proper configuration
  
  2. Security
    - Adds policies for public viewing
    - Adds policies for authenticated uploads
    - Adds policies for image deletion
*/

-- Enable storage extension
CREATE EXTENSION IF NOT EXISTS "storage" SCHEMA extensions;

-- Create bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[];

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public View" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete images" ON storage.objects;

-- Create policies with proper checks
CREATE POLICY "Public View"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images' AND
  (auth.uid() IN (
    SELECT owner_id FROM properties
    WHERE id::text = (storage.foldername(name))[1]
  ))
);

CREATE POLICY "Owners can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  (auth.uid() IN (
    SELECT owner_id FROM properties
    WHERE id::text = (storage.foldername(name))[1]
  ))
);