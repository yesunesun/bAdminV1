// src/modules/admin/utils/styles.ts
// Version: 1.1.0
// Last Modified: 21-02-2025 17:00 IST

import { ADMIN_ROLES } from './constants';

export const getRoleColor = (role: string) => {
    const colors = {
      // Admin role colors
      [ADMIN_ROLES.SUPER_ADMIN]: 'bg-purple-100 text-purple-800',
      [ADMIN_ROLES.ADMIN]: 'bg-purple-100 text-purple-800',
      [ADMIN_ROLES.PROPERTY_MODERATOR]: 'bg-blue-100 text-blue-800',
      // User role colors
      admin: 'bg-purple-100 text-purple-800',
      agent: 'bg-blue-100 text-blue-800',
      owner: 'bg-green-100 text-green-800',
      user: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || colors.user;
  };
  
  export const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };