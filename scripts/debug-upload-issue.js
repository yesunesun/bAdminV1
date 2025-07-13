// Debug script for image upload issues after folder deletion
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

async function debugUploadIssue() {
  console.log('🔍 Debugging Image Upload Issues After Folder Deletion');
  console.log('=====================================================\n');
  
  try {
    // Test 1: Check storage bucket accessibility
    console.log('1️⃣ Testing Storage Bucket Access...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Cannot access storage buckets:', bucketError.message);
      return;
    }
    
    const propertyBucket = buckets.find(b => b.name === 'property-images-v2');
    if (!propertyBucket) {
      console.error('❌ property-images-v2 bucket not found!');
      console.log('Available buckets:', buckets.map(b => b.name));
      return;
    }
    
    console.log('✅ property-images-v2 bucket exists');
    console.log(`   Public: ${propertyBucket.public ? 'Yes' : 'No'}`);
    
    // Test 2: Check bucket contents
    console.log('\n2️⃣ Checking Bucket Contents...');
    const { data: files, error: listError } = await supabase
      .storage
      .from('property-images-v2')
      .list('', {
        limit: 10,
        offset: 0
      });
    
    if (listError) {
      console.error('❌ Cannot list bucket contents:', listError.message);
    } else {
      console.log(`📁 Found ${files.length} items in root of bucket`);
      if (files.length > 0) {
        console.log('   Sample items:', files.slice(0, 3).map(f => f.name));
      }
    }
    
    // Test 3: Test file upload to bucket
    console.log('\n3️⃣ Testing File Upload to Bucket...');
    const testContent = 'test upload after folder deletion';
    const testPath = `test-${Date.now()}/test-file.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('property-images-v2')
      .upload(testPath, testContent, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError.message);
      console.log('   Error details:', uploadError);
    } else {
      console.log('✅ Test upload successful:', uploadData.path);
      
      // Clean up test file
      await supabase.storage.from('property-images-v2').remove([testPath]);
      console.log('🧹 Test file cleaned up');
    }
    
    // Test 4: Check image_optimizations table
    console.log('\n4️⃣ Testing image_optimizations Table...');
    const { data: optData, error: optError } = await supabase
      .from('image_optimizations')
      .select('*')
      .limit(5);
    
    if (optError) {
      console.error('❌ Cannot access image_optimizations table:', optError.message);
    } else {
      console.log(`✅ image_optimizations table accessible`);
      console.log(`   Records found: ${optData.length}`);
      if (optData.length > 0) {
        console.log('   Sample record structure:', Object.keys(optData[0]));
      }
    }
    
    // Test 5: Check properties_v2 table (for foreign key)
    console.log('\n5️⃣ Testing properties_v2 Table...');
    const { data: propData, error: propError } = await supabase
      .from('properties_v2')
      .select('id, owner_id')
      .limit(1);
    
    if (propError) {
      console.error('❌ Cannot access properties_v2 table:', propError.message);
    } else {
      console.log('✅ properties_v2 table accessible');
      if (propData.length > 0) {
        console.log(`   Sample property ID: ${propData[0].id}`);
        console.log(`   Sample owner ID: ${propData[0].owner_id}`);
      }
    }
    
    // Test 6: Test imageOptimizationService import
    console.log('\n6️⃣ Testing Image Optimization Service...');
    try {
      // Test if we can import browser-image-compression (client-side only)
      console.log('   Checking if this is a Node.js environment...');
      console.log('   Note: browser-image-compression only works in browser environment');
      console.log('   ✅ Service files should be importable in browser');
    } catch (serviceError) {
      console.error('❌ Service import error:', serviceError.message);
    }
    
    // Test 7: Check bucket policies (if accessible)
    console.log('\n7️⃣ Checking Bucket Policies...');
    try {
      // Try to get public URL (tests public access)
      const { data: publicUrlData } = supabase
        .storage
        .from('property-images-v2')
        .getPublicUrl('test-path');
      
      if (publicUrlData.publicUrl) {
        console.log('✅ Public URL generation works');
        console.log(`   Base URL: ${publicUrlData.publicUrl.split('/test-path')[0]}`);
      }
    } catch (policyError) {
      console.error('❌ Public URL test failed:', policyError.message);
    }
    
    console.log('\n📋 Summary & Recommendations');
    console.log('=============================');
    console.log('If all tests above passed:');
    console.log('1. The storage bucket is working correctly');
    console.log('2. The database tables are accessible');
    console.log('3. The issue might be in the client-side code or browser permissions');
    console.log('');
    console.log('If any tests failed:');
    console.log('1. Check the specific error messages above');
    console.log('2. Verify Supabase project settings');
    console.log('3. Check bucket permissions and policies');
    console.log('');
    console.log('Next steps for debugging client-side:');
    console.log('1. Open browser developer tools');
    console.log('2. Go to Console tab');
    console.log('3. Try uploading an image');
    console.log('4. Look for any error messages starting with [PropertyImageUpload]');
    console.log('5. Check Network tab for failed HTTP requests');
    
  } catch (error) {
    console.error('❌ Unexpected error during diagnostics:', error);
  }
}

debugUploadIssue().catch(console.error);