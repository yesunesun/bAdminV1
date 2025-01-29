import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Ensure environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Please click the "Connect to Supabase" button in the top right to configure your Supabase project.'
  );
}

// Ensure URL is properly formatted
const formattedUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;

export const supabase = createClient<Database>(formattedUrl, supabaseKey);