// src/pages/AdminSetup.tsx
// Version: 5.2.0
// Last Modified: 26-02-2025 10:45 IST
// Purpose: Handle direct admin account setup with improved profile creation

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AdminSetup() {
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

  // Password validation
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    
    // Check for at least one number
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    
    return null;
  };

  // Helper function to create admin user entry
  const createAdminUser = async (userId: string, roleId: string) => {
    try {
      console.log('Creating admin user with role:', roleId);
      
      // Create profile if it doesn't exist
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          role: 'admin'  // Default to admin role
        }, { 
          onConflict: 'id',
          returning: 'minimal'  // Don't need to return data
        });
        
      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        // Try a direct insert if upsert fails
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            role: 'admin'
          });
          
        if (insertError) {
          console.error('Profile direct insert error:', insertError);
          // Try the RPC method as last resort
          const { error: rpcError } = await supabase.rpc('admin_create_profile', {
            user_id: userId,
            user_email: email,
            user_role: 'admin'
          });
          
          if (rpcError) {
            console.error('Admin profile RPC error:', rpcError);
            return false;
          }
        }
      }
      
      // Create admin_user entry
      const { error: adminUserError } = await supabase
        .from('admin_users')
        .upsert({
          user_id: userId,
          role_id: roleId
        }, { onConflict: 'user_id' });
        
      if (adminUserError) {
        console.error('Admin user creation error:', adminUserError);
        // Try RPC method
        const { error: rpcError } = await supabase.rpc('admin_create_user_role', {
          user_id: userId,
          role_id: roleId
        });
        
        if (rpcError) {
          console.error('Admin user role RPC error:', rpcError);
          return false;
        }
      }
      
      // Verify profile was created
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', userId)
        .single();
        
      if (verifyError || !verifyProfile) {
        console.error('Profile verification failed:', verifyError);
        return false;
      }
      
      console.log('Profile verified:', verifyProfile);
      return true;
    } catch (error) {
      console.error('Error creating admin user:', error);
      return false;
    }
  };

  // One-time fix for the existing user
  const fixExistingUser = async () => {
    const fixUserId = "ef46f60d-96f5-4e1d-b42b-89f2c5ddb0f8"; // wencesfx@gmail.com
    const fixRoleId = "8cbe3493-e9f7-4cb3-8325-e1c9d4cf0f5d";
    const fixEmail = "wencesfx@gmail.com";
    
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', fixUserId)
        .single();
        
      if (existingProfile) {
        console.log('Profile already exists for this user');
        return;
      }
      
      // Create missing profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: fixUserId,
          email: fixEmail,
          role: 'property_moderator',
          created_at: new Date().toISOString()
        });
        
      if (profileError) {
        console.error('Failed to create profile for existing user:', profileError);
      } else {
        console.log('Profile created for existing user');
      }
      
      // Ensure admin_user entry exists
      const { error: adminError } = await supabase
        .from('admin_users')
        .upsert({
          user_id: fixUserId,
          role_id: fixRoleId
        }, { onConflict: 'user_id' });
        
      if (adminError) {
        console.error('Failed to create admin_user for existing user:', adminError);
      } else {
        console.log('Admin user entry created/verified');
      }
    } catch (error) {
      console.error('Error fixing existing user:', error);
    }
  };

  // On component mount, parse URL parameters
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
            const tokenData = JSON.parse(atob(setupToken));
            
            // Validate token
            if (!tokenData.email || !tokenData.timestamp || !tokenData.expires) {
              throw new Error('Invalid setup token format');
            }
            
            // Check if token has expired
            if (Date.now() > tokenData.expires) {
              throw new Error('Setup token has expired. Please request a new invitation.');
            }
            
            // Verify email matches token
            if (tokenData.email.toLowerCase() !== emailParam.toLowerCase()) {
              throw new Error('Email mismatch in setup token. Please request a new invitation.');
            }
            
            console.log('Valid setup token found');
            setSetupData(tokenData);
          } catch (tokenError) {
            console.error('Token parsing error:', tokenError);
            throw new Error('Invalid setup token. Please request a new invitation.');
          }
        } else {
          console.log('No setup token found, proceeding with email only');
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
      // Get the token from session storage or URL
      const token = sessionStorage.getItem('auth_token') || searchParams.get('token');
      
      console.log('Starting account setup for:', email);
      
      // First try to verify OTP if we have a token
      if (token) {
        console.log('Using OTP verification flow');
        
        const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
          email,
          type: 'signup',
          token: token
        });
        
        if (otpError) {
          console.warn('OTP verification failed:', otpError);
          // Continue with alternative method
        } else if (otpData?.user) {
          console.log('OTP verification successful, updating password');
          
          // Update password for the verified user
          const { error: updateError } = await supabase.auth.updateUser({
            password
          });
          
          if (updateError) {
            throw new Error(`Failed to set password: ${updateError.message}`);
          }
          
          console.log('Password updated successfully');
          
          // Create admin user entry
          if (setupData?.role_id && otpData.user.id) {
            const profileCreated = await createAdminUser(otpData.user.id, setupData.role_id);
            if (!profileCreated) {
              console.warn('Profile creation may have failed, but continuing with setup');
            }
          }
          
          // Success - we're done
          handleSetupSuccess();
          return;
        }
      }
      
      // If OTP verification didn't work, try sign up flow
      console.log('Using signup flow');
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            is_admin: true,
            role_id: setupData?.role_id,
            role: setupData?.role || 'admin'
          },
          emailRedirectTo: `${window.location.origin}/admin/login`
        }
      });
      
      if (signUpError) {
        console.error('Sign up failed:', signUpError);
        
        // Try password reset flow as last resort
        console.log('Attempting password reset flow');
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/admin/login`
          }
        );
        
        if (resetError) {
          throw new Error(`Unable to create or update account: ${resetError.message}`);
        }
        
        // If password reset worked, show a different success message
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/login?reset=true');
        }, 2000);
        return;
      }
      
      console.log('Sign up successful');
      
      // Create admin user entry if needed
      if (signUpData?.user && setupData?.role_id) {
        const profileCreated = await createAdminUser(signUpData.user.id, setupData.role_id);
        if (!profileCreated) {
          console.warn('Profile creation may have failed, but continuing with setup');
        }
      }
      
      // Handle successful setup
      handleSetupSuccess();
      
    } catch (err: any) {
      console.error('Password setup error:', err);
      setError(err.message || 'Failed to set up account');
      setProcessingSetup(false);
    }
  };
  
  // Handle successful setup
  const handleSetupSuccess = async () => {
    // Sign out to ensure clean state
    await supabase.auth.signOut();
    
    // Show success state
    setSuccess(true);
    
    // Clear any stored tokens
    sessionStorage.removeItem('auth_token');
    
    // Redirect after a delay
    setTimeout(() => {
      navigate('/admin/login?setup=success');
    }, 2000);
  };

  // Success state
  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-bold mb-2">Setup Complete</h1>
          <p className="text-gray-600 mb-4">Your account has been set up successfully!</p>
          <p className="text-gray-600">You will be redirected to the login page.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading setup page...</p>
        </div>
      </div>
    );
  }

  // Password setup form
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-4">Complete Your Setup</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handlePasswordSetup}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              className="w-full p-2 border rounded bg-gray-50"
              readOnly
              disabled
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your password"
              required
              minLength={8}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters long with uppercase, lowercase, and numbers
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Confirm your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={processingSetup}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {processingSetup ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>

        {/* Fix for existing user */}
        {email === 'wencesfx@gmail.com' && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h2 className="text-sm font-medium mb-2">Admin Actions</h2>
            <button 
              type="button" 
              onClick={fixExistingUser}
              className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Fix Account Profile
            </button>
            <p className="text-xs text-gray-500 mt-1">
              This will create any missing profile records for your account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}