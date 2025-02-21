// src/modules/admin/hooks/useAdminAccess.ts
// Version: 2.0.0
// Last Modified: 21-02-2025 22:15 IST

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { debugLog, debugError } from '@/lib/debug-utils';

export type AdminRole = 'admin' | 'super_admin';

interface UseAdminAccessReturn {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  adminRole: AdminRole | null;
  refetchAdminStatus: () => Promise<void>;
}

export const useAdminAccess = (): UseAdminAccessReturn => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);

  const checkAdminAccess = async () => {
    if (!user?.id) {
      setIsAdmin(false);
      setAdminRole(null);
      setLoading(false);
      return;
    }

    try {
      // Simple direct query matching our new policies
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
        setAdminRole(null);
        return;
      }

      debugLog('Admin Check', 'Success', {
        userId: user.id,
        roleType: data.role_type
      });

      setIsAdmin(true);
      setAdminRole(data.role_type as AdminRole);
      setError(null);

    } catch (err) {
      debugError('Admin Check', 'Failed', err);
      setIsAdmin(false);
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
    loading,
    error,
    adminRole,
    refetchAdminStatus: checkAdminAccess
  };
};