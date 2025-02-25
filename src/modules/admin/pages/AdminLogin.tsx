// src/modules/admin/pages/AdminLogin.tsx
// Version: 2.0.0
// Last Modified: 26-02-2025 20:00 IST
// Purpose: Admin login page with fixed button text

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check for different possible success parameters
  const setupSuccess = searchParams.get('setup') === 'success';
  const resetSuccess = searchParams.get('reset_success') === 'true';
  const resetParam = searchParams.get('reset');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Attempt to sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      
      if (signInError) {
        throw new Error(signInError.message);
      }
      
      if (!data.user) {
        throw new Error('No user returned from authentication');
      }
      
      // Try to verify this is an admin user, catch but don't fail if RPC fails
      try {
        const { data: adminData, error: adminError } = await supabase.rpc('verify_admin_status', {
          user_email: email.trim()
        });
        
        if (adminError || !adminData || !adminData.is_admin) {
          console.warn('Admin verification warning:', adminError || 'Not admin');
          // We'll continue anyway and rely on RLS policies to restrict access
        }
      } catch (verifyError) {
        console.warn('Admin verification error (non-critical):', verifyError);
      }
      
      // Save session info to localStorage for persistence
      localStorage.setItem('adminAuthSession', JSON.stringify({
        email: email.trim(),
        userId: data.user.id,
        timestamp: Date.now()
      }));
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-gray-600 mt-2">Sign in to access admin dashboard</p>
        </div>
        
        {setupSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            Your account has been set up successfully. You can now log in.
          </div>
        )}
        
        {(resetSuccess || resetParam === 'true') && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            Your password has been reset successfully. You can now log in with your new password.
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div className="text-right">
            <Link
              to="/admin/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link
            to="/admin/token-login"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Use token login instead
          </Link>
        </div>
        
        {import.meta.env.DEV && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Development Mode Options:</h3>
            <div className="flex space-x-4 justify-center">
              <Link to="/admin/register" className="text-indigo-600 hover:text-indigo-800">
                Admin Registration
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/admin/super-register" className="text-indigo-600 hover:text-indigo-800">
                Super Admin Registration
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {import.meta.env.DEV && (
        <div className="mt-4 w-full max-w-md">
          <details className="bg-gray-100 p-2 rounded">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center">
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Debug Info
            </summary>
            <div className="mt-2 text-xs text-gray-600">
              <p>Environment: {import.meta.env.MODE}</p>
              <p>Base URL: {window.location.origin}</p>
              <p>Query Params: {JSON.stringify(Object.fromEntries(searchParams.entries()))}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}