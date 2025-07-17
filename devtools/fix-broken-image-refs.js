#!/usr/bin/env node

/**
 * Fix Broken Image References and Clean Up Properties Tool
 * 
 * This script identifies and cleans up properties with issues by:
 * 1. Fetching all properties from the database
 * 2. Checking if property_details has proper JSON structure with steps section
 * 3. DELETING properties with incomplete/corrupted JSON structure (no steps section)
 * 4. For valid properties: analyzing imageFiles section and checking file existence
 * 5. Removing broken image references from valid properties
 * 
 * Usage: node fix-broken-image-refs.js [--dry-run] [--property-id <id>]
 * 
 * Options:
 *   --dry-run      Show what would be fixed/deleted without making changes
 *   --property-id  Process only specific property ID
 * 
 * Examples:
 *   node fix-broken-image-refs.js --dry-run
 *   node fix-broken-image-refs.js --property-id 123e4567-e89b-12d3-a456-426614174000
 *   node fix-broken-image-refs.js
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
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const STORAGE_BUCKET = 'property-images-v2';

if (!supabaseUrl || (!supabaseServiceRoleKey && !supabaseAnonKey)) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (preferred) or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Use service role key for write operations
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey);

if (supabaseServiceRoleKey) {
  console.log('🔑 Using service role key for write operations');
} else {
  console.log('⚠️  Using anonymous key - may have limited permissions');
}

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const PROPERTY_ID = args.includes('--property-id') ? args[args.indexOf('--property-id') + 1] : null;

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
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

/**
 * Set nested value in object using dot notation
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;
  
  for (const key of keys) {
    if (current[key] === undefined || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}

/**
 * Analyze imageFiles from property details
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
 * Check if a file exists in storage
 */
async function checkFileExists(propertyId, fileName, isOptimized) {
  try {
    const storagePath = isOptimized ? `properties/${propertyId}/images` : propertyId;
    const fullPath = `${storagePath}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(storagePath, {
        limit: 1000,
        search: fileName
      });

    if (error) {
      console.error(`   ❌ Error checking file ${fileName}:`, error.message);
      return false;
    }

    return data && data.some(file => file.name === fileName);
  } catch (error) {
    console.error(`   ❌ Unexpected error checking file ${fileName}:`, error);
    return false;
  }
}

/**
 * Get all properties from database
 */
async function getAllProperties() {
  try {
    let allProperties = [];
    let from = 0;
    const limit = 1000;
    
    while (true) {
      const { data: properties, error } = await supabase
        .from('properties_v2')
        .select('id, title, property_details, status, created_at')
        .range(from, from + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching properties:', error.message);
        return [];
      }

      if (!properties || properties.length === 0) {
        break;
      }

      allProperties = allProperties.concat(properties);
      from += limit;
    }

    return allProperties;
  } catch (error) {
    console.error('❌ Unexpected error fetching properties:', error);
    return [];
  }
}

/**
 * Get single property by ID
 */
async function getPropertyById(propertyId) {
  try {
    const { data: property, error } = await supabase
      .from('properties_v2')
      .select('id, title, property_details, status, created_at')
      .eq('id', propertyId)
      .single();

    if (error) {
      console.error('❌ Error fetching property:', error.message);
      return null;
    }

    return property;
  } catch (error) {
    console.error('❌ Unexpected error fetching property:', error);
    return null;
  }
}

/**
 * Check if property has valid JSON structure with steps section
 */
function hasValidJsonStructure(property) {
  const propertyDetails = property.property_details;
  
  // Check if property_details exists and is an object
  if (!propertyDetails || typeof propertyDetails !== 'object') {
    return false;
  }
  
  // Check if it has details section with steps
  if (!propertyDetails.details || typeof propertyDetails.details !== 'object') {
    return false;
  }
  
  // Check if details section has at least one step (property keys that look like steps)
  const detailsKeys = Object.keys(propertyDetails.details);
  const hasSteps = detailsKeys.some(key => {
    // Look for step-like keys (e.g., res_rent_basic_details, com_sale_location, etc.)
    return key.includes('_') && key.length > 5;
  });
  
  return hasSteps;
}

/**
 * Delete property from database
 */
async function deleteProperty(propertyId) {
  try {
    const { error } = await supabase
      .from('properties_v2')
      .delete()
      .eq('id', propertyId);
    
    if (error) {
      console.error(`   ❌ Error deleting property:`, error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`   ❌ Unexpected error deleting property:`, error);
    return false;
  }
}

/**
 * Process a single property to identify and fix broken image references
 */
async function processProperty(property, confirmDelete = null) {
  console.log(`\n🔍 Processing property: ${property.id}`);
  console.log(`   Title: ${property.title || 'N/A'}`);
  console.log(`   Status: ${property.status || 'N/A'}`);
  console.log(`   Created: ${property.created_at || 'N/A'}`);
  
  // First check if property has valid JSON structure
  const hasValidStructure = hasValidJsonStructure(property);
  
  if (!hasValidStructure) {
    console.log('   ❌ Property has invalid JSON structure (no steps section)');
    console.log('   🗑️  Property will be DELETED');
    
    if (DRY_RUN) {
      console.log('   🔍 DRY RUN - would DELETE this property');
      return {
        processed: true,
        action: 'would_delete',
        reason: 'invalid_json_structure',
        hadBrokenRefs: false,
        brokenFiles: [],
        fixedFiles: []
      };
    }
    
    // Check if we need confirmation for this deletion
    if (confirmDelete !== null && !confirmDelete) {
      console.log('   ⏭️  Deletion not confirmed - skipping');
      return {
        processed: false,
        action: 'deletion_not_confirmed',
        reason: 'invalid_json_structure',
        hadBrokenRefs: false,
        brokenFiles: [],
        fixedFiles: []
      };
    }
    
    const deleted = await deleteProperty(property.id);
    
    if (deleted) {
      console.log('   ✅ Property DELETED successfully');
      return {
        processed: true,
        action: 'deleted',
        reason: 'invalid_json_structure',
        hadBrokenRefs: false,
        brokenFiles: [],
        fixedFiles: []
      };
    } else {
      return {
        processed: false,
        action: 'delete_failed',
        reason: 'invalid_json_structure',
        hadBrokenRefs: false,
        brokenFiles: [],
        fixedFiles: []
      };
    }
  }
  
  console.log('   ✅ Property has valid JSON structure');
  
  const imageAnalysis = analyzeImageFiles(property);
  
  if (!imageAnalysis.found) {
    console.log('   ℹ️  No imageFiles found - skipping');
    return {
      processed: true,
      action: 'no_images',
      hadBrokenRefs: false,
      brokenFiles: [],
      fixedFiles: []
    };
  }

  console.log(`   📷 Found ${imageAnalysis.files.length} image references in ${imageAnalysis.location}`);
  
  const isOptimized = hasOptimizedFiles(imageAnalysis.files);
  console.log(`   🔧 Optimization detected: ${isOptimized ? 'YES' : 'NO'}`);
  
  const brokenFiles = [];
  const validFiles = [];
  
  console.log('   🔍 Checking file existence...');
  
  for (const file of imageAnalysis.files) {
    const fileName = file.fileName || file.name || (typeof file === 'string' ? file : JSON.stringify(file));
    const exists = await checkFileExists(property.id, fileName, isOptimized);
    
    if (exists) {
      validFiles.push(file);
      console.log(`      ✅ ${fileName} - exists`);
    } else {
      brokenFiles.push(file);
      console.log(`      ❌ ${fileName} - missing`);
    }
  }
  
  const hadBrokenRefs = brokenFiles.length > 0;
  
  if (!hadBrokenRefs) {
    console.log('   ✅ All image references are valid');
    return {
      processed: true,
      action: 'no_broken_refs',
      hadBrokenRefs: false,
      brokenFiles: [],
      fixedFiles: validFiles
    };
  }
  
  console.log(`   🔧 Found ${brokenFiles.length} broken references out of ${imageAnalysis.files.length} total`);
  
  if (DRY_RUN) {
    console.log('   🔍 DRY RUN - would remove broken references');
    return {
      processed: true,
      action: 'would_fix_refs',
      hadBrokenRefs: true,
      brokenFiles,
      fixedFiles: validFiles
    };
  }
  
  // Update property_details with cleaned imageFiles
  const updatedPropertyDetails = { ...property.property_details };
  setNestedValue(updatedPropertyDetails, imageAnalysis.location, validFiles);
  
  try {
    const { error } = await supabase
      .from('properties_v2')
      .update({ property_details: updatedPropertyDetails })
      .eq('id', property.id);
    
    if (error) {
      console.error(`   ❌ Error updating property:`, error.message);
      return {
        processed: false,
        action: 'update_failed',
        hadBrokenRefs: true,
        brokenFiles,
        fixedFiles: validFiles,
        error: error.message
      };
    }
    
    console.log(`   ✅ Updated property - removed ${brokenFiles.length} broken references`);
    return {
      processed: true,
      action: 'fixed_refs',
      hadBrokenRefs: true,
      brokenFiles,
      fixedFiles: validFiles
    };
    
  } catch (error) {
    console.error(`   ❌ Unexpected error updating property:`, error);
    return {
      processed: false,
      action: 'update_error',
      hadBrokenRefs: true,
      brokenFiles,
      fixedFiles: validFiles,
      error: error.message
    };
  }
}

/**
 * Generate summary report
 */
function generateSummaryReport(results) {
  const timestamp = new Date().toISOString();
  let report = `# Broken Image References Fix Report\n\n`;
  report += `**Generated:** ${timestamp}\n`;
  report += `**Mode:** ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`;
  report += `**Total Properties Processed:** ${results.length}\n\n`;
  
  const processedCount = results.filter(r => r.processed).length;
  const brokenRefsCount = results.filter(r => r.hadBrokenRefs).length;
  const totalBrokenFiles = results.reduce((sum, r) => sum + r.brokenFiles.length, 0);
  const totalFixedFiles = results.reduce((sum, r) => sum + r.fixedFiles.length, 0);
  
  report += `## Summary\n\n`;
  report += `- **Properties Processed:** ${processedCount}\n`;
  report += `- **Properties with Broken References:** ${brokenRefsCount}\n`;
  report += `- **Total Broken Files Found:** ${totalBrokenFiles}\n`;
  report += `- **Total Valid Files:** ${totalFixedFiles}\n\n`;
  
  if (brokenRefsCount > 0) {
    report += `## Properties with Broken References\n\n`;
    
    results.filter(r => r.hadBrokenRefs).forEach((result, index) => {
      report += `### ${index + 1}. ${result.property.title || 'Untitled'}\n`;
      report += `**Property ID:** ${result.property.id}\n`;
      report += `**Status:** ${result.property.status || 'N/A'}\n`;
      report += `**Broken Files:** ${result.brokenFiles.length}\n`;
      report += `**Valid Files:** ${result.fixedFiles.length}\n\n`;
      
      if (result.brokenFiles.length > 0) {
        report += `**Broken Files:**\n`;
        result.brokenFiles.forEach((file, i) => {
          const fileName = file.fileName || file.name || (typeof file === 'string' ? file : JSON.stringify(file));
          report += `- ${fileName}\n`;
        });
        report += `\n`;
      }
    });
  }
  
  return report;
}

/**
 * Main function
 */
async function main() {
  console.log('🔧 Broken Image References Fix Tool');
  console.log('=' .repeat(60));
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be applied)'}`);
  console.log(`Target: ${PROPERTY_ID ? `Single property ${PROPERTY_ID}` : 'All properties'}`);
  console.log(`Storage Bucket: ${STORAGE_BUCKET}`);
  console.log('=' .repeat(60));

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made to the database');
  }

  try {
    let properties = [];
    
    if (PROPERTY_ID) {
      if (!isValidUUID(PROPERTY_ID)) {
        console.error('❌ Invalid property ID format');
        process.exit(1);
      }
      
      const property = await getPropertyById(PROPERTY_ID);
      if (!property) {
        console.error('❌ Property not found');
        process.exit(1);
      }
      
      properties = [property];
    } else {
      console.log('📋 Fetching all properties...');
      properties = await getAllProperties();
      console.log(`✅ Found ${properties.length} properties`);
    }

    const results = [];
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(`\n[${i + 1}/${properties.length}] Processing property...`);
      
      const result = await processProperty(property);
      results.push({
        property,
        ...result
      });
    }

    // Generate and save report
    console.log('\n📊 Generating summary report...');
    const reportContent = generateSummaryReport(results);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFileName = `broken-image-refs-fix-report-${timestamp}.md`;
    const reportPath = join(__dirname, reportFileName);
    
    try {
      writeFileSync(reportPath, reportContent, 'utf8');
      console.log(`📄 Report saved to: ${reportPath}`);
    } catch (error) {
      console.error('❌ Error saving report:', error);
    }

    // Final summary
    const processedCount = results.filter(r => r.processed).length;
    const brokenRefsCount = results.filter(r => r.hadBrokenRefs).length;
    const totalBrokenFiles = results.reduce((sum, r) => sum + r.brokenFiles.length, 0);
    
    console.log('\n✅ Process complete!');
    console.log(`📊 Summary:`);
    console.log(`   - Properties processed: ${processedCount}`);
    console.log(`   - Properties with broken references: ${brokenRefsCount}`);
    console.log(`   - Total broken files found: ${totalBrokenFiles}`);
    
    if (DRY_RUN) {
      console.log('\n🔍 This was a DRY RUN - no changes were made');
      console.log('🔧 Run without --dry-run to apply fixes');
    } else if (brokenRefsCount > 0) {
      console.log('\n🔧 Broken references have been removed from the database');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();