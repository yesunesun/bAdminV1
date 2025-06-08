// src/modules/moderator/pages/ModeratorLogin.tsx
// Version: 2.0.0
// Last Modified: 27-02-2025 10:30 IST
// Purpose: Added strict role verification at login

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ModeratorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if user has proper role for moderator access
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
      
      if (signInError) {
        throw signInError;
      }

      if (!data.user) {
        throw new Error('No user returned from sign in');
      }
      
      // Check if the user has moderator or admin role in metadata
      console.log('Checking user role in metadata:', data.user.user_metadata);
      const userRole = data.user.user_metadata?.role;
      const hasModeratorAccess = userRole === 'property_moderator' || 
                                 userRole === 'admin' || 
                                 userRole === 'super_admin';
      
      if (hasModeratorAccess) {
        console.log('User has proper role in metadata:', userRole);
        // User has proper role in metadata, proceed to dashboard
        navigate('/moderator/dashboard');
        return;
      }
      
      // If role not in metadata, check database
      console.log('Role not found in metadata, checking database');
      
      const { data: roleData, error: roleError } = await supabase
        .from('admin_roles')
        .select(`
          id,
          role_type,
          admin_users!inner (
            user_id,
            is_active
          )
        `)
        .eq('admin_users.user_id', data.user.id)
        .in('role_type', ['property_moderator', 'admin', 'super_admin']);
      
      console.log('Database role check results:', { roleData, roleError });
        
      if (roleError) {
        console.error('Error checking roles:', roleError);
        await supabase.auth.signOut();
        throw new Error('Authentication error occurred');
      }
      
      if (!roleData || roleData.length === 0) {
        // No proper role found, sign out and throw error
        console.log('No proper role found in database');
        await supabase.auth.signOut();
        throw new Error('Invalid username or password');
      }
      
      // Find the first active role
      const activeRole = roleData.find(role => role.admin_users?.is_active);
      
      if (!activeRole) {
        console.log('No active role found');
        await supabase.auth.signOut();
        throw new Error('Your account is pending activation');
      }
      
      console.log('User has proper role in database:', activeRole.role_type);
      
      // User has proper role, redirect to dashboard
      navigate('/moderator/dashboard');
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/admin/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <Lock className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Property Moderator Portal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access property moderation dashboard
          </p>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Login failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-medium text-green-600 hover:text-green-500"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-green-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                </span>
              ) : null}
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}