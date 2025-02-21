// src/modules/admin/utils/constants.ts
// Version: 1.1.0
// Last Modified: 21-02-2025 16:15 IST

export const USER_ROLES = ['all', 'user', 'agent', 'owner'] as const;
export const USER_STATUS = ['all', 'active', 'inactive', 'pending'] as const;
export const ITEMS_PER_PAGE = 10;

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PROPERTY_MODERATOR: 'property_moderator'
} as const;

export const ADMIN_ROLE_LABELS = {
  [ADMIN_ROLES.SUPER_ADMIN]: 'Super Admin',
  [ADMIN_ROLES.ADMIN]: 'Admin',
  [ADMIN_ROLES.PROPERTY_MODERATOR]: 'Property Moderator'
} as const;

export type UserRole = typeof USER_ROLES[number];
export type UserStatus = typeof USER_STATUS[number];
export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];