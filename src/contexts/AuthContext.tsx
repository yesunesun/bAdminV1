import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

type UserProfile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signInWithEmail: (email: string) => Promise<{ error?: any }>;
  verifyOTP: (email: string, token: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: () => boolean;
  isSuperAdmin: () => boolean;
  isSupervisor: () => boolean;
  isPropertyOwner: () => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    error: null
  });

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState(current => ({ ...current, ...updates }));
  };

  const clearError = () => {
    updateAuthState({ error: null });
  };

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    console.log('📥 Fetching profile for user:', userId);
    try {
      // Add delay to ensure Supabase session is properly initialized
      await new Promise(resolve => setTimeout(resolve, 100));

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Session expired or invalid, trigger sign out
          console.error('❌ Invalid session during profile fetch');
          await supabase.auth.signOut();
          return null;
        }
        console.error('❌ Profile fetch error:', error);
        return null;
      }

      if (!profile) {
        console.log('⚠️ No profile found for user');
        return null;
      }

      console.log('✅ Profile fetched successfully:', profile);
      return profile;
    } catch (err) {
      console.error('❌ Error in fetchProfile:', err);
      return null;
    }
  };

  const handleAuthStateChange = async (currentUser: User | null) => {
    console.log('🔄 Handling auth state change:', { 
      hasUser: !!currentUser,
      userId: currentUser?.id,
      email: currentUser?.email 
    });
    
    try {
      if (!currentUser) {
        console.log('👤 No user, clearing auth state');
        updateAuthState({
          user: null,
          userProfile: null,
          loading: false
        });
        return;
      }

      updateAuthState({ loading: true });
      
      const profile = await fetchProfile(currentUser.id);
      
      if (!profile) {
        console.error('❌ No profile found after auth state change');
        updateAuthState({
          user: null,
          userProfile: null,
          loading: false,
          error: 'Unable to load user profile'
        });
        await supabase.auth.signOut();
        return;
      }

      console.log('✅ Auth state updated successfully:', {
        userId: currentUser.id,
        role: profile.role
      });

      updateAuthState({
        user: currentUser,
        userProfile: profile,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('❌ Error in handleAuthStateChange:', err);
      updateAuthState({
        user: null,
        userProfile: null,
        loading: false,
        error: 'Failed to update authentication state'
      });
      // Force sign out on error
      await supabase.auth.signOut().catch(console.error);
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log('🔄 Auth Provider mounted');

    const initializeAuth = async () => {
      try {
        console.log('📥 Getting initial session');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw sessionError;
        }

        if (!mounted) return;

        if (session?.user) {
          console.log('✅ Found existing session');
          await handleAuthStateChange(session.user);
        } else {
          console.log('⚠️ No session found');
          updateAuthState({
            user: null,
            userProfile: null,
            loading: false
          });
        }
      } catch (err) {
        console.error('❌ Auth initialization error:', err);
        if (mounted) {
          updateAuthState({
            user: null,
            userProfile: null,
            loading: false,
            error: 'Failed to initialize authentication'
          });
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) {
        console.log('⚠️ Skipping auth state change - component unmounted');
        return;
      }
      
      console.log('🔄 Auth state changed:', { event, userId: session?.user?.id });
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await handleAuthStateChange(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        updateAuthState({
          user: null,
          userProfile: null,
          loading: false
        });
      }
    });

    return () => {
      console.log('♻️ Cleaning up Auth Provider');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string) => {
    console.log('🔑 Attempting email sign in');
    updateAuthState({ error: null });
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      const errorMessage = error.message || 'Failed to sign in';
      updateAuthState({ error: errorMessage });
      return { error };
    }
  };

  const verifyOTP = async (email: string, token: string) => {
    console.log('🔐 Verifying OTP');
    updateAuthState({ error: null });
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'magiclink'
      });

      if (error) throw error;
      await handleAuthStateChange(data.user);
      return { error: null };
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      const errorMessage = error.message || 'Failed to verify OTP';
      updateAuthState({ error: errorMessage });
      return { error };
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      await handleAuthStateChange(null);
    } catch (err: any) {
      console.error('❌ Sign out error:', err);
      updateAuthState({ error: 'Failed to sign out' });
    }
  };

  const contextValue = useMemo(
    () => ({
      ...authState,
      signInWithEmail,
      verifyOTP,
      signOut,
      clearError,
      isAuthenticated: () => !!authState.user && !!authState.userProfile,
      isSuperAdmin: () => authState.userProfile?.role === 'super_admin',
      isSupervisor: () => ['super_admin', 'supervisor'].includes(authState.userProfile?.role || ''),
      isPropertyOwner: () => authState.userProfile?.role === 'property_owner',
    }),
    [authState]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}