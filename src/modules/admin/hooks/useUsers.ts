// src/modules/admin/hooks/useUsers.ts
// Version: 2.6.0
// Last Modified: 22-02-2025 00:20 IST

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { debugLog } from '@/lib/debug-utils';
import { useAdminAccess } from './useAdminAccess';
import { UserService, User } from '../services/userService';

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
  deleteUser: (userId: string) => Promise<void>;
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

    setLoading(true);

    const result = await UserService.fetchUsers({
      page,
      itemsPerPage,
      searchTerm,
      roleFilter,
      statusFilter
    });

    setUsers(result.users);
    setTotalUsers(result.total);
    setError(result.error);
    setLoading(false);
  };

  const deleteUser = async (userId: string) => {
    if (!user?.id || !isAdmin) {
      throw new Error('Unauthorized');
    }

    const { error: deleteError } = await UserService.deleteUser(userId);
    if (deleteError) throw new Error(deleteError);

    // Update local state
    setUsers(prev => prev.filter(u => u.id !== userId));
    setTotalUsers(prev => prev - 1);

    // Refresh the list
    await fetchUsers();
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
    refetch: fetchUsers,
    deleteUser
  };
};