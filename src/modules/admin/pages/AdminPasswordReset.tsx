// src/modules/admin/pages/AdminPasswordReset.tsx
// Version: 3.1.0
// Last Modified: 26-02-2025 17:30 IST
// Purpose: Handle admin password reset with improved token extraction and debugging

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AdminPasswordReset() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [processingReset, setProcessingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Flow control states
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [token, setToken] = useState<string | null>(null);
  
  // Debug URL parameters
  useEffect(() => {
    console.log('URL Path:', location.pathname);
    console.log('URL Search:', location.search);
    console.log('URL Hash:', location.hash);
    console.log('Search Params:', Object.fromEntries(searchParams.entries()));
    console.log('Complete URL:', window.location.href);
  }, [location, searchParams]);
  
  // Direct session check on page load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          console.log('Active session found on page load');
          setMode('reset');
          if (data.session.user?.email) {
            setEmail(data.session.user.email);
          }
        } else {
          console.log('No active session found on page load');
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };
    
    checkSession();
  }, []);

  // Extract token from URL on component mount
  useEffect(() => {
    const extractTokenFromUrl = () => {
      console.log('Extracting token from URL...');
      
      // Check all common parameters
      const possibleParams = ['token', 'access_token', 't', 'code', 'type'];
      let extractedToken = null;
      
      // Check in query params
      for (const param of possibleParams) {
        const value = searchParams.get(param);
        if (value) {
          console.log(`Found token in query param '${param}': ${value}`);
          extractedToken = value;
          break;
        }
      }
      
      // If not in query params, try hash fragment
      if (!extractedToken && location.hash) {
        console.log('Checking hash fragment:', location.hash);
        try {
          const hashParams = new URLSearchParams(location.hash.substring(1));
          for (const param of possibleParams) {
            const value = hashParams.get(param);
            if (value) {
              console.log(`Found token in hash param '${param}': ${value}`);
              extractedToken = value;
              break;
            }
          }
        } catch (e) {
          console.error('Error parsing hash params:', e);
        }
      }
      
      // Special case for Supabase recovery flow
      if (!extractedToken && location.hash && location.hash.includes('type=recovery')) {
        console.log('Found recovery type in hash, using full hash as token');
        extractedToken = location.hash.substring(1);
      }
      
      console.log('Final token extraction result:', !!extractedToken);
      return extractedToken;
    };

    const initializeResetPage = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check for Supabase recovery flow
        if (location.hash && location.hash.includes('type=recovery')) {
          console.log('Detected Supabase recovery flow');
          
          // Try to get session directly
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            console.log('Active session found, switching to reset mode');
            setMode('reset');
            if (data.session.user?.email) {
              setEmail(data.session.user.email);
            }
            setLoading(false);
            return;
          }
        }
        
        // Extract token from URL
        const extractedToken = extractTokenFromUrl();
        console.log('Token found in URL:', !!extractedToken);
        
        if (extractedToken) {
          setToken(extractedToken);
          
          // Try to get user info from the session to pre-fill email
          try {
            const { data, error: sessionError } = await supabase.auth.getSession();
            
            if (!sessionError && data?.session?.user?.email) {
              setEmail(data.session.user.email);
            }
          } catch (sessionError) {
            console.warn('Session error (non-critical):', sessionError);
            // Continue with reset flow even if session lookup fails
          }
          
          // Show password reset form
          setMode('reset');
        } else {
          // Check for type=recovery in URL without token
          const type = searchParams.get('type');
          if (type === 'recovery') {
            console.log('Recovery type found in URL without token, checking session');
            const { data } = await supabase.auth.getSession();
            if (data?.session) {
              console.log('Session found for recovery type');
              setMode('reset');
              if (data.session.user?.email) {
                setEmail(data.session.user.email);
              }
            } else {
              console.log('No session found for recovery type');
              setMode('request');
            }
          } else {
            // No token found, show request form
            setMode('request');
          }
        }
      } catch (err) {
        console.error('Init error:', err);
        setError('Failed to initialize the reset page. Please try again.');
        setMode('request');
      } finally {
        setLoading(false);
      }
    };

    initializeResetPage();
  }, [location, searchParams]);

  // Handle request for password reset email
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    setProcessingReset(true);
    setError(null);
    
    try {
      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/admin/reset-password`
        }
      );
      
      if (resetError) {
        throw new Error(`Failed to send reset email: ${resetError.message}`);
      }
      
      // Show success message
      setSuccess(true);
      
      // For development, log reset events
      if (import.meta.env.DEV) {
        console.log('Password reset email requested for:', email.trim());
      }
      
    } catch (err: any) {
      console.error('Reset request error:', err);
      setError(err.message || 'Failed to send reset email');
    } finally {
      setProcessingReset(false);
    }
  };
  
  // Handle setting new password
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError('Please enter a new password');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setProcessingReset(true);
    setError(null);
    
    try {
      // Try to update the user's password
      console.log('Attempting to update password');
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      
      if (updateError) {
        console.error('Password update error:', updateError);
        throw new Error(`Failed to update password: ${updateError.message}`);
      }
      
      console.log('Password updated successfully');
      
      // Password updated successfully
      setSuccess(true);
      
      // Sign out to ensure clean state
      await supabase.auth.signOut();
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/admin/login?reset_success=true');
      }, 2000);
      
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || 'Failed to reset password');
      setProcessingReset(false);
    }
  };

  // Add manual token verification for debugging
  const attemptTokenVerification = async () => {
    if (!token) return;
    
    try {
      console.log('Attempting manual token verification');
      
      // This will vary based on Supabase version
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      });
      
      if (error) {
        console.error('Manual token verification failed:', error);
      } else {
        console.log('Manual token verification succeeded');
        setMode('reset');
      }
    } catch (err) {
      console.error('Token verification error:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Success state for request mode
  if (mode === 'request' && success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-bold mb-2">Reset Email Sent</h1>
          <p className="text-gray-600 mb-4">
            If an account exists with this email, you will receive a password reset link shortly.
          </p>
          <p className="text-gray-600 mb-2">
            Please check your email inbox and spam folder.
          </p>
          <div className="mt-6">
            <Link
              to="/admin/login"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state for reset mode
  if (mode === 'reset' && success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-bold mb-2">Password Reset Complete</h1>
          <p className="text-gray-600 mb-4">
            Your password has been reset successfully.
          </p>
          <p className="text-gray-600">
            You will be redirected to the login page.
          </p>
        </div>
      </div>
    );
  }

  // Request password reset form (initial state)
  if (mode === 'request') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-xl font-bold mb-4">Reset Password</h1>
          <p className="text-gray-600 mb-6">
            Enter your admin email to receive reset instructions
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleRequestReset}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter your email"
                required
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={processingReset}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {processingReset ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <Link
              to="/admin/login"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Set new password form (shown when valid token is present)
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-4">Set New Password</h1>
        <p className="text-gray-600 mb-6">
          Enter a new password for your admin account
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSetNewPassword}>
          {email && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                className="w-full p-2 border rounded bg-gray-50"
                readOnly
                disabled
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter new password"
              required
              minLength={8}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters long
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={processingReset}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {processingReset ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        {/* Debug button for development environments */}
        {import.meta.env.DEV && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h2 className="text-sm font-medium mb-2 text-gray-700">Development Tools</h2>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'request' ? 'reset' : 'request')}
                className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Toggle Mode: {mode === 'request' ? 'Show Reset Form' : 'Show Request Form'}
              </button>
              
              {token && (
                <button
                  type="button"
                  onClick={attemptTokenVerification}
                  className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Verify Token Manually
                </button>
              )}
              
              <div className="text-xs text-gray-500 mt-1">
                Current mode: {mode} | Token found: {token ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}