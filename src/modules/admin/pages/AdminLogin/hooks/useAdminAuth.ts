// src/modules/admin/pages/AdminLogin/hooks/useAdminAuth.ts
// Version: 1.1.0
// Last Modified: 24-02-2025 22:45 IST
// Purpose: Custom hook to handle admin authentication logic

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LOGIN_METHODS } from '../constants';

export const useAdminAuth = () => {
  // React hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [loginMethod, setLoginMethod] = useState(LOGIN_METHODS.PASSWORD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  const [componentState, setComponentState] = useState('initializing');
  
  // Get URL params
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  const tokenParam = params.get('token');
  const emailParam = params.get('email');
  const typeParam = params.get('type');

  // Debug URL parameters
  useEffect(() => {
    console.log('URL parameters:', { 
      code, 
      token: tokenParam, 
      email: emailParam,
      type: typeParam,
      fullPath: location.pathname + location.search
    });
  }, [code, tokenParam, emailParam, typeParam, location]);

  // Initialize component
  useEffect(() => {
    try {
      console.log('Initializing AdminLogin hook...');
      
      // Check if params exist in URL
      if (tokenParam && emailParam) {
        console.log('Token and email parameters found, setting token login mode');
        // Pre-fill token form fields and set login method
        setLoginMethod(LOGIN_METHODS.TOKEN);
        setComponentState('token-verification');
        
        // Auto-verify token from URL params (only once)
        handleTokenVerification(emailParam, tokenParam);
      } else if (code) {
        console.log('Code parameter found, checking if invite type');
        // Check if this is an invitation
        if (typeParam === 'invite' || typeParam === 'recovery') {
          console.log('Invite or recovery code found, enabling password setup mode');
          setNeedsPasswordSetup(true);
          setComponentState('password-setup');
        } else {
          console.log('Standard auth code found, exchanging for session');
          handleCodeVerification(code);
        }
      } else {
        console.log('No auth parameters found, checking for existing session');
        setComponentState('checking-session');
        // Check for existing session
        checkExistingSession();
      }
    } catch (err) {
      console.error('Error during initialization:', err);
      setError('An unexpected error occurred. Please try again.');
      setComponentState('error');
    }
  }, []);

  // Check if user already has a session
  const checkExistingSession = async () => {
    try {
      console.log('Checking for existing session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('Session found, checking admin status...');
        // Check if user is admin
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('is_active')
          .eq('user_id', session.user.id)
          .single();

        if (adminData?.is_active) {
          console.log('Active admin user, redirecting to dashboard');
          setComponentState('redirect-to-dashboard');
          navigate('/admin/dashboard');
        } else {
          console.log('User session exists but not an active admin');
          setComponentState('regular-login');
        }
      } else {
        console.log('No session found, showing login form');
        setComponentState('regular-login');
      }
    } catch (err) {
      console.error('Error checking session:', err);
      setComponentState('error');
    }
  };

  // Handle code verification for existing users
  const handleCodeVerification = async (code) => {
    try {
      setIsLoading(true);
      console.log('Verifying code:', code);
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Code verification error:', error);
        throw error;
      }
      
      console.log('Code verification successful:', data?.user?.id);
      
      if (data?.user?.id) {
        // Activate admin user
        await activateAdminUser(data.user.id);
        
        setSuccess('Authentication successful! Redirecting to dashboard...');
        setComponentState('success-redirect');
        setTimeout(() => navigate('/admin/dashboard'), 1500);
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Invalid or expired link. Please request a new invitation or use your credentials.');
      setComponentState('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle token verification
  const handleTokenVerification = async (email, token) => {
    try {
      setIsLoading(true);
      console.log('Verifying token for email:', email);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        console.error('Token verification error:', error);
        throw error;
      }

      console.log('Token verification successful:', data?.user?.id);
      
      if (data?.user?.id) {
        // Activate admin user
        await activateAdminUser(data.user.id);
        
        setSuccess('Login successful! Redirecting to dashboard...');
        setComponentState('success-redirect');
        setTimeout(() => navigate('/admin/dashboard'), 1500);
      }
    } catch (err) {
      console.error('Token verification error:', err);
      setError('Invalid or expired token. Please try again or request a new token.');
      setComponentState('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Activate admin user
  const activateAdminUser = async (userId) => {
    try {
      console.log('Activating admin user:', userId);
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: true })
        .eq('user_id', userId);
      
      if (error) {
        console.warn('Failed to activate admin user:', error);
      } else {
        console.log('Admin user activated successfully');
      }
    } catch (err) {
      console.error('Error activating admin user:', err);
    }
  };

  // Handle password setup for new users
  const handlePasswordSetup = async (password, confirmPassword) => {
    if (!code) {
      setError('Invalid invitation code. Please use the link from your invitation email.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Setting up password for code:', code);
      
      // Validate password
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Exchange code for session first to get user identity
      console.log('Exchanging code for session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        console.error('Session exchange error:', sessionError);
        throw sessionError;
      }
      
      console.log('Session exchange successful:', sessionData?.user?.id);
      
      // Update the user's password
      console.log('Updating user password...');
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      
      if (updateError) {
        console.error('Password update error:', updateError);
        throw updateError;
      }
      
      console.log('Password updated successfully');
      
      // Check if profile exists for this user
      console.log('Checking for existing profile...');
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', sessionData.user.id)
        .single();
      
      if (profileCheckError) {
        console.log('Profile check error:', profileCheckError.message);
      }
      
      // Create profile if it doesn't exist
      if (!existingProfile && !profileCheckError?.message?.includes('No rows found')) {
        console.log('Creating new profile for user...');
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: sessionData.user.id,
            email: sessionData.user.email,
            role: sessionData.user.user_metadata?.role || 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
          if (!profileError.message.includes('duplicate')) {
            // Non-critical error, don't throw
            console.warn('Non-critical profile creation error:', profileError.message);
          }
        } else {
          console.log('Profile created successfully');
        }
      } else {
        console.log('Profile already exists, skipping creation');
      }
      
      // Activate admin user
      console.log('Activating admin user...');
      const { error: adminError } = await supabase
        .from('admin_users')
        .update({ is_active: true })
        .eq('user_id', sessionData.user.id);
      
      if (adminError) {
        console.warn('Failed to activate admin user:', adminError);
      } else {
        console.log('Admin user activated successfully');
      }
      
      console.log('Password setup complete, redirecting to dashboard...');
      setSuccess('Password set successfully! You will be redirected to the dashboard.');
      setTimeout(() => window.location.href = '/admin/dashboard', 1500);
      
    } catch (err) {
      console.error('Error setting up password:', err);
      setError(err.message || 'Failed to set password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resending token
  const handleResendToken = async (email) => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      console.log('Resending token to email:', email);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`
        }
      });

      if (error) {
        console.error('Error resending token:', error);
        throw error;
      }

      console.log('Token resent successfully');
      setError('');
      setSuccess('A new login token has been sent to your email.');
    } catch (err) {
      console.error('Error resending token:', err);
      setError('Failed to send new token. Please contact your administrator.');
    } finally {
      setIsResending(false);
    }
  };

  // Toggle between password and token login methods
  const toggleLoginMethod = () => {
    console.log('Toggling login method');
    setLoginMethod(prev => 
      prev === LOGIN_METHODS.PASSWORD ? LOGIN_METHODS.TOKEN : LOGIN_METHODS.PASSWORD
    );
    setError('');
    setSuccess('');
  };

  return {
    // State
    loginMethod,
    isLoading,
    error,
    success,
    isResending,
    needsPasswordSetup,
    code,
    emailParam,
    tokenParam,
    componentState,
    
    // Actions
    setError,
    setSuccess,
    setIsLoading,
    handleTokenVerification,
    handlePasswordSetup,
    handleResendToken,
    toggleLoginMethod
  };
};