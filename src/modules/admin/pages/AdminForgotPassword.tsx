// src/modules/admin/pages/AdminPasswordReset.tsx
// Version: 2.0.0
// Last Modified: 26-02-2025 14:00 IST
// Purpose: Handle admin password reset with improved token handling

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AdminPasswordReset() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenFound, setTokenFound] = useState(false);
  
  // Extract token from various possible locations
  useEffect(() => {
    const getTokenFromUrl = () => {
      // Try to get token from query params
      let token = searchParams.get('token');
      
      // If not found, try to parse from hash
      if (!token && location.hash) {
        // Handle format like #access_token=xxx
        const hashParams = new URLSearchParams(location.hash.substring(1));
        token = hashParams.get('access_token');
      }
      
      // If not found, try other common parameter names
      if (!token) {
        token = searchParams.get('access_token') || 
               searchParams.get('reset_token') || 
               searchParams.get('t');
      }
      
      return token;
    };
    
    const initReset = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = getTokenFromUrl();
        console.log('Found token in URL:', !!token);
        
        if (token) {
          setTokenFound(true);
          
          // Try to get user info from the token
          const { data, error: sessionError } = await supabase.auth.getUser();
          
          if (sessionError) {
            console.warn('Token validation warning:', sessionError);
            // Don't throw error yet - we'll let the user provide email
          } else if (data?.user) {
            // Pre-fill email field if we can get it
            setEmail(data.user.email || '');
          }
        }
      } catch (err: any) {
        console.error('Reset initialization error:', err);
        setError('Failed to initialize password reset. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    initReset();
  }, [location, searchParams]);
  
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    setVerifying(true);
    setError(null);
    
    try {
      // Check if this is an admin user
      const { data: adminData, error: adminError } = await supabase.rpc('verify_admin_status', {
        user_email: email.trim()
      });
      
      if (adminError) {
        console.warn('Admin verification warning:', adminError);
        // Continue anyway - the token will validate if it's valid
      }
      
      // Send a new reset link if needed
      if (!tokenFound) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/admin/reset-password`
          }
        );
        
        if (resetError) {
          throw new Error(`Failed to send reset email: ${resetError.message}`);
        }
        
        // Show success for new reset email
        navigate('/admin/forgot-password?sent=true');
        return;
      }
      
      // If token is in URL, proceed to password reset form
      setTokenFound(true);
      setVerifying(false);
      
    } catch (err: any) {
      console.error('Email verification error:', err);
      setError(err.message || 'Failed to verify email');
      setVerifying(false);
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
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
    
    setLoading(true);
    setError(null);
    
    try {
      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      
      if (updateError) {
        throw new Error(`Failed to update password: ${updateError.message}`);
      }
      
      // Show success and sign out
      setSuccess(true);
      
      // Sign out after reset
      await supabase.auth.signOut();
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/login?reset=success');
      }, 2000);
      
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password');
      setLoading(false);
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
  
  // Success state
  if (success) {
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
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <p className="text-gray-600">You will be redirected to the login page.</p>
        </div>
      </div>
    );
  }
  
  // Email verification form (shown if no token found)
  if (!tokenFound) {
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
          
          <form onSubmit={handleVerifyEmail}>
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
              disabled={verifying}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : 'Send Reset Instructions'}
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
  
  // Password reset form (shown if token found)
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-4">Set New Password</h1>
        <p className="text-gray-600 mb-6">
          Create a new password for your account
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handlePasswordReset}>
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
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}