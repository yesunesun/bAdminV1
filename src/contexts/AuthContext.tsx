// src/contexts/AuthContext.tsx
// Version: 3.4.0
// Last Modified: 01-04-2025 12:45 IST

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, AuthError, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInAdmin: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signInWithOTP: (email: string) => Promise<{ error?: AuthError }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: AuthError }>;
  verifyOTP: (email: string, token: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  registerUser: (email: string, role: string) => Promise<{ error?: AuthError }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session initialization error:', error);
        }
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOTP = async (email: string) => {
    try {
      console.log('Attempting OTP sign in for email:', email);
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      console.log('OTP sign in successful, email sent');
      return { error: undefined };
    } catch (err) {
      console.error('OTP sign in error:', err);
      if (err instanceof Error) {
        return {
          error: {
            message: err.message,
            name: 'AuthError'
          } as AuthError
        };
      }
      return {
        error: {
          message: 'An unexpected error occurred during OTP sign in',
          name: 'AuthError'
        } as AuthError
      };
    }
  };

  const registerUser = async (email: string, role: string) => {
    try {
      console.log('Registering user with email:', email, 'and role:', role);
      
      // Sign up with OTP (passwordless)
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role: role, // Store the user's role in the metadata
          }
        },
      });

      if (error) throw error;
      console.log('Registration successful, verification email sent');
      return { error: undefined };
    } catch (err) {
      console.error('Registration error:', err);
      if (err instanceof Error) {
        return {
          error: {
            message: err.message,
            name: 'AuthError'
          } as AuthError
        };
      }
      return {
        error: {
          message: 'An unexpected error occurred during registration',
          name: 'AuthError'
        } as AuthError
      };
    }
  };

  const verifyOTP = async (email: string, token: string) => {
    try {
      console.log('Verifying OTP for email:', email, 'with token length:', token.length);
      
      if (!token || token.trim().length === 0) {
        throw new Error('Verification code cannot be empty');
      }
      
      // Ensure token contains only digits
      if (!/^\d+$/.test(token.trim())) {
        throw new Error('Verification code must contain only numbers');
      }
      
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'signup', // Change from 'email' to 'signup' for new user registrations
      });

      if (error) {
        console.error('OTP verification API error:', error);
        throw error;
      }
      
      console.log('OTP verification successful. User data:', data?.user ? 'User exists' : 'No user');
      return { error: undefined };
    } catch (err) {
      console.error('OTP verification error:', err);
      if (err instanceof Error) {
        return {
          error: {
            message: err.message,
            name: 'AuthError'
          } as AuthError
        };
      }
      return {
        error: {
          message: 'An unexpected error occurred during OTP verification',
          name: 'AuthError'
        } as AuthError
      };
    }
  };

  const signInAdmin = async (email: string, password: string) => {
    try {
      // Sign in the user
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

      // Check email confirmation
      if (!data.user.email_confirmed_at) {
        return {
          error: {
            message: 'Please confirm your email first',
            name: 'AuthError'
          } as AuthError
        };
      }

      // First check user metadata for admin status
      const isAdminByMetadata = data.user.user_metadata?.is_admin === true || 
                               data.user.user_metadata?.role === 'admin' ||
                               data.user.user_metadata?.role === 'super_admin';

      if (isAdminByMetadata) {
        return { error: undefined };
      }

      // If not admin by metadata, check admin_users table as fallback
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('is_active')
        .eq('user_id', data.user.id)
        .single();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        return {
          error: {
            message: 'Access denied: Not an admin user',
            name: 'AuthError'
          } as AuthError
        };
      }

      if (!adminData.is_active) {
        await supabase.auth.signOut();
        return {
          error: {
            message: 'Your admin account is pending activation',
            name: 'AuthError'
          } as AuthError
        };
      }

      return { error: undefined };

    } catch (err) {
      console.error('Sign in error:', err);
      await supabase.auth.signOut();
      if (err instanceof Error) {
        return {
          error: {
            message: err.message,
            name: 'AuthError'
          } as AuthError
        };
      }
      return {
        error: {
          message: 'An unexpected error occurred',
          name: 'AuthError'
        } as AuthError
      };
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) throw error;
      return { error: undefined };
    } catch (err) {
      console.error('Password sign in error:', err);
      if (err instanceof Error) {
        return {
          error: {
            message: err.message,
            name: 'AuthError'
          } as AuthError
        };
      }
      return {
        error: {
          message: 'An unexpected error occurred during sign in',
          name: 'AuthError'
        } as AuthError
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Sign out error:', err);
      throw err;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInAdmin,
    signInWithOTP,
    signInWithPassword,
    registerUser,
    verifyOTP,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}