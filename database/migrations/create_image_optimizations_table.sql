-- Create image_optimizations table for tracking image optimization metadata
-- This table tracks all image optimizations performed on property images

CREATE TABLE IF NOT EXISTS image_optimizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties_v2(id) ON DELETE CASCADE,
    
    -- Original image information
    original_filename TEXT NOT NULL,
    original_size_bytes BIGINT NOT NULL,
    
    -- Optimized variants information
    thumbnail_filename TEXT,
    thumbnail_size_bytes BIGINT,
    
    medium_filename TEXT,
    medium_size_bytes BIGINT,
    
    full_filename TEXT,
    full_size_bytes BIGINT,
    
    -- Performance tracking
    optimization_time_ms INTEGER NOT NULL,
    
    -- Storage paths in Supabase
    storage_bucket TEXT DEFAULT 'property-images',
    original_path TEXT,
    thumbnail_path TEXT,
    medium_path TEXT,
    full_path TEXT,
    
    -- Metadata
    image_type TEXT, -- 'main', 'gallery', 'floor_plan', etc.
    optimization_version TEXT DEFAULT 'v1',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_image_optimizations_property_id ON image_optimizations(property_id);
CREATE INDEX IF NOT EXISTS idx_image_optimizations_created_at ON image_optimizations(created_at);
CREATE INDEX IF NOT EXISTS idx_image_optimizations_type ON image_optimizations(image_type);

-- Enable Row Level Security
ALTER TABLE image_optimizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view image optimizations for their properties" ON image_optimizations
    FOR SELECT USING (
        property_id IN (
            SELECT id FROM properties_v2 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert image optimizations for their properties" ON image_optimizations
    FOR INSERT WITH CHECK (
        property_id IN (
            SELECT id FROM properties_v2 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update image optimizations for their properties" ON image_optimizations
    FOR UPDATE USING (
        property_id IN (
            SELECT id FROM properties_v2 
            WHERE owner_id = auth.uid()
        )
    );

-- Admin policy for viewing all optimizations
CREATE POLICY "Admins can view all image optimizations" ON image_optimizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_image_optimizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_image_optimizations_updated_at
    BEFORE UPDATE ON image_optimizations
    FOR EACH ROW
    EXECUTE FUNCTION update_image_optimizations_updated_at();

-- Comments for documentation
COMMENT ON TABLE image_optimizations IS 'Tracks image optimization metadata for property images including original and optimized variants';
COMMENT ON COLUMN image_optimizations.optimization_time_ms IS 'Time taken to optimize the image in milliseconds';
COMMENT ON COLUMN image_optimizations.optimization_version IS 'Version of optimization algorithm used';