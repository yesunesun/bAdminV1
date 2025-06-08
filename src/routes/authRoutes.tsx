// src/routes/authRoutes.tsx
// Version: 2.0.0
// Last Modified: 26-02-2025 20:30 IST
// Purpose: Authentication routes configuration

import React from 'react';
import { RouteObject } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import AuthCallback from '@/pages/AuthCallback';
import SuperAdminRegister from '@/pages/SuperAdminRegister';

// Export with the correct name 'authRoutes' instead of 'mainRoutes'
export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />
  },
  {
    path: '/super-admin/register',
    element: <SuperAdminRegister />
  }
];