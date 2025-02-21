// src/modules/admin/hooks/useUsers.ts
// Version: 2.1.5
// Last Modified: 21-02-2025 17:30 IST
// Purpose: Custom hook for managing user data in the admin dashboard
//          Handles user data fetching, filtering, pagination and last login tracking
//          Provides real-time user management functionality with session data

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
  last_sign_in_at?: string | null;
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

      // Fetch profiles data
      const query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Calculate pagination range
      const start = (page - 1) * itemsPerPage;
      query.range(start, start + itemsPerPage - 1);

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

      const { data: profilesData, error: fetchError, count } = await query;

      if (fetchError) {
        debugError('Users Fetch', 'Query failed', fetchError);
        throw fetchError;
      }

      // Get last sign in time from sessions table
      if (profilesData && profilesData.length > 0) {
        const { data: sessionsData } = await supabase
          .from('sessions')
          .select('user_id, created_at')
          .in('user_id', profilesData.map(p => p.id))
          .order('created_at', { ascending: false });

        // Create a map of latest session times
        const latestSessions = sessionsData?.reduce((acc, session) => {
          if (!acc[session.user_id] || new Date(session.created_at) > new Date(acc[session.user_id])) {
            acc[session.user_id] = session.created_at;
          }
          return acc;
        }, {} as Record<string, string>);

        // Merge the data
        const mergedData = profilesData.map(profile => ({
          ...profile,
          last_sign_in_at: latestSessions?.[profile.id] || null
        }));

        setUsers(mergedData);
      } else {
        setUsers(profilesData || []);
      }

      setTotalUsers(count || 0);
      setError(null);

      debugLog('Users Fetch', 'Success', { 
        count: count || 0,
        results: profilesData?.length || 0
      });

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