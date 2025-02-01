// src/App.tsx
// Version: 1.9.0
// Last Modified: 2025-02-02T03:30:00+05:30 (IST)

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from '@/components/Header';
import { AuthDebug } from './components/AuthDebug';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddProperty from './pages/AddProperty';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import EditProperty from './pages/EditProperty';
import PropertyPreview from './pages/PropertyPreview';
import AuthCallback from './pages/AuthCallback';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  console.log('RequireAuth:', { user, loading });
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  console.log('PublicOnly:', { user, loading });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  console.log('AppRoutes:', { user, loading });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              <PublicOnly>
                <Login />
              </PublicOnly>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicOnly>
                <Register />
              </PublicOnly>
            } 
          />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/properties"
            element={
              <RequireAuth>
                <Properties />
              </RequireAuth>
            }
          />
          <Route
            path="/properties/add"
            element={
              <RequireAuth>
                <AddProperty />
              </RequireAuth>
            }
          />
          <Route
            path="/properties/:id"
            element={
              <RequireAuth>
                <PropertyDetails />
              </RequireAuth>
            }
          />
          <Route
            path="/properties/:id/edit"
            element={
              <RequireAuth>
                <EditProperty />
              </RequireAuth>
            }
          />
          <Route
            path="/properties/:id/preview"
            element={
              <RequireAuth>
                <PropertyPreview />
              </RequireAuth>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {process.env.NODE_ENV === 'development' && <AuthDebug />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}