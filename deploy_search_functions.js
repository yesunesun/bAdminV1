import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deploySearchFunctions() {
  try {
    console.log('🚀 Deploying search functions to database...');
    
    // Read the migration file
    const migrationPath = './supabase/migrations/20250709100000_fix_duplicate_search_functions.sql';
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Loaded migration file:', migrationPath);
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Error deploying functions:', error);
      return false;
    }
    
    console.log('✅ Search functions deployed successfully!');
    return true;
    
  } catch (err) {
    console.error('❌ Deployment error:', err);
    return false;
  }
}

async function deployUpdatedSearchAllProperties() {
  try {
    console.log('🔄 Deploying updated search_all_properties function...');
    
    // Read the updated function
    const functionPath = './kb/sql_testing/search_all_properties.sql';
    const functionSQL = fs.readFileSync(functionPath, 'utf8');
    
    console.log('📄 Loaded updated function:', functionPath);
    
    // Execute the function update
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: functionSQL
    });
    
    if (error) {
      console.error('❌ Error deploying updated function:', error);
      return false;
    }
    
    console.log('✅ Updated search_all_properties function deployed successfully!');
    return true;
    
  } catch (err) {
    console.error('❌ Deployment error:', err);
    return false;
  }
}

async function main() {
  console.log('🔧 Starting database deployment...');
  
  // First deploy the individual search functions
  const functionsDeployed = await deploySearchFunctions();
  
  if (functionsDeployed) {
    // Then deploy the updated search_all_properties function
    const mainFunctionDeployed = await deployUpdatedSearchAllProperties();
    
    if (mainFunctionDeployed) {
      console.log('🎉 All functions deployed successfully!');
      console.log('✅ Ready to run tests again');
    }
  } else {
    console.log('❌ Failed to deploy functions');
  }
}

main().catch(console.error);