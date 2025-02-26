// src/modules/admin/pages/AdminForgotPassword.tsx
// Version: 1.3.0
// Last Modified: 29-02-2025 10:00 IST
// Purpose: Admin forgot password page with navigation fixes

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Check if a reset email was already sent
  const emailSent = searchParams.get('sent') === 'true';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // First check if this is an admin user
      try {
        const { data: adminData, error: adminError } = await supabase.rpc('verify_admin_status', {
          user_email: email.trim()
        });
        
        if (adminError) {
          console.warn('Admin verification warning:', adminError);
          // Continue anyway - we'll let Supabase handle if user exists
        } else if (!adminData || !adminData.is_admin) {
          // Don't reveal if user exists or not for security
          console.log('Non-admin email provided');
        }
      } catch (verifyError) {
        console.warn('Admin verification error (non-critical):', verifyError);
      }
      
      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/admin/reset-password`
        }
      );
      
      if (resetError) {
        throw new Error(resetError.message);
      }
      
      // Navigate to success state
      navigate('/admin/forgot-password?sent=true');
      
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-gray-600 mt-2">We'll send you a link to reset your password</p>
        </div>
        
        {/* Success message when email is sent */}
        {emailSent ? (
          <div className="text-center">
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
              <p className="font-medium">Reset link sent!</p>
              <p className="mt-1">Check your email for instructions to reset your password.</p>
            </div>
            
            <p className="mb-4 text-gray-600">
              If you don't receive an email within a few minutes, check your spam folder or try again.
            </p>
            
            <div className="flex space-x-4 justify-center">
              <button 
                onClick={() => navigate('/admin/forgot-password')}
                className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
              >
                Try Again
              </button>
              <span className="text-gray-300 self-center">|</span>
              <button
                onClick={() => navigate('/admin/login')}
                className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
                {error}
              </div>
            )}
            
            {/* Request form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter your admin email"
                  required
                  autoFocus
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            
            <div className="text-center mt-6">
              <button
                onClick={() => navigate('/admin/login')}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Back to Login
              </button>
            </div>
          </>
        )}
        
        {/* Development mode debugging */}
        {import.meta.env.DEV && (
          <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500">
            <p>Development Mode Info:</p>
            <p>Reset redirect URL: {`${window.location.origin}/admin/reset-password`}</p>
            <p>Current URL: {window.location.href}</p>
            <p>Query parameters: {JSON.stringify(Object.fromEntries(searchParams.entries()))}</p>
            <button
              onClick={() => {
                console.log('Current location:', window.location);
                console.log('Navigate function:', navigate);
                alert(`Current location: ${window.location.href}`);
              }}
              className="mt-2 bg-gray-200 px-2 py-1 rounded text-gray-700"
            >
              Log Navigation Info
            </button>
          </div>
        )}
      </div>
    </div>
  );
}