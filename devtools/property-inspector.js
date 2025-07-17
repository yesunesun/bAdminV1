#!/usr/bin/env node

/**
 * Property Inspector Tool
 * 
 * This script inspects a property by:
 * 1. Fetching the property record from properties_v2 table
 * 2. Analyzing imageFiles section to determine storage path logic:
 *    - If imageFiles contains files starting with "opt_" → use /property-images-v2/properties/<id>/
 *    - Otherwise → use /property-images-v2/<id>/
 * 3. Listing all files in the determined storage folder
 * 4. Testing image URLs and generating detailed report
 * 
 * Usage: node property-inspector.js <property-id>
 * Example: node property-inspector.js 123e4567-e89b-12d3-a456-426614174000
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
function loadEnvFile() {
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
}

// Initialize
loadEnvFile();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = 'property-images-v2';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Try service role key first if available, fallback to anon key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey);

if (supabaseServiceRoleKey) {
  console.log('🔑 Using service role key for enhanced permissions');
} else {
  console.log('🔑 Using anonymous key (limited permissions)');
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Check if imageFiles contain optimized files (files starting with "opt_")
 */
function hasOptimizedFiles(imageFiles) {
  if (!imageFiles || !Array.isArray(imageFiles)) {
    return false;
  }
  
  return imageFiles.some(file => {
    const fileName = file.fileName || file.name || file;
    return typeof fileName === 'string' && fileName.startsWith('opt_');
  });
}

/**
 * List all files in the property's storage folder
 * Uses logic: if imageFiles has optimized files -> /properties/<id>/, else /<id>/
 */
async function listPropertyFiles(propertyId, imageFiles = null) {
  try {
    // Determine storage path based on imageFiles optimization status
    const isOptimized = hasOptimizedFiles(imageFiles);
    const storagePath = isOptimized ? `properties/${propertyId}/images/` : propertyId;
    
    console.log(`🔍 Image optimization detected: ${isOptimized ? 'YES' : 'NO'}`);
    console.log(`🔍 Listing files in storage folder: ${storagePath}/`);
    
    const { data: files, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(storagePath, {
        limit: 100,
        offset: 0
      });

    if (error) {
      console.error('❌ Error listing files:', error.message);
      console.log('🔍 Checking if bucket exists...');
      
      // Try to list buckets to verify access
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        console.error('❌ Error listing buckets:', bucketError.message);
      } else {
        console.log('📂 Available buckets:');
        buckets.forEach(bucket => {
          console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        });
        
        const targetBucket = buckets.find(b => b.name === STORAGE_BUCKET);
        if (targetBucket) {
          console.log(`✅ Target bucket '${STORAGE_BUCKET}' exists`);
        } else {
          console.log(`❌ Target bucket '${STORAGE_BUCKET}' not found`);
        }
      }
      
      return [];
    }

    if (!files || files.length === 0) {
      console.log('📂 No files found in storage folder');
      
      // If no files found in optimized path, try the alternate path
      if (isOptimized) {
        console.log('🔍 No files in optimized path, trying legacy path...');
        return await listPropertyFiles(propertyId, []); // Force non-optimized path
      }
      
      // Always check bucket info when no files found
      console.log('🔍 Checking bucket information...');
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        console.error('❌ Error listing buckets:', bucketError.message);
      } else {
        console.log('📂 Available buckets:');
        buckets.forEach(bucket => {
          console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        });
        
        const targetBucket = buckets.find(b => b.name === STORAGE_BUCKET);
        if (targetBucket) {
          console.log(`✅ Target bucket '${STORAGE_BUCKET}' exists`);
        } else {
          console.log(`❌ Target bucket '${STORAGE_BUCKET}' not found`);
          
          // Check if property-images (without -v2) exists
          const legacyBucket = buckets.find(b => b.name === 'property-images');
          if (legacyBucket) {
            console.log(`🔍 Found legacy bucket 'property-images' - should we check there?`);
          }
        }
      }
      
      return [];
    }

    console.log(`📂 Found ${files.length} files in storage (${storagePath}/):`);
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name} (${formatFileSize(file.metadata?.size || 0)})`);
    });

    return files;
  } catch (error) {
    console.error('❌ Unexpected error listing files:', error);
    return [];
  }
}

/**
 * Get property record from database
 */
async function getPropertyRecord(propertyId) {
  try {
    console.log(`\n🔍 Fetching property record: ${propertyId}`);
    
    const { data: property, error } = await supabase
      .from('properties_v2')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (error) {
      console.error('❌ Error fetching property:', error.message);
      return null;
    }

    if (!property) {
      console.log('❌ Property not found in database');
      return null;
    }

    console.log('✅ Property record found');
    console.log(`   Title: ${property.title || 'N/A'}`);
    console.log(`   Created: ${property.created_at || 'N/A'}`);
    console.log(`   Status: ${property.status || 'N/A'}`);
    console.log(`   Category: ${property.category || 'N/A'}`);
    console.log(`   Type: ${property.type || 'N/A'}`);

    return property;
  } catch (error) {
    console.error('❌ Unexpected error fetching property:', error);
    return null;
  }
}

/**
 * Test if images from JSON actually exist in storage
 */
async function testImageUrls(propertyId, imageFiles) {
  if (!imageFiles || imageFiles.length === 0) {
    return [];
  }

  console.log(`\n🔗 Testing image URLs for property ${propertyId}:`);
  const results = [];
  
  // Determine storage path based on optimization status
  const isOptimized = hasOptimizedFiles(imageFiles);
  const storagePath = isOptimized ? `properties/${propertyId}` : propertyId;
  
  console.log(`🔍 Using storage path: ${storagePath}/ (optimized: ${isOptimized})`);

  for (const file of imageFiles) {
    const fileName = file.fileName || file.name || (typeof file === 'string' ? file : JSON.stringify(file));
    try {
      // Try to get public URL using correct storage path
      const { data: urlData } = supabase
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(`${storagePath}/${fileName}`);

      const publicUrl = urlData.publicUrl;
      
      // Test if the URL actually returns an image
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        const exists = response.ok;
        const size = response.headers.get('content-length');
        
        results.push({
          fileName,
          publicUrl,
          exists,
          size: size ? parseInt(size) : 0,
          status: response.status,
          storagePath
        });

        console.log(`   ${exists ? '✅' : '❌'} ${fileName} (${exists ? formatFileSize(parseInt(size || '0')) : 'not found'})`);
      } catch (fetchError) {
        results.push({
          fileName,
          publicUrl,
          exists: false,
          size: 0,
          status: 'fetch_error',
          storagePath
        });
        console.log(`   ❌ ${fileName} (fetch error)`);
      }
    } catch (error) {
      results.push({
        fileName,
        publicUrl: null,
        exists: false,
        size: 0,
        status: 'url_error',
        storagePath
      });
      console.log(`   ❌ ${fileName} (URL error)`);
    }
  }

  return results;
}

/**
 * Extract and display imageFiles section from property_details
 */
async function displayImageFiles(property) {
  try {
    console.log(`\n📸 Analyzing imageFiles section:`);
    
    const propertyDetails = property.property_details;
    if (!propertyDetails) {
      console.log('❌ No property_details found');
      return { found: false, files: [] };
    }

    // Display raw property_details structure
    console.log('\n📄 Raw property_details structure:');
    console.log(JSON.stringify(propertyDetails, null, 2));

    // Use the shared analysis function
    const imageAnalysis = analyzeImageFiles(property);

    console.log(`\n📷 ImageFiles Analysis:`);
    console.log(`   Location: ${imageAnalysis.location || 'NOT FOUND'}`);
    
    if (imageAnalysis.found) {
      console.log(`   Count: ${imageAnalysis.files.length}`);
      console.log(`   Raw data:`);
      console.log(JSON.stringify(imageAnalysis.files, null, 2));
      
      console.log(`\n📝 Individual files:`);
      imageAnalysis.files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${typeof file === 'string' ? file : JSON.stringify(file)}`);
      });

      // Test if these images actually exist
      const urlTestResults = await testImageUrls(property.id, imageAnalysis.files);
      imageAnalysis.urlTestResults = urlTestResults;
    } else {
      console.log('   ❌ No imageFiles array found in property_details');
    }

    return imageAnalysis;
  } catch (error) {
    console.error('❌ Error analyzing imageFiles:', error);
    return { found: false, files: [] };
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(propertyId, storageFiles, property, imageAnalysis) {
  const timestamp = new Date().toISOString();
  let markdown = `# Property Inspection Report\n\n`;
  markdown += `**Property ID:** ${propertyId}\n`;
  markdown += `**Generated:** ${timestamp}\n\n`;
  
  // Storage Files Section
  markdown += `## Storage Files Analysis\n\n`;
  markdown += `**Bucket:** ${STORAGE_BUCKET}\n`;
  
  // Determine storage path information
  let storagePath = propertyId;
  let isOptimized = false;
  
  if (imageAnalysis && imageAnalysis.found) {
    isOptimized = hasOptimizedFiles(imageAnalysis.files);
    storagePath = isOptimized ? `properties/${propertyId}` : propertyId;
  }
  
  markdown += `**Folder:** ${storagePath}/\n`;
  markdown += `**Optimization Detected:** ${isOptimized ? 'YES' : 'NO'}\n`;
  markdown += `**Logic Applied:** ${isOptimized ? 'Files start with "opt_" → using /properties/<id>/' : 'No optimization → using /<id>/'}\n\n`;
  
  if (storageFiles && storageFiles.length > 0) {
    markdown += `**Files Found:** ${storageFiles.length}\n\n`;
    markdown += `| # | File Name | Size | Last Modified |\n`;
    markdown += `|---|-----------|------|---------------|\n`;
    
    storageFiles.forEach((file, index) => {
      const size = formatFileSize(file.metadata?.size || 0);
      const lastModified = file.updated_at || file.created_at || 'N/A';
      markdown += `| ${index + 1} | ${file.name} | ${size} | ${lastModified} |\n`;
    });
  } else {
    markdown += `**Files Found:** 0\n\n`;
    markdown += `❌ No files found in storage folder\n\n`;
  }
  
  // Database Record Section
  markdown += `\n## Database Record\n\n`;
  
  if (property) {
    markdown += `**Record Status:** ✅ Found\n\n`;
    markdown += `### Basic Information\n`;
    markdown += `- **Title:** ${property.title || 'N/A'}\n`;
    markdown += `- **Status:** ${property.status || 'N/A'}\n`;
    markdown += `- **Category:** ${property.category || 'N/A'}\n`;
    markdown += `- **Type:** ${property.type || 'N/A'}\n`;
    markdown += `- **Created:** ${property.created_at || 'N/A'}\n`;
    markdown += `- **Updated:** ${property.updated_at || 'N/A'}\n`;
    markdown += `- **Owner ID:** ${property.owner_id || 'N/A'}\n\n`;
    
    // Property Details JSON
    markdown += `### Property Details JSON\n\n`;
    if (property.property_details) {
      markdown += `\`\`\`json\n`;
      markdown += JSON.stringify(property.property_details, null, 2);
      markdown += `\n\`\`\`\n\n`;
    } else {
      markdown += `❌ No property_details found\n\n`;
    }
    
    // ImageFiles Analysis
    markdown += `### ImageFiles Analysis\n\n`;
    
    if (imageAnalysis && imageAnalysis.found) {
      markdown += `**Location:** ${imageAnalysis.location}\n`;
      markdown += `**Count:** ${imageAnalysis.files.length}\n\n`;
      
      // URL Test Results
      if (imageAnalysis.urlTestResults && imageAnalysis.urlTestResults.length > 0) {
        markdown += `**URL Test Results:**\n\n`;
        markdown += `| # | File Name | Status | Size | Public URL |\n`;
        markdown += `|---|-----------|--------|------|------------|\n`;
        
        imageAnalysis.urlTestResults.forEach((result, index) => {
          const status = result.exists ? '✅ Exists' : '❌ Missing';
          const size = result.exists ? formatFileSize(result.size) : 'N/A';
          const url = result.publicUrl || 'N/A';
          markdown += `| ${index + 1} | ${result.fileName} | ${status} | ${size} | ${url} |\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `**Individual Files:**\n`;
      imageAnalysis.files.forEach((file, index) => {
        markdown += `${index + 1}. ${typeof file === 'string' ? file : JSON.stringify(file)}\n`;
      });
      markdown += `\n**Raw Data:**\n`;
      markdown += `\`\`\`json\n`;
      markdown += JSON.stringify(imageAnalysis.files, null, 2);
      markdown += `\n\`\`\`\n\n`;
    } else {
      markdown += `❌ No imageFiles array found in property_details\n\n`;
    }
    
    // Storage vs Database Comparison
    markdown += `### Storage vs Database Comparison\n\n`;
    const storageCount = storageFiles ? storageFiles.length : 0;
    const dbCount = imageAnalysis.found ? imageAnalysis.files.length : 0;
    
    markdown += `- **Storage Files:** ${storageCount}\n`;
    markdown += `- **Database Records:** ${dbCount}\n`;
    
    if (storageCount === dbCount) {
      markdown += `- **Status:** ✅ Match\n\n`;
    } else {
      markdown += `- **Status:** ⚠️ Mismatch\n\n`;
    }
    
  } else {
    markdown += `**Record Status:** ❌ Not found\n\n`;
  }
  
  return markdown;
}

/**
 * Analyze imageFiles from property details (separated for reuse)
 */
function analyzeImageFiles(property) {
  const propertyDetails = property.property_details;
  if (!propertyDetails) {
    return { found: false, location: null, files: [] };
  }

  // Look for imageFiles in different locations
  const locations = [
    'imageFiles',
    'media.photos.images',
    'media.images',
    'details.media.images',
    'details.imageFiles'
  ];

  for (const location of locations) {
    const value = getNestedValue(propertyDetails, location);
    if (value && Array.isArray(value)) {
      return { found: true, location, files: value };
    }
  }

  return { found: false, location: null, files: [] };
}

/**
 * Save markdown report to file
 */
function saveMarkdownReport(propertyId, content) {
  const filename = `${propertyId}.md`;
  const filepath = join(__dirname, filename);
  
  try {
    writeFileSync(filepath, content, 'utf8');
    console.log(`📝 Markdown report saved: ${filename}`);
    return filepath;
  } catch (error) {
    console.error('❌ Error saving markdown report:', error);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  const propertyId = process.argv[2];

  if (!propertyId) {
    console.error('❌ Usage: node property-inspector.js <property-id>');
    console.error('Example: node property-inspector.js 123e4567-e89b-12d3-a456-426614174000');
    process.exit(1);
  }

  if (!isValidUUID(propertyId)) {
    console.error('❌ Invalid UUID format');
    process.exit(1);
  }

  console.log('🔍 Property Inspector Tool');
  console.log('=' .repeat(50));
  console.log(`Property ID: ${propertyId}`);
  console.log(`Storage Bucket: ${STORAGE_BUCKET}`);
  console.log(`Storage Folder: ${propertyId}/`);
  console.log('=' .repeat(50));

  try {
    // 1. Get property record first to analyze imageFiles
    const property = await getPropertyRecord(propertyId);

    let imageAnalysis = null;
    let imageFiles = null;
    
    if (property) {
      // 2. Analyze imageFiles section to determine storage path
      imageAnalysis = analyzeImageFiles(property);
      imageFiles = imageAnalysis.found ? imageAnalysis.files : null;
      
      console.log(`\n📷 ImageFiles Analysis:`);
      console.log(`   Found: ${imageAnalysis.found ? 'YES' : 'NO'}`);
      if (imageAnalysis.found) {
        console.log(`   Count: ${imageAnalysis.files.length}`);
        console.log(`   Has optimized files: ${hasOptimizedFiles(imageAnalysis.files) ? 'YES' : 'NO'}`);
      }
    }

    // 3. List storage files using the imageFiles information
    const storageFiles = await listPropertyFiles(propertyId, imageFiles);

    if (property && imageAnalysis) {
      // 4. Display detailed imageFiles section
      imageAnalysis = await displayImageFiles(property);
    }

    // 5. Generate and save markdown report
    console.log('\n📝 Generating markdown report...');
    const markdownContent = generateMarkdownReport(propertyId, storageFiles, property, imageAnalysis);
    const savedFile = saveMarkdownReport(propertyId, markdownContent);

    console.log('\n✅ Inspection complete!');
    if (savedFile) {
      console.log(`📄 Report saved to: ${savedFile}`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();