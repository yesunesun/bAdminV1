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
  verifyOTP: (email: string, token: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: () => boolean;
  isSuperAdmin: () => boolean;
  isSupervisor: () => boolean;
  isPropertyOwner: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    console.log('📥 Fetching profile for user:', userId);
    
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select()
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('⚠️ Profile fetch error:', fetchError);
        throw fetchError;
      }

      if (!profile) {
        console.error('⚠️ No profile found for user:', userId);
        return null;
      }

      console.log('✅ Fetched profile:', profile);
      return profile;
    } catch (err) {
      console.error('❌ Error in fetchProfile:', err);
      throw err;
    }
  };

  useEffect(() => {
    console.log('🔄 AuthProvider mounted');
    let mounted = true;

    const initAuth = async () => {
      console.log('🚀 Initializing auth...');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('📋 Session data:', session);
        
        if (sessionError) throw sessionError;

        if (!mounted) return;

        if (session?.user) {
          console.log('👤 User found in session:', session.user.id);
          setUser(session.user);
          
          try {
            const profile = await fetchProfile(session.user.id);
            if (mounted && profile) {
              console.log('👥 Setting user profile:', profile);
              setUserProfile(profile);
            }
          } catch (profileError: any) {
            console.error('❌ Profile error:', profileError);
            setError(profileError.message || 'Failed to load user profile');
          }
        } else {
          console.log('ℹ️ No user session found');
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('❌ Auth initialization error:', err);
        if (mounted) {
          setError('Authentication failed');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state change:', event, session?.user?.id);
      
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        try {
          const profile = await fetchProfile(session.user.id);
          if (mounted && profile) {
            setUserProfile(profile);
          }
        } catch (err: any) {
          console.error('❌ Error handling auth state change:', err);
          setError(err.message || 'Failed to load user profile');
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string) => {
    console.log('📧 Sending OTP to email:', email);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('❌ Sign-in error:', error);
      setError(error.message);
      return { error };
    }
  };

  const verifyOTP = async (email: string, token: string) => {
    console.log('🔐 Verifying OTP for email:', email);
    setError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'magiclink'
      });

      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        const profile = await fetchProfile(data.user.id);
        if (profile) {
          setUserProfile(profile);
        }
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      setError(error.message);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      window.location.href = '/login';
    } catch (err) {
      console.error('❌ Sign-out error:', err);
      setError('Failed to sign out');
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    signInWithEmail,
    verifyOTP,
    signOut,
    isAuthenticated: () => !!user && !!userProfile,
    isSuperAdmin: () => userProfile?.role === 'super_admin',
    isSupervisor: () => ['super_admin', 'supervisor'].includes(userProfile?.role || ''),
    isPropertyOwner: () => userProfile?.role === 'property_owner',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};