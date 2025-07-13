// Test script to verify the correct storage bucket exists
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

async function testBucket() {
  console.log('🔍 Testing Storage Buckets...\n');
  
  try {
    // List all buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error listing buckets:', error.message);
      return;
    }
    
    console.log('📦 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    // Check specific buckets
    const propertyImages = buckets.find(b => b.name === 'property-images');
    const propertyImagesV2 = buckets.find(b => b.name === 'property-images-v2');
    
    console.log('\n🎯 Bucket Status:');
    console.log(`property-images: ${propertyImages ? '✅ exists' : '❌ missing'}`);
    console.log(`property-images-v2: ${propertyImagesV2 ? '✅ exists' : '❌ missing'}`);
    
    if (!propertyImagesV2) {
      console.log('\n⚠️  The property-images-v2 bucket is missing!');
      console.log('This will cause the 500 error in PropertyImageUpload.');
      console.log('\nOptions:');
      console.log('1. Create property-images-v2 bucket in Supabase dashboard');
      console.log('2. OR change the component to use property-images bucket');
      
      if (propertyImages) {
        console.log('\n💡 Recommendation: Use existing property-images bucket');
      }
    } else {
      console.log('\n✅ All required buckets exist!');
      
      // Test file upload to the bucket
      console.log('\n🔧 Testing file upload to property-images-v2...');
      
      const testContent = 'test file content';
      const testPath = 'test/test-file.txt';
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('property-images-v2')
        .upload(testPath, testContent, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('❌ Upload test failed:', uploadError.message);
      } else {
        console.log('✅ Upload test successful');
        
        // Clean up test file
        await supabase.storage.from('property-images-v2').remove([testPath]);
        console.log('🧹 Test file cleaned up');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testBucket().catch(console.error);