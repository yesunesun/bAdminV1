// Version: 1.0.0
// Last Modified: 20-02-2025 20:00 IST

import React from 'react';
import { Shield } from 'lucide-react';

interface UsersTableHeaderProps {
  totalUsers: number;
}

export const UsersTableHeader: React.FC<UsersTableHeaderProps> = ({ totalUsers }) => (
  <div className="flex items-center gap-2">
    <Shield className="h-6 w-6 text-blue-600" />
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">Users Management</h2>
      <p className="text-sm text-gray-500 mt-1">
        Total {totalUsers} user{totalUsers !== 1 ? 's' : ''}
      </p>
    </div>
  </div>
);