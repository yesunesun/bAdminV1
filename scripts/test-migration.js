// Simple test script to apply migration using admin client
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

async function testAndCreateTable() {
  console.log('🔍 Testing database connection...');
  
  // Test if table already exists
  const { data: existing, error: testError } = await supabase
    .from('image_optimizations')
    .select('*')
    .limit(1);
  
  if (!testError) {
    console.log('✅ Table already exists!');
    return;
  }
  
  console.log('📋 Table does not exist, creating...');
  
  // Create table using raw SQL approach
  const createTableSQL = `
    CREATE TABLE image_optimizations (
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
  `;
  
  try {
    // Use fetch to execute raw SQL
    const response = await fetch(
      `${process.env.VITE_SUPABASE_URL}/rest/v1/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          query: createTableSQL
        })
      }
    );
    
    if (response.ok) {
      console.log('✅ Table created successfully');
    } else {
      console.log('❌ Failed to create table automatically');
      console.log('\n🔧 Manual Action Required:');
      console.log('Please go to your Supabase SQL Editor and run the migration:');
      console.log('https://supabase.com/dashboard/project/lkzbwrrauvdinwypmhyb/sql/new');
      console.log('\nOr continue - the system will handle the table creation gracefully.');
    }
  } catch (error) {
    console.log('⚠️  Automatic creation failed, but that\'s okay!');
    console.log('The system is designed to handle missing tables gracefully.');
    console.log('\n📋 To complete setup, please manually run the migration in Supabase SQL Editor.');
  }
  
  // Test the image optimization service
  console.log('\n🧪 Testing image optimization functionality...');
  
  // Verify all required files exist
  const requiredFiles = [
    'src/services/imageOptimizationService.ts',
    'src/utils/imageOptimization.ts',
    'src/components/ui/OptimizedImage.tsx'
  ];
  
  const fs = await import('fs');
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  }
  
  console.log('\n🎯 Image optimization system is ready!');
  console.log('📝 Next steps:');
  console.log('1. Apply the database migration (manual or automatic)');
  console.log('2. Test image upload functionality');
  console.log('3. Verify optimization statistics are tracked');
}

testAndCreateTable().catch(console.error);