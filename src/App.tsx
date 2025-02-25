// src/App.tsx 
// Version: 2.4.0
// Last Modified: 25-02-2025 17:15 IST

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from '@/components/Header';
import ChatBot from './components/ChatBot';
import { useAdminAccess } from './modules/admin/hooks/useAdminAccess';

// Route Configurations
import { mainRoutes } from './routes/mainRoutes';
import { authRoutes } from './routes/authRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { moderatorRoutes } from './routes/moderatorRoutes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  moderatorOnly?: boolean;
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly, moderatorOnly }) => {
  const { user, loading } = useAuth();
  const { isAdmin, isPropertyModerator, loading: roleLoading } = useAdminAccess();

  if (loading || roleLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to={adminOnly ? "/admin/login" : moderatorOnly ? "/moderator/login" : "/login"} replace />;
  }

  // Check for admin routes access
  if (adminOnly) {
    if (!isAdmin) {
      // If they're a property moderator, send them to moderator dashboard
      if (isPropertyModerator) {
        return <Navigate to="/moderator/dashboard" replace />;
      }
      // Otherwise send to main dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check for moderator routes access
  if (moderatorOnly) {
    if (!isPropertyModerator) {
      // If they're an admin, send them to admin dashboard
      if (isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      // Otherwise send to main dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isAdmin, isPropertyModerator, loading: roleLoading } = useAdminAccess();

  if (loading || roleLoading) {
    return <LoadingSpinner />;
  }

  if (user) {
    // First check user metadata for role info
    const userRole = user.user_metadata?.role;
    
    if (userRole === 'property_moderator') {
      return <Navigate to="/moderator/dashboard" replace />;
    }
    
    if (userRole === 'admin' || userRole === 'super_admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // If no metadata role, use the results from useAdminAccess
    if (isPropertyModerator) {
      return <Navigate to="/moderator/dashboard" replace />;
    }
    
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Default to regular user dashboard
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

    let element = route.element;
    
    if (route.requiresAuth) {
      element = (
        <ProtectedRoute 
          adminOnly={route.adminOnly} 
          moderatorOnly={route.moderatorOnly}
        >
          {route.element}
        </ProtectedRoute>
      );
    } else if (route.publicOnly) {
      element = <PublicRoute>{route.element}</PublicRoute>;
    }

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
              requiresAuth: !route.path?.endsWith('login') && !route.path?.endsWith('register') && !route.path?.endsWith('forgot-password'),
              adminOnly: !route.path?.endsWith('login') && !route.path?.endsWith('register') && !route.path?.endsWith('forgot-password')
            })))}
            
            {/* Moderator Routes */}
            {renderRoutes(moderatorRoutes.map(route => ({ 
              ...route, 
              requiresAuth: !route.path?.endsWith('login'),
              moderatorOnly: !route.path?.endsWith('login')
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