// src/routes/adminRoutes.tsx
// Version: 1.0.0
// Last Modified: 20-02-2025 15:00 IST

import AdminDashboard from '@/modules/admin/pages/AdminDashboard';
import AdminLogin from '@/modules/admin/pages/AdminLogin';
import AdminRegister from '@/modules/admin/pages/AdminRegister';
import AdminPasswordReset from '@/modules/admin/pages/AdminPasswordReset';
import UsersList from '@/modules/admin/components/UsersList';
import { AdminLayout } from '@/modules/admin/components/AdminLayout';

export const adminRoutes = [
  {
    path: '/admin',
    children: [
      { path: 'login', element: <AdminLogin /> },
      { path: 'register', element: <AdminRegister /> },
      { path: 'reset-password', element: <AdminPasswordReset /> },
      {
        path: 'dashboard',
        element: (
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        )
      },
      {
        path: 'users',
        element: (
          <AdminLayout>
            <UsersList />
          </AdminLayout>
        )
      }
    ]
  }
];