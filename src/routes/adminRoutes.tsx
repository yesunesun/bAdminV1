// src/routes/adminRoutes.tsx
// Version: 1.4.0
// Last Modified: 21-02-2025 21:15 IST

import { Suspense } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminDashboard from '@/modules/admin/pages/AdminDashboard';
import AdminLogin from '@/modules/admin/pages/AdminLogin';
import AdminRegister from '@/modules/admin/pages/AdminRegister';
import AdminPasswordReset from '@/modules/admin/pages/AdminPasswordReset';
import UsersList from '@/modules/admin/components/UsersList';
import { AdminLayout } from '@/modules/admin/components/AdminLayout';

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Error fallback component
const ErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="bg-red-50 p-4 rounded-md">
      <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
      <p className="mt-2 text-sm text-red-600">Please try refreshing the page</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

// Wrapper for common providers
const ProvidersWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <ThemeProvider>
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    </ThemeProvider>
  </AuthProvider>
);

// Base layout that includes auth and theme providers
const BaseAdminLayout = ({ children }: { children: React.ReactNode }) => (
  <ProvidersWrapper>
    <AdminLayout>{children}</AdminLayout>
  </ProvidersWrapper>
);

export const adminRoutes = [
  {
    path: '/admin',
    element: <ProvidersWrapper />,
    errorElement: <ErrorFallback />,
    children: [
      // Public routes
      {
        path: 'login',
        element: <AdminLogin />
      },
      {
        path: 'register',
        element: <AdminRegister />
      },
      {
        path: 'reset-password',
        element: <AdminPasswordReset />
      },
      
      // Protected routes
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