// src/App.tsx 
// Version: 2.2.0
// Last Modified: 20-02-2025 15:00 IST

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from '@/components/Header';
import ChatBot from './components/ChatBot';

// Route Configurations
import { mainRoutes } from './routes/mainRoutes';
import { authRoutes } from './routes/authRoutes';
import { adminRoutes } from './routes/adminRoutes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace />;
  }

  if (adminOnly && user.user_metadata?.role !== 'admin' && user.user_metadata?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const isAdmin = user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'super_admin';
    
    if (isAdminRoute && isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppLayout() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <ChatBot />
    </>
  );
}

const renderRoutes = (routes: any[], parentPath = '') => {
  return routes.map((route, i) => {
    const path = `${parentPath}${route.path}`;
    
    if (route.children) {
      return (
        <Route key={i} path={route.path}>
          {renderRoutes(route.children, path)}
        </Route>
      );
    }

    const element = route.requiresAuth ? (
      <ProtectedRoute adminOnly={route.adminOnly}>{route.element}</ProtectedRoute>
    ) : route.publicOnly ? (
      <PublicRoute>{route.element}</PublicRoute>
    ) : (
      route.element
    );

    return <Route key={i} path={route.path} element={element} index={route.index} />;
  });
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Auth Routes */}
            {renderRoutes(authRoutes.map(route => ({ ...route, publicOnly: true })))}

            {/* Admin Routes */}
            {renderRoutes(adminRoutes.map(route => ({ 
              ...route, 
              requiresAuth: !route.path?.endsWith('login') && !route.path?.endsWith('register'),
              adminOnly: !route.path?.endsWith('login') && !route.path?.endsWith('register')
            })))}

            {/* Main App Routes */}
            <Route element={<AppLayout />}>
              {renderRoutes(mainRoutes.map(route => ({ ...route, requiresAuth: true })))}
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;