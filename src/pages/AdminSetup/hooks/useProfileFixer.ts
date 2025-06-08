// src/pages/AdminSetup/hooks/useProfileFixer.ts
// Version: 1.0.1
// Last Modified: 25-02-2025 22:45 IST
// Purpose: Hook for manual profile fixing (as fallback for legacy users)

import { supabase } from '@/lib/supabase';

// Function to directly fix a missing profile
export const fixExistingUserProfile = async (email: string) => {
  try {
    // Get current user details
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: 'Not authenticated. Please sign in first.' };
    }
    
    const userId = user.id;
    
    console.log('Attempting to manually fix profile for:', { userId, email });
    
    // Check if profile already exists first
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (existingProfile) {
      console.log('Profile already exists, no fix needed');
      return { success: true, message: 'Profile already exists for your account.' };
    }
    
    // Get role from user metadata
    const userRole = user.user_metadata?.role || 'property_moderator';
    let roleId = user.user_metadata?.role_id;
    
    // If no role_id in metadata, try to fetch it
    if (!roleId) {
      const { data: roleData } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('role_type', userRole)
        .single();
        
      roleId = roleData?.id;
      
      if (!roleId) {
        // Get any available role as fallback
        const { data: anyRole } = await supabase
          .from('admin_roles')
          .select('id')
          .limit(1)
          .single();
          
        roleId = anyRole?.id;
      }
    }
    
    // Try multiple approaches to create the profile
    
    // 1. Try RPC method first (bypasses RLS)
    console.log("Attempt 1: RPC method");
    try {
      const { error: rpcError } = await supabase.rpc('admin_create_profile', {
        user_id: userId,
        user_email: email,
        user_role: userRole
      });
      
      if (!rpcError) {
        console.log('Profile created successfully via RPC');
        
        // If we have a role_id, ensure admin_user entry exists
        if (roleId) {
          await supabase
            .from('admin_users')
            .upsert({
              user_id: userId,
              role_id: roleId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        }
        
        return { success: true, message: 'Profile created successfully!' };
      }
      
      console.log('RPC method failed:', rpcError);
    } catch (rpcException) {
      console.error('RPC exception:', rpcException);
    }
    
    // 2. Try direct insert
    console.log("Attempt 2: Direct insert");
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        role: userRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (!insertError) {
      console.log('Profile created successfully via direct insert');
      
      // If we have a role_id, ensure admin_user entry exists
      if (roleId) {
        await supabase
          .from('admin_users')
          .upsert({
            user_id: userId,
            role_id: roleId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
      
      return { success: true, message: 'Profile created successfully!' };
    }
    
    console.log('Direct insert failed:', insertError);
    
    // 3. Try admin user creation, which might trigger profile creation as a side effect
    console.log("Attempt 3: Create admin user");
    if (roleId) {
      const { error: adminUserError } = await supabase
        .from('admin_users')
        .upsert({
          user_id: userId,
          role_id: roleId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
      if (!adminUserError) {
        console.log('Admin user created, checking if profile was created as side effect');
        
        // Check if profile was created as a side effect
        const { data: checkProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();
          
        if (checkProfile) {
          console.log('Profile was created as side effect of admin_user creation');
          return { success: true, message: 'Profile created successfully!' };
        }
      }
      
      console.log('Admin user creation failed or did not create profile:', adminUserError);
    }
    
    // All attempts failed
    return { 
      success: false, 
      error: 'Could not create profile after multiple attempts. Please contact support or try again later.' 
    };
  } catch (error: any) {
    console.error('Profile fixing error:', error);
    return { success: false, error: `Error: ${error.message}` };
  }
};

// Export a hook-like function for consistency with the existing codebase
export const useProfileFixer = () => {
  return { fixExistingUserProfile };
};