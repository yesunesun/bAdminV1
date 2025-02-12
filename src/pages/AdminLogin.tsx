// src/pages/AdminLogin.tsx
// Version: 1.9.1
// Last Modified: 12-02-2025 17:15 IST

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Lock, Shield, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const { signInAdmin } = useAuth();

  const isDevMode = import.meta.env.DEV;

  useEffect(() => {
    document.title = 'Admin Login | Bhoomitalli Real Estate';
    
    // Check for existing session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        // Verify if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('is_active')
          .eq('user_id', session.user.id)
          .single();

        if (adminData?.is_active) {
          navigate('/admin/dashboard');
        }
      }
    };

    checkSession();
  }, [navigate]);

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`
        }
      });

      if (resendError) throw resendError;

      setError('Confirmation email resent. Please check your inbox.');
    } catch (err) {
      console.error('Error resending confirmation:', err);
      setError('Failed to resend confirmation email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting admin sign in for:', formData.email);
      
      const { error: signInError } = await signInAdmin(
        formData.email,
        formData.password
      );

      if (signInError) {
        console.error('Sign in error:', signInError);
        if (signInError.message.includes('not confirmed')) {
          setError('Please confirm your email first');
          return;
        }
        throw signInError;
      }

      console.log('Admin sign in successful, navigating to dashboard');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/80 backdrop-blur rounded-xl shadow-lg mx-4">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-indigo-100">
            <Shield className="h-7 w-7 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access admin dashboard</p>
          
          {isDevMode && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-500">Development Mode Options:</p>
              <div className="flex justify-center gap-4">
                <Link 
                  to="/admin/register" 
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Admin Registration
                </Link>
                <span className="text-gray-300">|</span>
                <Link 
                  to="/super-admin/register" 
                  className="text-sm font-medium text-purple-600 hover:text-purple-500"
                >
                  Super Admin Registration
                </Link>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Login Failed</p>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
            {error.includes('confirm your email') && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={isResending}
                className="text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend confirmation email'}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <Lock className="absolute right-3 top-2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}