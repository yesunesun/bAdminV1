// src/pages/SuperAdminRegister.tsx
// Version: 1.0.0
// Last Modified: 10-02-2025 23:55 IST

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Crown, AlertCircle } from 'lucide-react';

export default function SuperAdminRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            is_admin: true,
            role: 'super_admin'
          }
        }
      });

      if (authError) throw authError;

      if (authData?.user) {
        // Add user to admin_users table as super admin
        const { error: adminError } = await supabase
          .from('admin_users')
          .insert([
            {
              user_id: authData.user.id,
              email: formData.email,
              role: 'super_admin'
            }
          ]);

        if (adminError) throw adminError;

        // Sign out after registration
        await supabase.auth.signOut();
        
        // Show success message and redirect
        alert('Registration successful! Please check your email for verification.');
        navigate('/admin/login');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-purple-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/80 backdrop-blur rounded-xl shadow-lg mx-4">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-purple-100">
            <Crown className="h-7 w-7 text-purple-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Super Admin Registration</h2>
          <p className="mt-2 text-sm text-gray-600">Create a super admin account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Registration Failed</p>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                value={formData.email}
                onChange={handleChange}
                placeholder="superadmin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                minLength={8}
              />
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}