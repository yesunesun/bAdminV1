// src/modules/admin/pages/AdminRegister.tsx
// Version: 1.7.0
// Last Modified: 21-02-2025 20:30 IST

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, adminSupabase } from '@/lib/supabase';
import { AdminHeader } from '../components/AdminHeader';
import { Shield, AlertCircle } from 'lucide-react';
import { ADMIN_ROLES } from '../utils/constants';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export default function AdminRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: ADMIN_ROLES.PROPERTY_MODERATOR // Default role
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const checkExistingUser = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false
      }
    });
    return !error;
  };

  const createAdminEntries = async (userId: string, roleType: string) => {
    try {
      // Create profile entry
      const { error: profileError } = await adminSupabase
        .from('profiles')
        .insert({
          id: userId,
          email: formData.email,
          role: roleType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Get or create role
      const { data: roleData, error: roleError } = await adminSupabase
        .from('admin_roles')
        .select('id')
        .eq('role_type', roleType)
        .single();

      if (roleError && roleError.code !== 'PGRST116') throw roleError;

      let roleId;
      if (!roleData) {
        const { data: newRole, error: newRoleError } = await adminSupabase
          .from('admin_roles')
          .insert({
            role_type: roleType,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (newRoleError) throw newRoleError;
        roleId = newRole.id;
      } else {
        roleId = roleData.id;
      }

      // Create admin_user entry
      const { error: adminUserError } = await adminSupabase
        .from('admin_users')
        .insert({
          user_id: userId,
          role_id: roleId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (adminUserError) throw adminUserError;

    } catch (error) {
      console.error('Error creating admin entries:', error);
      throw new Error('Failed to set up admin access');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const userExists = await checkExistingUser(formData.email);
      if (userExists) {
        setError('An account with this email already exists');
        return;
      }

      // Create new user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`,
          data: {
            is_admin: true,
            role: formData.role
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('Failed to create account');

      // Create necessary admin entries
      await createAdminEntries(user.id, formData.role);

      // Sign out the user
      await supabase.auth.signOut();

      // Redirect with success message
      navigate('/admin/login', {
        state: { 
          success: true,
          message: 'Registration successful! Please check your email to verify your account.' 
        },
        replace: true
      });

    } catch (err) {
      console.error('Registration error:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('User already registered')) {
          setError('An account with this email already exists');
        } else if (err.message.includes('rate limit')) {
          setError('Too many attempts. Please try again later.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500/10 to-indigo-100">
      <AdminHeader />
      <div className="max-w-md mx-auto pt-20 p-8">
        <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-8 space-y-8">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-indigo-100">
              <Shield className="h-7 w-7 text-indigo-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Registration</h2>
            <p className="mt-2 text-sm text-gray-600">Create an admin account</p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
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
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value={ADMIN_ROLES.PROPERTY_MODERATOR}>Property Moderator</option>
                  <option value={ADMIN_ROLES.ADMIN}>Admin</option>
                </select>
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
                  minLength={8}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
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
                  Registering...
                </span>
              ) : (
                'Register'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}