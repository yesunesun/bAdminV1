// src/contexts/AuthContext.tsx
// Version: 1.3.0
// Last Modified: 30-01-2025 15:00 IST

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, AuthError } from '@supabase/supabase-js';

type UserRole = 'property_owner' | 'property_seeker';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error?: AuthError }>;
  registerUser: (email: string, phone: string, role: UserRole) => Promise<{ error?: AuthError }>;
  verifyOtp: (email: string, token: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      }
    });
    return { error };
  };

  const registerUser = async (email: string, phone: string, role: UserRole) => {
    // First, send OTP to email
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          phone,
          role,
          registered_at: new Date().toISOString(),
        },
        shouldCreateUser: true,
      }
    });
    return { error };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    // If verification is successful and we have user metadata, store it in the profiles table
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            phone: user.user_metadata.phone,
            role: user.user_metadata.role,
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    registerUser,
    verifyOtp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}