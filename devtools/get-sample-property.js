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

async function getSampleProperties() {
  try {
    const { data, error } = await supabase
      .from('properties_v2')
      .select('id, title, property_details')
      .not('property_details', 'is', null)
      .limit(5);

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Properties with details:');
    data.forEach((prop, i) => {
      console.log(`${i + 1}. ${prop.id} - ${prop.title || 'No title'}`);
      
      // Check if property has images
      if (prop.property_details) {
        const hasImages = JSON.stringify(prop.property_details).includes('images') || 
                         JSON.stringify(prop.property_details).includes('imageFiles');
        console.log(`   Has images: ${hasImages ? 'Yes' : 'No'}`);
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

getSampleProperties();