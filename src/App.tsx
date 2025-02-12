// src/App.tsx
// Version: 1.3.6
// Last Modified: 12-02-2025 17:45 IST

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from '@/components/Header';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ListYourProperty from './pages/ListYourProperty';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import EditProperty from './pages/EditProperty';
import PropertyPreview from './pages/PropertyPreview';
import AuthCallback from './pages/AuthCallback';
import ChatBot from './components/ChatBot';
import AdminPasswordReset from './pages/AdminPasswordReset';
import AdminRegister from './pages/AdminRegister';
import SuperAdminRegister from './pages/SuperAdminRegister';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = window.location.pathname;
  const noHeaderRoutes = ['/login', '/admin/login', '/register', '/admin/register', '/super-admin/register', '/admin/reset-password'];
  const showHeader = !noHeaderRoutes.includes(location);

  return (
    <>
      {showHeader && <Header />}
      <main className={`${showHeader ? 'max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8' : ''}`}>
        {children}
      </main>
      {showHeader && <ChatBot />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <AppLayout>
            <Routes>
              {/* Auth Callback */}
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/super-admin/register" element={<SuperAdminRegister />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reset-password"
                element={
                  <PublicRoute>
                    <AdminPasswordReset />
                  </PublicRoute>
                }
              />

              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties"
                element={
                  <ProtectedRoute>
                    <Properties />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/list"
                element={
                  <ProtectedRoute>
                    <ListYourProperty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/:id/preview"
                element={
                  <ProtectedRoute>
                    <PropertyPreview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditProperty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/:id"
                element={
                  <ProtectedRoute>
                    <PropertyDetails />
                  </ProtectedRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppLayout>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;