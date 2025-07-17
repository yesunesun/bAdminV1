#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
try {
  const envPath = join(__dirname, '../.env');
  const envContent = readFileSync(envPath, 'utf8');
  
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    }
  });
} catch (error) {
  console.log('⚠️  No .env file found, using system environment variables');
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function listBuckets() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error listing buckets:', error.message);
      return;
    }

    console.log('📂 Available Supabase Storage Buckets:');
    console.log('=' .repeat(40));
    
    if (!buckets || buckets.length === 0) {
      console.log('❌ No buckets found');
      return;
    }

    buckets.forEach((bucket, index) => {
      console.log(`${index + 1}. ${bucket.name}`);
      console.log(`   Public: ${bucket.public ? 'Yes' : 'No'}`);
      console.log(`   Created: ${bucket.created_at || 'N/A'}`);
      console.log(`   Updated: ${bucket.updated_at || 'N/A'}`);
      console.log('');
    });

    console.log('🔍 Checking for property image buckets:');
    const imageBuckets = buckets.filter(b => b.name.includes('property') && b.name.includes('image'));
    if (imageBuckets.length > 0) {
      imageBuckets.forEach(bucket => {
        console.log(`✅ Found: ${bucket.name}`);
      });
    } else {
      console.log('❌ No property image buckets found');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

listBuckets();