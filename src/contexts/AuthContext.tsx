// src/contexts/AuthContext.tsx
// Version: 3.1.0
// Last Modified: 11-02-2025 04:00 IST

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, AuthError, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInAdmin: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
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

  const signInAdmin = async (email: string, password: string) => {
    try {
      // First check if the user exists and if email is confirmed
      const { data: { users }, error: getUserError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (getUserError) {
        throw getUserError;
      }

      const user = users?.[0];
      if (!user?.email_confirmed_at) {
        return {
          error: {
            message: 'Please confirm your email first',
            name: 'AuthError'
          } as AuthError
        };
      }

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

      // Check admin status
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
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}