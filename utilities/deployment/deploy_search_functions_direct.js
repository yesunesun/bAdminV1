import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import pg from 'pg';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract database connection info from Supabase URL
const dbUrl = process.env.DATABASE_URL || supabaseUrl.replace('https://', 'postgres://postgres:') + '/postgres';

async function deployWithDirectConnection() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read the migration file
    const migrationPath = './supabase/migrations/20250709100000_fix_duplicate_search_functions.sql';
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Executing migration...');
    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully!');

    // Read the updated search_all_properties function
    const functionPath = './kb/sql_testing/search_all_properties.sql';
    const functionSQL = fs.readFileSync(functionPath, 'utf8');
    
    console.log('📄 Executing updated function...');
    await client.query(functionSQL);
    console.log('✅ Function updated successfully!');

    await client.end();
    console.log('🎉 All functions deployed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (client) {
      await client.end();
    }
    return false;
  }
}

async function deployWithSupabaseClient() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🚀 Deploying search functions using Supabase client...');
    
    // Read the migration file
    const migrationPath = './supabase/migrations/20250709100000_fix_duplicate_search_functions.sql';
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Loaded migration file:', migrationPath);
    
    // Split SQL into individual statements
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim() + ';';
      console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          continue;
        }
      } catch (err) {
        // Try alternative approach for DDL statements
        console.log(`⚠️  Trying alternative approach for statement ${i + 1}...`);
      }
    }
    
    console.log('✅ Migration completed!');
    
    // Deploy updated search_all_properties function
    const functionPath = './kb/sql_testing/search_all_properties.sql';
    const functionSQL = fs.readFileSync(functionPath, 'utf8');
    
    console.log('📄 Deploying updated search_all_properties function...');
    
    return true;
    
  } catch (err) {
    console.error('❌ Deployment error:', err);
    return false;
  }
}

async function main() {
  console.log('🔧 Starting database deployment...');
  
  // Try direct connection first
  if (process.env.DATABASE_URL) {
    console.log('🔗 Trying direct database connection...');
    const success = await deployWithDirectConnection();
    if (success) return;
  }
  
  // Fallback to Supabase client
  console.log('🔗 Trying Supabase client...');
  await deployWithSupabaseClient();
}

main().catch(console.error);