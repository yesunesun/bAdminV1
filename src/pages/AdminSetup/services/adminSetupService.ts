// src/pages/AdminSetup/services/adminSetupService.ts
// Version: 2.3.0
// Last Modified: 25-02-2025 15:30 IST
// Purpose: Fix password reset functionality with correct token handling

import { supabase } from '@/lib/supabase';

// Verify admin user entry exists (no longer creating profiles here)
export const verifyAdminUser = async (userId: string, roleId: string, email: string) => {
  try {
    console.log('Verifying admin user with role:', roleId);
    
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', userId)
      .single();
      
    if (!existingProfile) {
      console.log('Profile does not exist - this should not happen with new invite flow');
      // We don't need to create a profile here anymore since it's created during invitation
    } else {
      console.log('Profile exists:', existingProfile);
    }
    
    // Ensure admin_user entry exists
    const { error: adminUserError } = await supabase
      .from('admin_users')
      .upsert({
        user_id: userId,
        role_id: roleId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
    if (adminUserError) {
      console.error('Admin user verification error:', adminUserError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying admin user:', error);
    return false;
  }
};

// Fix existing user profile if needed
export const fixExistingUserProfile = async (email: string) => {
  try {
    // Get current user details
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: 'Please make sure you are signed in before fixing your profile.' };
    }
    
    const userId = user.id;
    const userEmail = user.email || email;
    
    console.log('Checking profile for user:', { userId, userEmail });
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (existingProfile) {
      console.log('Profile already exists, no fix needed');
      return { success: true, message: 'Profile already exists for your account.' };
    }
    
    // Get role_id from user metadata or use default
    let roleId = user.user_metadata?.role_id;
    let roleName = user.user_metadata?.role || 'property_moderator';
    
    if (!roleId) {
      // Fetch available role ID if not in metadata
      const { data: roleData } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('role_type', roleName)
        .single();
        
      roleId = roleData?.id;
      
      if (!roleId) {
        console.warn('No specific role ID found, using default admin role');
        // Fetch any admin role as fallback
        const { data: anyRole } = await supabase
          .from('admin_roles')
          .select('id')
          .limit(1)
          .single();
          
        roleId = anyRole?.id;
      }
    }
    
    if (!roleId) {
      return { success: false, error: 'Could not determine role ID for profile creation.' };
    }
    
    // Use the RPC function first (bypasses RLS)
    const { error: rpcError } = await supabase.rpc('admin_create_profile', {
      user_id: userId,
      user_email: userEmail,
      user_role: roleName
    });
    
    if (rpcError) {
      console.error('RPC profile creation failed:', rpcError);
      
      // Create profile with direct insert
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          role: roleName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (profileError) {
        console.error('Failed to create profile:', profileError);
        return { success: false, error: `Failed to create profile: ${profileError.message}` };
      }
    }
    
    // Ensure admin_user entry exists
    if (roleId) {
      const { error: adminError } = await supabase
        .from('admin_users')
        .upsert({
          user_id: userId,
          role_id: roleId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
      if (adminError) {
        console.error('Failed to create admin_user:', adminError);
        return { success: false, error: `Profile created but admin role assignment failed: ${adminError.message}` };
      }
    }
    
    // Check if profile was actually created
    const { data: checkProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (checkError || !checkProfile) {
      return { success: false, error: 'Profile creation could not be verified. Please contact support.' };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error fixing user profile:', error);
    return { success: false, error: `Error fixing profile: ${error.message}` };
  }
};

// Signup/password setup - Corrected version with proper token handling
// Simplified version using the new admin_set_password function
export const setupAdminAccount = async (email: string, password: string, setupData: any) => {
  try {
    console.log('Starting account setup for:', email);
    
    // Use the new direct password set function
    const { data: passwordResult, error: passwordError } = await supabase.rpc(
      'admin_set_password',
      {
        user_email: email,
        new_password: password
      }
    );
    
    if (passwordError || !passwordResult) {
      console.error('Failed to set password using admin function:', passwordError);
      
      // Fall back to password reset email
      console.log('Falling back to password reset email');
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/admin/login`
        }
      );
      
      if (resetError) {
        throw new Error(`Unable to reset password: ${resetError.message}`);
      }
      
      return { success: true, usePasswordReset: true };
    }
    
    console.log('Password set successfully!');
    return { success: true, usePasswordReset: false };
  } catch (err: any) {
    console.error('Password setup error:', err);
    return { success: false, error: err.message || 'Failed to set up account' };
  }
};

// Password validation
export const validatePassword = (password: string) => {
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

// Parse setup token
export const parseSetupToken = (setupToken: string | null, emailParam: string) => {
  if (!setupToken) {
    console.log('No setup token found, proceeding with email only');
    return null;
  }
  
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
    return tokenData;
  } catch (tokenError) {
    console.error('Token parsing error:', tokenError);
    throw new Error('Invalid setup token. Please request a new invitation.');
  }
};