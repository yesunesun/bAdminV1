/*
  # Fix storage bucket configuration

  1. Changes
    - Recreate storage bucket with proper configuration
    - Set up proper storage policies for authenticated users
    - Configure file size limits and allowed MIME types

  2. Security
    - Enable public access for viewing images
    - Restrict upload/delete to authenticated property owners
*/

-- Enable storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage" SCHEMA extensions;

-- Drop existing bucket if it exists
DROP POLICY IF EXISTS "Public View" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete images" ON storage.objects;

-- Recreate bucket with proper configuration
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

-- Create storage policies
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