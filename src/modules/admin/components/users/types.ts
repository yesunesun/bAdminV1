// src/modules/admin/components/users/types.ts
// Version: 1.1.0
// Last Modified: 21-02-2025 16:30 IST
// Purpose: Define TypeScript interfaces for user management in the admin module
//          Contains shared type definitions used across user management components

export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string | null;
  phone?: string | null;
  status?: string;
}