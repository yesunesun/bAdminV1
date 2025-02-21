// src/routes/authRoutes.tsx
// Version: 1.0.0
// Last Modified: 20-02-2025 15:00 IST

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import AuthCallback from '@/pages/AuthCallback';
import SuperAdminRegister from '@/pages/SuperAdminRegister';

export const authRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/auth/callback', element: <AuthCallback /> },
  { path: '/super-admin/register', element: <SuperAdminRegister /> }
];