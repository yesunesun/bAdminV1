import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

type UserProfile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: () => boolean;
  isSuperAdmin: () => boolean;
  isSupervisor: () => boolean;
  isPropertyOwner: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Profile fetch error:', fetchError);
        return null;
      }
      return profile;
    } catch (err) {
      console.error('Profile fetch failed:', err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
  
    async function initializeAuth() {
      try {
        setLoading(true);
        console.log('Fetching session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session:', session);
  
        if (session?.user) {
          console.log('User found:', session.user);
          setUser(session.user);
          const profile = await fetchProfile(session.user.id);
          console.log('Profile:', profile);
          setUserProfile(profile || null);
        } else {
          console.log('No user found.');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Authentication failed.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
  
    initializeAuth();
  
    return () => {
      isMounted = false;
    };
  }, []);
  
  

  const signInWithEmail = async (email: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    signInWithEmail,
    signOut,
    isAuthenticated: () => !!userProfile,
    isSuperAdmin: () => userProfile?.role === 'super_admin',
    isSupervisor: () => ['super_admin', 'supervisor'].includes(userProfile?.role || ''),
    isPropertyOwner: () => userProfile?.role === 'property_owner',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
