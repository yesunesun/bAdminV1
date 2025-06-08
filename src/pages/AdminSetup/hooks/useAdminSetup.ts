// src/pages/AdminSetup/hooks/useAdminSetup.ts
// Version: 1.0.0
// Last Modified: 25-02-2025 16:30 IST
// Purpose: Handle admin setup logic and state

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { parseSetupToken, setupAdminAccount, validatePassword } from '../services/adminSetupService';

export const useAdminSetup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [setupData, setSetupData] = useState<any>(null);
  const [processingSetup, setProcessingSetup] = useState(false);

  // Initialize setup from URL parameters
  useEffect(() => {
    const initSetup = async () => {
      setLoading(true);
      try {
        // Get parameters from URL
        const emailParam = searchParams.get('email');
        const setupToken = searchParams.get('setupToken');
        const tokenParam = searchParams.get('token'); // OTP token from Supabase email
        
        if (!emailParam) {
          throw new Error('Missing email parameter. Please use the link from your invitation.');
        }
        
        // Set email from URL parameter
        setEmail(emailParam);
        
        // Store token in session storage for later use
        if (tokenParam) {
          sessionStorage.setItem('auth_token', tokenParam);
          console.log('Auth token stored in session');
        }
        
        // If we have a setup token, parse and validate it
        if (setupToken) {
          try {
            const tokenData = parseSetupToken(setupToken, emailParam);
            setSetupData(tokenData);
          } catch (tokenError: any) {
            throw tokenError;
          }
        }
        
      } catch (err: any) {
        console.error('Setup initialization error:', err);
        setError(err.message || 'Failed to initialize setup');
      } finally {
        setLoading(false);
      }
    };
    
    initSetup();
  }, [searchParams]);

  // Handle form submission
  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email address is required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    setProcessingSetup(true);
    setError(null);
    
    try {
      const result = await setupAdminAccount(email, password, setupData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Show success state
      setSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        if (result.usePasswordReset) {
          navigate('/admin/login?reset=true');
        } else {
          navigate('/admin/login?setup=success');
        }
      }, 2000);
      
    } catch (err: any) {
      console.error('Password setup error:', err);
      setError(err.message || 'Failed to set up account');
    } finally {
      setProcessingSetup(false);
    }
  };

  return {
    loading,
    error,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    success,
    processingSetup,
    handlePasswordSetup
  };
};