// src/modules/admin/hooks/useAdminAccess.ts
// Version: 3.0.0
// Last Modified: 27-02-2025 11:30 IST
// Purpose: Improved role checking with better debug logs

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { debugLog, debugError } from '@/lib/debug-utils';
import { AdminRole, ADMIN_ROLES } from '../utils/constants';

interface UseAdminAccessReturn {
  isAdmin: boolean;
  isPropertyModerator: boolean;
  loading: boolean;
  error: string | null;
  adminRole: AdminRole | null;
  refetchAdminStatus: () => Promise<void>;
}

export const useAdminAccess = (): UseAdminAccessReturn => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPropertyModerator, setIsPropertyModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);

  const checkAdminAccess = async () => {
    if (!user?.id) {
      setIsAdmin(false);
      setIsPropertyModerator(false);
      setAdminRole(null);
      setLoading(false);
      return;
    }

    try {
      console.log('Checking admin access for user:', user.id, user.email);
      console.log('User metadata:', user.user_metadata);
      
      // First check user metadata for role info
      const userRole = user.user_metadata?.role;
      
      if (userRole) {
        console.log('Found role in metadata:', userRole);
        const isAdminUser = userRole === ADMIN_ROLES.ADMIN || userRole === ADMIN_ROLES.SUPER_ADMIN;
        const isModeratorUser = userRole === ADMIN_ROLES.PROPERTY_MODERATOR;
        
        if (isAdminUser || isModeratorUser) {
          setIsAdmin(isAdminUser);
          setIsPropertyModerator(isModeratorUser);
          setAdminRole(userRole as AdminRole);
          setError(null);
          console.log('Role set from metadata:', { isAdmin: isAdminUser, isPropertyModerator: isModeratorUser });
          setLoading(false);
          return;
        }
      }

      // If not found in metadata, check the database
      console.log('No role in metadata, checking database');
      const { data, error: adminError } = await supabase
        .from('admin_roles')
        .select(`
          role_type,
          admin_users!inner (
            user_id
          )
        `)
        .eq('admin_users.user_id', user.id)
        .single();

      if (adminError) {
        console.error('Admin role check error:', adminError);
        debugError('Admin Check', 'Query failed', adminError);
        throw adminError;
      }

      if (!data?.role_type) {
        console.log('No role found in database for user');
        setIsAdmin(false);
        setIsPropertyModerator(false);
        setAdminRole(null);
        return;
      }

      console.log('Found role in database:', data.role_type);
      debugLog('Admin Check', 'Success', {
        userId: user.id,
        roleType: data.role_type
      });

      const roleType = data.role_type as AdminRole;
      setAdminRole(roleType);
      
      // Set appropriate access flags based on role
      const roleIsAdmin = roleType === ADMIN_ROLES.ADMIN || roleType === ADMIN_ROLES.SUPER_ADMIN;
      const roleIsModerator = roleType === ADMIN_ROLES.PROPERTY_MODERATOR;
      
      setIsAdmin(roleIsAdmin);
      setIsPropertyModerator(roleIsModerator);
      console.log('Role set from database:', { isAdmin: roleIsAdmin, isPropertyModerator: roleIsModerator });
      setError(null);

    } catch (err) {
      console.error('Admin role check completely failed:', err);
      debugError('Admin Check', 'Failed', err);
      setIsAdmin(false);
      setIsPropertyModerator(false);
      setAdminRole(null);
      setError('Admin verification failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAccess();
  }, [user?.id]);

  return {
    isAdmin,
    isPropertyModerator,
    loading,
    error,
    adminRole,
    refetchAdminStatus: checkAdminAccess
  };
};