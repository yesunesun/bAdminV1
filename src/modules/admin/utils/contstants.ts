// src/modules/admin/utils/constants.ts
// Version: 1.0.0
// Last Modified: 21-02-2025 10:00 IST

export const USER_ROLES = ['all', 'user', 'agent', 'owner'] as const;
export const USER_STATUS = ['all', 'active', 'inactive', 'pending'] as const;
export const ITEMS_PER_PAGE = 10;

export type UserRole = typeof USER_ROLES[number];
export type UserStatus = typeof USER_STATUS[number];