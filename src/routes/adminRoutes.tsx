// src/routes/adminRoutes.tsx
// Full file with reset-password route

import { Suspense, lazy } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AdminDashboard from '@/modules/admin/pages/AdminDashboard';
import AdminLogin from '@/modules/admin/pages/AdminLogin';
import AdminRegister from '@/modules/admin/pages/AdminRegister';
import AdminPasswordReset from '@/modules/admin/pages/AdminPasswordReset';
import AdminForgotPassword from '@/modules/admin/pages/AdminForgotPassword';
import AdminSetup from '@/pages/AdminSetup';
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

// Wrapper for theme and suspense
const AdminWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  </ThemeProvider>
);

// Export routes configuration for React Router
export const adminRoutes = [
  {
    path: '/admin',
    element: <AdminWrapper />,
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
      {
        path: 'forgot-password',
        element: <AdminForgotPassword />
      },
      {
        path: 'setup',
        element: <AdminSetup />
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