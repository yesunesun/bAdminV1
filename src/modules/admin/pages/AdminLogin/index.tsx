// src/modules/admin/pages/AdminLogin/index.tsx
// Version: 2.5.0
// Last Modified: 27-02-2025 16:15 IST
// Purpose: Fixed HTML syntax error in forgot password link

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<any>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check current auth state on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setAuthState({
            status: 'authenticated',
            user: data.session.user.email
          });
        } else {
          setAuthState({
            status: 'unauthenticated'
          });
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setAuthState({
          status: 'error',
          message: err instanceof Error ? err.message : String(err)
        });
      }
    };
    
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', email.trim());
      
      // BASIC AUTH - Direct Supabase auth attempt without any additional logic
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }
      
      if (!data.user) {
        throw new Error('No user returned from authentication');
      }
      
      // Successfully authenticated
      console.log('Login successful:', data.user.email);
      
      // Skip admin verification for now, just redirect to dashboard
      navigate('/admin/dashboard');
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in');
      
      // Additional debugging - test current session after failed login
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Current session after error:', sessionData);
      } catch (sessionErr) {
        console.error('Session check error:', sessionErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to test connection to Supabase
  const testConnection = async () => {
    try {
      // Simple public query to verify connection
      const { data, error } = await supabase.from('admin_roles').select('role_type').limit(1);
      
      if (error) {
        alert(`Database connection error: ${error.message}`);
        return;
      }
      
      alert(`Connection successful! Data: ${JSON.stringify(data)}`);
    } catch (err) {
      alert(`Connection test error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Function to reset auth state
  const resetAuth = async () => {
    try {
      await supabase.auth.signOut();
      alert('Signed out and cleared auth state');
      setAuthState({
        status: 'unauthenticated'
      });
    } catch (err) {
      alert(`Sign out error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Function to handle forgot password navigation with direct URL change
  const handleForgotPassword = () => {
    console.log('Forgot password clicked, navigating...');
    window.location.href = '/admin/forgot-password';
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
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Forgot password?
            </button>
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
        
        {/* Development Tools */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Debug Tools:</h3>
          <div className="space-y-2">
            <button 
              onClick={testConnection}
              className="w-full py-2 px-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            >
              Test Database Connection
            </button>
            <button 
              onClick={resetAuth}
              className="w-full py-2 px-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            >
              Reset Auth State
            </button>
          </div>
          
          {authState && (
            <div className="mt-4 p-3 bg-gray-50 text-xs text-gray-700 rounded border border-gray-200">
              <h4 className="font-medium mb-1">Current Auth State:</h4>
              <pre>{JSON.stringify(authState, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}