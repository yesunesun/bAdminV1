#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
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

async function countPropertyImages() {
  try {
    console.log('🔍 Scanning property-images-v2 bucket...');
    
    // List all files in the property-images-v2 bucket
    const { data: files, error } = await supabase.storage
      .from('property-images-v2')
      .list('', {
        limit: 10000,
        offset: 0
      });

    if (error) {
      console.error('❌ Error listing bucket contents:', error.message);
      return;
    }

    console.log(`📂 Found ${files.length} top-level items in property-images-v2 bucket`);
    
    const propertyImageCounts = [];
    let totalImages = 0;
    let processedFolders = 0;
    
    // Process each property folder (filter out non-UUID folders)
    for (const item of files) {
      if (item.name && 
          item.name !== '.emptyFolderPlaceholder' && 
          item.name !== 'properties' &&
          item.name !== '.DS_Store') {
        processedFolders++;
        
        // List images in this property folder
        const { data: propertyFiles, error: propertyError } = await supabase.storage
          .from('property-images-v2')
          .list(`${item.name}`, {
            limit: 1000,
            offset: 0
          });

        if (propertyError) {
          console.error(`❌ Error listing files for property ${item.name}:`, propertyError.message);
          propertyImageCounts.push({
            folder: item.name,
            imageCount: 0,
            images: [],
            error: propertyError.message
          });
          continue;
        }

        // Count actual image files (exclude folders and placeholders)
        const imageFiles = propertyFiles.filter(file => 
          file.name && 
          file.name !== '.emptyFolderPlaceholder' && 
          (file.name.toLowerCase().endsWith('.jpg') || 
           file.name.toLowerCase().endsWith('.jpeg') || 
           file.name.toLowerCase().endsWith('.png') || 
           file.name.toLowerCase().endsWith('.gif') || 
           file.name.toLowerCase().endsWith('.webp'))
        );

        const imageCount = imageFiles.length;
        totalImages += imageCount;
        
        propertyImageCounts.push({
          folder: item.name,
          imageCount: imageCount,
          images: imageFiles.map(file => file.name)
        });

        // Progress indicator
        if (processedFolders % 50 === 0) {
          console.log(`📊 Processed ${processedFolders} folders, ${totalImages} images so far...`);
        }
      }
    }

    // Sort by image count (descending) for better insights
    propertyImageCounts.sort((a, b) => b.imageCount - a.imageCount);

    // Generate CSV content
    const csvHeader = 'Folder,Image Count\n';
    const csvRows = propertyImageCounts.map(item => 
      `${item.folder},${item.imageCount}`
    ).join('\n');
    const csvContent = csvHeader + csvRows;

    // Save CSV file
    const csvOutputPath = join(__dirname, 'property-image-counts.csv');
    writeFileSync(csvOutputPath, csvContent, 'utf8');

    // Generate Markdown content
    const mdHeader = '# Property Image Count Report\n\n';
    const mdSummary = `**Total Property Folders:** ${propertyImageCounts.length}\n**Total Images:** ${totalImages}\n**Average Images per Property:** ${(totalImages / propertyImageCounts.length).toFixed(2)}\n\n---\n\n`;
    
    const mdContent = mdHeader + mdSummary + propertyImageCounts.map(item => {
      const folderLine = `## ${item.folder} (${item.imageCount})\n`;
      if (item.imageCount === 0) {
        return folderLine + '- *No images found*\n';
      }
      const imageList = item.images.map(image => `- ${image}`).join('\n');
      return folderLine + imageList + '\n';
    }).join('\n');

    // Save Markdown file
    const mdOutputPath = join(__dirname, 'property-image-report.md');
    writeFileSync(mdOutputPath, mdContent, 'utf8');

    // Display summary
    console.log('\n📊 Property Image Count Summary:');
    console.log('=' .repeat(50));
    console.log(`Total property folders: ${propertyImageCounts.length}`);
    console.log(`Total images: ${totalImages}`);
    console.log(`Average images per property: ${(totalImages / propertyImageCounts.length).toFixed(2)}`);
    
    // Show top 10 properties with most images
    console.log('\n🏆 Top 10 Properties by Image Count:');
    propertyImageCounts.slice(0, 10).forEach((item, index) => {
      console.log(`${index + 1}. ${item.folder}: ${item.imageCount} images`);
    });

    // Show properties with no images
    const noImageProperties = propertyImageCounts.filter(item => item.imageCount === 0);
    if (noImageProperties.length > 0) {
      console.log(`\n⚠️  Properties with no images: ${noImageProperties.length}`);
      console.log('First 5 properties without images:');
      noImageProperties.slice(0, 5).forEach(item => {
        console.log(`  - ${item.folder}`);
      });
    }

    console.log(`\n✅ CSV report saved to: ${csvOutputPath}`);
    console.log(`✅ Markdown report saved to: ${mdOutputPath}`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
countPropertyImages();