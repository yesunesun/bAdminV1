// src/modules/admin/components/users/UsersTable.tsx
// Version: 1.3.0
// Last Modified: 25-02-2025 18:15 IST

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getRoleColor, getStatusColor } from '../../utils/styles';
import { UserTableActions } from './UserTableActions';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string | null;
  phone?: string | null;
  status?: string;
  isInvited?: boolean;
  hasProfile?: boolean;
}

interface UsersTableProps {
  users: User[];
  onViewDetails?: (userId: string) => void;
  onRefresh?: () => void;
  onDeleteUser?: (userId: string) => Promise<void>;
}

const formatDate = (date: string | null | undefined): string => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  onViewDetails = () => {}, 
  onRefresh = () => {},
  onDeleteUser 
}) => {
  // Create a default delete function that logs a warning
  const defaultDeleteFn = async (id: string) => {
    console.warn('No delete function provided for user:', id);
    throw new Error('Delete function not provided');
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Profile
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Login
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={getRoleColor(user.role)}>
                  {user.role || 'Unassigned'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={getStatusColor(user.status || 'pending')}>
                  {user.status || 'Pending'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={user.hasProfile ? "success" : "warning"}>
                  {user.hasProfile ? 'Complete' : 'Incomplete'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.phone || 'Not provided'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(user.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(user.last_sign_in_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <UserTableActions
                  userId={user.id}
                  userEmail={user.email}
                  onView={onViewDetails}
                  onEdit={onViewDetails}
                  onDelete={onDeleteUser || defaultDeleteFn}
                  hasProfile={user.hasProfile}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};