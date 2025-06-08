// src/routes/adminRoutes.tsx
// Version: 3.4.0
// Last Modified: 01-03-2025 13:30 IST
// Purpose: Updated property map view import to use new folder structure

import { Suspense } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AdminDashboard from '@/modules/admin/pages/AdminDashboard';
import AdminLogin from '@/modules/admin/pages/AdminLogin';
import AdminRegister from '@/modules/admin/pages/AdminRegister';
import AdminPasswordReset from '@/modules/admin/pages/AdminPasswordReset';
import AdminForgotPassword from '@/modules/admin/pages/AdminForgotPassword';
import AdminSetup from '@/pages/AdminSetup';
import UsersList from '@/modules/admin/components/UsersList';
import { AdminLayout } from '@/modules/admin/components/AdminLayout';
import AdminDebugPage from '@/pages/AdminDebugPage';
import PropertyListView from '@/modules/admin/pages/PropertyListView';
// Update import path to use the new folder structure for PropertyMapView
import PropertyMapView from '@/modules/admin/pages/PropertyMapView/index';

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

// Wrapper component for admin routes
const AdminWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  </ThemeProvider>
);

// Export flattened routes for direct consumption by App.tsx
export const adminRoutes = [
  // Default admin route - redirects to login
  {
    path: '/admin',
    element: <Navigate to="/admin/login" replace />
  },
  // Login route - explicitly defined
  {
    path: '/admin/login',
    element: <AdminLogin />
  },
  // Forgot password route - explicitly defined
  {
    path: '/admin/forgot-password',
    element: <AdminForgotPassword />
  },
  // Reset password route - explicitly defined
  {
    path: '/admin/reset-password',
    element: <AdminPasswordReset />
  },
  // Register route - explicitly defined
  {
    path: '/admin/register',
    element: <AdminRegister />
  },
  // Setup route - explicitly defined
  {
    path: '/admin/setup',
    element: <AdminSetup />
  },
  // Debug route - explicitly defined
  {
    path: '/admin/debug',
    element: <AdminDebugPage />,
    errorElement: <ErrorFallback />
  },
  // Dashboard route - explicitly defined with layout
  {
    path: '/admin/dashboard',
    element: (
      <AdminWrapper>
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </AdminWrapper>
    ),
    errorElement: <ErrorFallback />
  },
  // Users route - explicitly defined with layout
  {
    path: '/admin/users',
    element: (
      <AdminWrapper>
        <AdminLayout>
          <UsersList />
        </AdminLayout>
      </AdminWrapper>
    ),
    errorElement: <ErrorFallback />
  },
  // Properties list route - explicitly defined with layout
  {
    path: '/admin/properties',
    element: (
      <AdminWrapper>
        <AdminLayout>
          <PropertyListView />
        </AdminLayout>
      </AdminWrapper>
    ),
    errorElement: <ErrorFallback />
  },
  // Property map view route - explicitly defined with layout
  {
    path: '/admin/property-map',
    element: (
      <AdminWrapper>
        <AdminLayout>
          <PropertyMapView />
        </AdminLayout>
      </AdminWrapper>
    ),
    errorElement: <ErrorFallback />
  }
];