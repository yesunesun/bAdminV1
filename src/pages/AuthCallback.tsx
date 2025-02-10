// src/pages/AuthCallback.tsx
// Version: 1.2.1
// Last Modified: 10-02-2025 23:55 IST

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Debug logging
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Port:', window.location.port);

        // Get the hash fragment from the URL
        const hashFragment = window.location.hash;
        
        if (!hashFragment) {
          // Check if we're handling a fresh page load
          if (window.location.pathname === '/') {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              navigate('/dashboard');
              return;
            }
            navigate('/login');
            return;
          }
          setError('No authentication data found');
          return;
        }

        // Parse the hash fragment
        const params = new URLSearchParams(hashFragment.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (!accessToken || !refreshToken) {
          console.error('Missing tokens in URL');
          setError('Invalid authentication tokens');
          return;
        }

        // Handle the session
        try {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) throw sessionError;

          // Verify the session was set
          const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
          
          if (getSessionError) throw getSessionError;
          
          if (session) {
            console.log('Authentication successful, redirecting to dashboard...');
            navigate('/dashboard');
          } else {
            throw new Error('Session could not be established');
          }
        } catch (authError) {
          console.error('Authentication error:', authError);
          setError(authError.message);
        }

      } catch (err) {
        console.error('Error processing authentication:', err);
        setError('An unexpected error occurred');
      }
    };

    // Add a small delay to ensure the URL is fully processed
    setTimeout(handleCallback, 100);
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <div className="mt-2 text-sm text-gray-500">
            {window.location.href}
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we complete your sign in</p>
      </div>
    </div>
  );
}