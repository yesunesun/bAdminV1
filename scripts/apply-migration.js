// Script to apply the image_optimizations table migration
// Run with: node scripts/apply-migration.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('🚀 Applying image_optimizations table migration...');
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250713133411_create_image_optimizations_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL statements and execute them one by one
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`  ${i + 1}/${statements.length}: Executing...`);
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement + ';' 
      });
      
      if (error) {
        // Try direct approach if rpc fails
        const { error: directError } = await supabase
          .from('_migrations')
          .select('*')
          .limit(1);
        
        if (directError) {
          console.log('⚠️  RPC method not available, using alternative approach...');
          
          // Alternative: Use raw SQL execution via REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey
            },
            body: JSON.stringify({ sql: statement + ';' })
          });
          
          if (!response.ok) {
            console.error(`❌ Failed to execute statement ${i + 1}:`, statement.substring(0, 100) + '...');
            const errorText = await response.text();
            console.error('Error:', errorText);
            throw new Error(`Migration failed at statement ${i + 1}`);
          }
        } else {
          console.error(`❌ Failed to execute statement ${i + 1}:`, error.message);
          throw error;
        }
      }
      
      console.log(`  ✅ Statement ${i + 1} executed successfully`);
    }
    
    console.log('\n🎉 Migration applied successfully!');
    console.log('📊 Created table: image_optimizations');
    console.log('🔒 Row Level Security enabled');
    console.log('📈 Performance indexes created');
    console.log('⚡ Triggers and policies configured');
    
    // Verify table creation
    const { data, error } = await supabase
      .from('image_optimizations')
      .select('*')
      .limit(1);
    
    if (error && !error.message.includes('No rows')) {
      console.error('⚠️  Table verification failed:', error.message);
    } else {
      console.log('✅ Table verification successful');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Check if we can create a more direct approach
async function directMigration() {
  try {
    console.log('🚀 Attempting direct table creation...');
    
    // Try to create the table directly
    const createTableSQL = `
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
    `;
    
    // Use Supabase SQL editor approach
    console.log('📝 Creating table via Supabase client...');
    
    // Try using the SQL function if available
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ 
        query: createTableSQL
      })
    });
    
    if (response.ok) {
      console.log('✅ Table created successfully');
    } else {
      const errorText = await response.text();
      console.log('⚠️  Direct creation failed, manual intervention required');
      console.log('SQL to execute manually:');
      console.log('\n--- Copy this SQL to Supabase SQL Editor ---');
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250713133411_create_image_optimizations_table.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      console.log(migrationSQL);
      console.log('--- End of SQL ---\n');
    }
    
  } catch (error) {
    console.log('⚠️  Direct approach failed, manual intervention required');
    console.log('Please execute the migration manually in Supabase SQL Editor');
    
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250713133411_create_image_optimizations_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('\n--- Copy this SQL to Supabase SQL Editor ---');
    console.log(migrationSQL);
    console.log('--- End of SQL ---\n');
  }
}

// Run the migration
if (process.argv.includes('--direct')) {
  directMigration();
} else {
  applyMigration();
}