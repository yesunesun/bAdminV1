// src/modules/admin/components/users/types.ts
// Version: 1.0.0
// Last Modified: 21-02-2025 10:00 IST

export interface User {
    id: string;
    email: string;
    role: string;
    created_at: string;
    phone?: string | null;
    status?: string;
  }