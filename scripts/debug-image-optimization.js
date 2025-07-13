// Debug script to test image optimization service
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function debugImageOptimization() {
  console.log('🔍 Debugging Image Optimization Service Issues...\n');
  
  try {
    // Test 1: Check if image_optimizations table exists
    console.log('1️⃣ Testing image_optimizations table...');
    const { data, error } = await supabase
      .from('image_optimizations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ image_optimizations table error:', error.message);
      if (error.message.includes('does not exist')) {
        console.log('📋 The table needs to be created. Here\'s the SQL:');
        console.log(`
-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS image_optimizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties_v2(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    original_size_bytes BIGINT NOT NULL,
    thumbnail_filename TEXT,
    thumbnail_size_bytes BIGINT,
    medium_filename TEXT,
    medium_size_bytes BIGINT,
    full_filename TEXT,
    full_size_bytes BIGINT,
    optimization_time_ms INTEGER NOT NULL,
    storage_bucket TEXT DEFAULT 'property-images',
    original_path TEXT,
    thumbnail_path TEXT,
    medium_path TEXT,
    full_path TEXT,
    image_type TEXT,
    optimization_version TEXT DEFAULT 'v1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE image_optimizations ENABLE ROW LEVEL SECURITY;

-- Basic policy for testing
CREATE POLICY "Allow all for now" ON image_optimizations FOR ALL USING (true);
        `);
        return;
      }
    } else {
      console.log('✅ image_optimizations table exists and is accessible');
    }

    // Test 2: Check storage bucket
    console.log('\n2️⃣ Testing storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Storage bucket error:', bucketError.message);
    } else {
      const propertyBucket = buckets.find(b => b.name === 'property-images');
      if (propertyBucket) {
        console.log('✅ property-images bucket exists');
      } else {
        console.log('⚠️  property-images bucket not found');
        console.log('Available buckets:', buckets.map(b => b.name));
      }
    }

    // Test 3: Test imageOptimizationService import
    console.log('\n3️⃣ Testing imageOptimizationService import...');
    try {
      const module = await import('../src/services/imageOptimizationService.js');
      console.log('✅ imageOptimizationService imports successfully');
      console.log('Available exports:', Object.keys(module));
    } catch (importError) {
      console.error('❌ Import error:', importError.message);
    }

    // Test 4: Test browser-image-compression
    console.log('\n4️⃣ Testing browser-image-compression...');
    try {
      const compression = await import('browser-image-compression');
      console.log('✅ browser-image-compression imports successfully');
    } catch (compressionError) {
      console.error('❌ browser-image-compression error:', compressionError.message);
    }

    // Test 5: Check properties_v2 table (for foreign key reference)
    console.log('\n5️⃣ Testing properties_v2 table...');
    const { data: propData, error: propError } = await supabase
      .from('properties_v2')
      .select('id')
      .limit(1);
    
    if (propError) {
      console.error('❌ properties_v2 table error:', propError.message);
    } else {
      console.log('✅ properties_v2 table accessible');
      if (propData && propData.length > 0) {
        console.log('Sample property ID for testing:', propData[0].id);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugImageOptimization().catch(console.error);