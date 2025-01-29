/*
  # Add storage bucket for property images

  1. New Storage Bucket
    - Creates a new public storage bucket named 'property-images'
    - Enables public access for viewing images
  
  2. Security
    - Enables authenticated users to upload images
    - Restricts image uploads to property owners
*/

-- Enable the storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage";

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
DO $$
BEGIN
  -- Policy to allow public to view images
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE bucket_id = 'property-images' 
    AND name = 'Public View'
  ) THEN
    CREATE POLICY "Public View"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'property-images');
  END IF;

  -- Policy to allow authenticated users to upload images
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE bucket_id = 'property-images' 
    AND name = 'Authenticated Upload'
  ) THEN
    CREATE POLICY "Authenticated Upload"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'property-images' AND
        (auth.uid() IN (
          SELECT owner_id FROM properties
          WHERE id::text = (storage.foldername(name))[1]
        ))
      );
  END IF;
END $$;