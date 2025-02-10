// src/App.tsx
// Version: 1.3.4
// Last Modified: 11-02-2025 00:30 IST

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Routes>
              {/* Auth routes */}
              <Route path="/" element={<AuthCallback />} />
              
              {/* Admin Registration routes */}
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/super-admin/register" element={<SuperAdminRegister />} />
              
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/admin/login"
                element={
                  <PublicRoute>
                    <AdminLogin />
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

              {/* Admin routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected routes */}
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
              <Route
                path="/admin/reset-password"
                element={
                  <PublicRoute>
                    <AdminPasswordReset />
                  </PublicRoute>
                }
              />
            </Routes>
          </main>
          <ChatBot />
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;