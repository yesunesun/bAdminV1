// src/modules/admin/hooks/useAdminAccess.ts
// Version: 2.3.0
// Last Modified: 25-02-2025 18:00 IST

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
      // First check user metadata for role info
      const userRole = user.user_metadata?.role;
      
      if (userRole) {
        const isAdminUser = userRole === ADMIN_ROLES.ADMIN || userRole === ADMIN_ROLES.SUPER_ADMIN;
        const isModeratorUser = userRole === ADMIN_ROLES.PROPERTY_MODERATOR;
        
        if (isAdminUser || isModeratorUser) {
          setIsAdmin(isAdminUser);
          setIsPropertyModerator(isModeratorUser);
          setAdminRole(userRole as AdminRole);
          setError(null);
          setLoading(false);
          return;
        }
      }

      // If not found in metadata, check the database
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
        debugError('Admin Check', 'Query failed', adminError);
        throw adminError;
      }

      if (!data?.role_type) {
        setIsAdmin(false);
        setIsPropertyModerator(false);
        setAdminRole(null);
        return;
      }

      debugLog('Admin Check', 'Success', {
        userId: user.id,
        roleType: data.role_type
      });

      const roleType = data.role_type as AdminRole;
      setAdminRole(roleType);
      
      // Set appropriate access flags based on role
      setIsAdmin(roleType === ADMIN_ROLES.ADMIN || roleType === ADMIN_ROLES.SUPER_ADMIN);
      setIsPropertyModerator(roleType === ADMIN_ROLES.PROPERTY_MODERATOR);
      setError(null);

    } catch (err) {
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