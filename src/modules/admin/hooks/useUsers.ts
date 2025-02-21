// src/modules/admin/hooks/useUsers.ts
// Version: 2.1.0
// Last Modified: 21-02-2025 22:30 IST

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { debugLog, debugError } from '@/lib/debug-utils';
import { useAdminAccess } from './useAdminAccess';

export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  phone?: string | null;
  status?: 'active' | 'inactive' | 'pending';
}

interface UseUsersProps {
  page: number;
  itemsPerPage: number;
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  totalUsers: number;
  refetch: () => Promise<void>;
}

export const useUsers = ({
  page,
  itemsPerPage,
  searchTerm,
  roleFilter,
  statusFilter
}: UseUsersProps): UseUsersReturn => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAccess();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async () => {
    if (!user?.id || !isAdmin) {
      setUsers([]);
      setTotalUsers(0);
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      debugLog('Users Fetch', 'Starting fetch', { userId: user.id });

      // Construct base query
      const query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply pagination first
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query.range(from, to);

      // Apply filters only if they exist
      if (searchTerm?.trim()) {
        query.ilike('email', `%${searchTerm.trim()}%`);
      }

      if (roleFilter && roleFilter !== 'all') {
        query.eq('role', roleFilter);
      }

      if (statusFilter && statusFilter !== 'all') {
        query.eq('status', statusFilter);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        debugError('Users Fetch', 'Query failed', fetchError);
        throw fetchError;
      }

      debugLog('Users Fetch', 'Success', { 
        count: count || 0,
        results: data?.length || 0
      });

      setUsers(data || []);
      setTotalUsers(count || 0);
      setError(null);

    } catch (err) {
      debugError('Users Fetch', 'Failed', err);
      setError('Failed to fetch users');
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      fetchUsers();
    }
  }, [user?.id, isAdmin, adminLoading, page, itemsPerPage, searchTerm, roleFilter, statusFilter]);

  return {
    users,
    loading: loading || adminLoading,
    error,
    totalUsers,
    refetch: fetchUsers
  };
};