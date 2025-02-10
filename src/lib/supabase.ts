// src/lib/supabase.ts
// Version: 1.2.5
// Last Modified: 10-02-2025 23:45 IST

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add debug logging
console.log('Initializing Supabase client with URL:', 
  supabaseUrl?.substring(0, supabaseUrl.indexOf('.')) + '...');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create client with updated config to handle all redirect scenarios
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Handle all possible redirect URLs
    redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
  }
});

// Enhanced auth state monitoring with detailed logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, 
    session ? `Session exists for user: ${session.user.id}` : 'No session');
  
  if (event === 'SIGNED_IN' && session?.user?.email) {
    console.log('User signed in:', {
      email: session.user.email,
      lastSignIn: session.user.last_sign_in_at,
      redirectTo: window.location.origin
    });
  }
});

export type SupabaseClient = typeof supabase;