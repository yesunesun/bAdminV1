// src/modules/admin/pages/AdminLogin/index.tsx
// Version: 2.0.0
// Last Modified: 24-02-2025 16:30 IST
// Purpose: Main Admin Login page container

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoginContainer } from './components/LoginContainer';
import { PasswordLoginForm } from './components/PasswordLoginForm';
import { TokenLoginForm } from './components/TokenLoginForm';
import { LoadingState } from './components/LoadingState';
import { SuccessState } from './components/SuccessState';
import { LoginHeader } from './components/LoginHeader';
import { ErrorMessage } from './components/ErrorMessage';
import { SuccessMessage } from './components/SuccessMessage';
import { LOGIN_METHODS } from './constants';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [loginMethod, setLoginMethod] = useState(LOGIN_METHODS.PASSWORD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Get URL params
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  const tokenParam = params.get('token');
  const emailParam = params.get('email');

  // Initialize component
  useEffect(() => {
    document.title = 'Admin Login | Bhoomitalli Real Estate';
    
    // Check if params exist in URL
    if (tokenParam && emailParam) {
      // Pre-fill token form fields and set login method
      setLoginMethod(LOGIN_METHODS.TOKEN);
      
      // Auto-verify token from URL params (only once)
      handleTokenVerification(emailParam, tokenParam);
    } else if (code) {
      // Handle code from magic link
      handleCodeVerification(code);
    } else {
      // Check for existing session
      checkExistingSession();
    }
  }, []);

  // Utility functions
  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is admin
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('is_active')
          .eq('user_id', session.user.id)
          .single();

        if (adminData?.is_active) {
          navigate('/admin/dashboard');
        }
      }
    } catch (err) {
      console.error('Error checking session:', err);
    }
  };

  const handleCodeVerification = async (code) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) throw error;
      
      if (data?.user?.id) {
        // Activate admin user
        await activateAdminUser(data.user.id);
        
        setSuccess('Authentication successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/admin/dashboard'), 1500);
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Invalid or expired link. Please request a new invitation or use your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenVerification = async (email, token) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) throw error;

      if (data?.user?.id) {
        // Activate admin user
        await activateAdminUser(data.user.id);
        
        setSuccess('Login successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/admin/dashboard'), 1500);
      }
    } catch (err) {
      console.error('Token verification error:', err);
      setError('Invalid or expired token. Please try again or request a new token.');
    } finally {
      setIsLoading(false);
    }
  };

  const activateAdminUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: true })
        .eq('user_id', userId);
      
      if (error) {
        console.warn('Failed to activate admin user:', error);
      }
    } catch (err) {
      console.error('Error activating admin user:', err);
    }
  };

  const handleResendToken = async (email) => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`
        }
      });

      if (error) throw error;

      setError('');
      setSuccess('A new login token has been sent to your email.');
    } catch (err) {
      console.error('Error resending token:', err);
      setError('Failed to send new token. Please contact your administrator.');
    } finally {
      setIsResending(false);
    }
  };

  const toggleLoginMethod = () => {
    setLoginMethod(prev => 
      prev === LOGIN_METHODS.PASSWORD ? LOGIN_METHODS.TOKEN : LOGIN_METHODS.PASSWORD
    );
    setError('');
    setSuccess('');
  };

  // Main render logic
  if (isLoading && !error && !success) {
    return <LoadingState />;
  }

  if (success && !error) {
    return <SuccessState message={success} />;
  }

  return (
    <LoginContainer>
      <LoginHeader 
        loginMethod={loginMethod} 
        onToggleMethod={toggleLoginMethod} 
      />

      {error && (
        <ErrorMessage 
          error={error} 
          showResendButton={loginMethod === LOGIN_METHODS.TOKEN}
          onResend={handleResendToken}
          isResending={isResending}
        />
      )}
      
      {success && <SuccessMessage message={success} />}

      {loginMethod === LOGIN_METHODS.PASSWORD ? (
        <PasswordLoginForm 
          setError={setError}
          setSuccess={setSuccess}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          navigate={navigate}
        />
      ) : (
        <TokenLoginForm 
          initialEmail={emailParam || ''}
          initialToken={tokenParam || ''}
          onVerify={handleTokenVerification}
          setError={setError}
          isLoading={isLoading}
        />
      )}
    </LoginContainer>
  );
}