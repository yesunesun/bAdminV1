-- Drop existing policies
DROP POLICY IF EXISTS "Public View" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete images" ON storage.objects;

-- Recreate storage policies with proper checks
CREATE POLICY "Public View"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images' AND
  auth.uid() IN (
    SELECT owner_id 
    FROM properties 
    WHERE id::text = SPLIT_PART(name, '/', 1)
  )
);

CREATE POLICY "Owners can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid() IN (
    SELECT owner_id 
    FROM properties 
    WHERE id::text = SPLIT_PART(name, '/', 1)
  )
);