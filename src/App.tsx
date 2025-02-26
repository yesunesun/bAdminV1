// src/App.tsx 
// Version: 5.0.0
// Last Modified: 26-02-2025 16:35 IST
// Purpose: App with added Seeker module support

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from '@/components/Header';
// import ChatBot from './components/ChatBot';
import { useAdminAccess } from './modules/admin/hooks/useAdminAccess';

// Import Dashboard directly for test route
import Dashboard from './modules/owner/pages/Dashboard';

// Route Configurations
import { mainRoutes } from './routes/mainRoutes';
import { authRoutes } from './routes/authRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { moderatorRoutes } from './routes/moderatorRoutes';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

// Simple auth route that doesn't depend on admin access
const SimpleAuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  console.log('SimpleAuthRoute check:', { user: !!user, loading });
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin route with role checking
const AdminAuthRoute = ({ children, adminOnly, moderatorOnly }: { 
  children: React.ReactNode, 
  adminOnly?: boolean, 
  moderatorOnly?: boolean 
}) => {
  const { user, loading } = useAuth();
  const { isAdmin, isPropertyModerator, loading: roleLoading } = useAdminAccess();
  
  if (loading || roleLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to={adminOnly ? "/admin/login" : moderatorOnly ? "/moderator/login" : "/login"} replace />;
  }
  
  if ((adminOnly && !isAdmin) || (moderatorOnly && !isPropertyModerator)) {
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
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Public or Protected route - allows both logged in and non-logged in users
const PublicOrProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
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
      {/* <ChatBot /> */}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Direct test route for dashboard */}
            <Route 
              path="/dashboard-test" 
              element={
                <SimpleAuthRoute>
                  <div className="p-8">
                    <h1 className="text-3xl font-bold mb-4">Dashboard Test Route</h1>
                    <Dashboard />
                  </div>
                </SimpleAuthRoute>
              } 
            />
            
            {/* Auth Routes */}
            {authRoutes.map((route, i) => (
              <Route 
                key={`auth-${i}`}
                path={route.path} 
                element={<PublicRoute>{route.element}</PublicRoute>} 
              />
            ))}

            {/* Admin Routes */}
            {adminRoutes.map((route, i) => (
              <Route 
                key={`admin-${i}`}
                path={route.path} 
                element={
                  route.path?.endsWith('login') ? 
                    <PublicRoute>{route.element}</PublicRoute> : 
                    <AdminAuthRoute adminOnly>{route.element}</AdminAuthRoute>
                } 
              />
            ))}
            
            {/* Moderator Routes */}
            {moderatorRoutes.map((route, i) => (
              <Route 
                key={`mod-${i}`}
                path={route.path} 
                element={
                  route.path?.endsWith('login') ? 
                    <PublicRoute>{route.element}</PublicRoute> : 
                    <AdminAuthRoute moderatorOnly>{route.element}</AdminAuthRoute>
                } 
              />
            ))}

            {/* Main App Routes with simplified protection */}
            <Route element={<AppLayout />}>
              {mainRoutes.map((route, i) => {
                // Handle routes with children
                if (route.children) {
                  return (
                    <Route key={`main-${i}`} path={route.path}>
                      {route.children.map((childRoute, j) => (
                        <Route
                          key={`main-${i}-child-${j}`}
                          path={childRoute.path}
                          element={
                            // Special handling for seeker routes - these should be accessible to all users
                            route.path === '/seeker' ? (
                              <PublicOrProtectedRoute>
                                {childRoute.element}
                              </PublicOrProtectedRoute>
                            ) : (
                              <SimpleAuthRoute>
                                {childRoute.element}
                              </SimpleAuthRoute>
                            )
                          }
                          index={childRoute.index}
                        />
                      ))}
                    </Route>
                  );
                }
                
                // Handle regular routes
                return (
                  <Route
                    key={`main-${i}`}
                    path={route.path}
                    element={
                      // Special handling for seeker routes at the top level if needed
                      route.path === '/seeker' ? (
                        <PublicOrProtectedRoute>
                          {route.element}
                        </PublicOrProtectedRoute>
                      ) : (
                        <SimpleAuthRoute>
                          {route.element}
                        </SimpleAuthRoute>
                      )
                    }
                    index={route.index}
                  />
                );
              })}
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;