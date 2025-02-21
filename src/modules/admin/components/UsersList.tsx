// src/modules/admin/components/UsersList.tsx
// Version: 1.2.0
// Last Modified: 21-02-2025 16:15 IST

import React from 'react';
import { useUsers } from '../hooks/useUsers';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { Card } from '@/components/ui/card';
import { UserListEmpty } from './users/UserListEmpty';
import { UserListError } from './users/UserListError';
import { UserListLoading } from './users/UserListLoading';
import { UsersTable } from './users/UsersTable';
import { UsersTableHeader } from './users/UsersTableHeader';
import { UsersPagination } from './users/UsersPagination';
import { UsersSearchFilters } from './users/UsersSearchFilters';
import { InviteUserModal } from './users/InviteUserModal';
import { AuthProvider } from '@/contexts/AuthContext';
import { ADMIN_ROLES } from '../utils/constants';

export const UsersList: React.FC = () => {
  const { isAdmin, adminRole, loading: adminLoading, error: adminError } = useAdminAccess();
  const [page, setPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const {
    users,
    loading: usersLoading,
    error: usersError,
    totalUsers,
    refetch
  } = useUsers({
    page,
    itemsPerPage,
    searchTerm,
    roleFilter,
    statusFilter
  });

  const loading = adminLoading || usersLoading;
  const error = adminError || usersError;
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalUsers / itemsPerPage));

  if (loading) return <UserListLoading />;
  if (error) return <UserListError error={error} />;
  if (!isAdmin) return <UserListError error="Unauthorized access" />;

  const canInviteUsers = adminRole === ADMIN_ROLES.SUPER_ADMIN || adminRole === ADMIN_ROLES.ADMIN;

  return (
    <Card className="w-full">
      <div className="p-4 flex justify-between items-center border-b">
        <UsersTableHeader />
        {canInviteUsers && <InviteUserModal onSuccess={refetch} />}
      </div>

      <UsersSearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      
      {!users.length ? (
        <UserListEmpty />
      ) : (
        <>
          <UsersTable users={users} onRefresh={refetch} />
          <UsersPagination
            currentPage={page}
            totalPages={totalPages}
            totalUsers={totalUsers}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
          />
        </>
      )}
    </Card>
  );
};

// Wrap with AuthProvider to ensure auth context is available
export const UsersListWithAuth: React.FC = () => (
  <AuthProvider>
    <UsersList />
  </AuthProvider>
);

export default UsersListWithAuth;