// src/App.tsx 
// Version: 6.0.0
// Last Modified: 27-02-2025 09:45 IST
// Purpose: Improved role-based access control for routes

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from '@/components/Header';
import { useAdminAccess } from './modules/admin/hooks/useAdminAccess';

// Import HomePage directly
import HomePage from './pages/HomePage';

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

// Protected route for authenticated users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin route with strict role checking
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminAccess();
  
  if (loading || roleLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

// Moderator route with role checking (allows both moderators and admins)
const ModeratorRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isPropertyModerator, isAdmin, loading: roleLoading } = useAdminAccess();
  
  if (loading || roleLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/moderator/login" replace />;
  }
  
  // Debug log to check role values
  console.log('ModeratorRoute check:', { 
    isAdmin, 
    isPropertyModerator, 
    user: user.email,
    metadata: user.user_metadata
  });
  
  // Allow both moderators and admins to access moderator routes
  if (!isPropertyModerator && !isAdmin) {
    console.error('Access denied to moderator route - user lacks required role');
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-center text-red-700 mb-2">Access Denied</h2>
          <p className="text-gray-600 text-center mb-4">You do not have permission to access this page</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

// Public route that redirects authenticated users to their appropriate dashboard
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isAdmin, isPropertyModerator, loading: roleLoading } = useAdminAccess();
  const location = useLocation();
  
  // Don't redirect for recovery or reset password flows
  const isPasswordReset = location.pathname.includes('reset-password');
  const isRecoveryFlow = location.hash.includes('type=recovery') || 
                         location.search.includes('type=recovery') ||
                         location.search.includes('direct=true');
  
  if (loading || roleLoading) {
    return <LoadingSpinner />;
  }
  
  // Only redirect if not on a recovery flow or reset password page
  if (user && !isPasswordReset && !isRecoveryFlow) {
    // Route to the appropriate dashboard based on role
    if (isAdmin && location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if ((isPropertyModerator || isAdmin) && location.pathname.startsWith('/moderator')) {
      return <Navigate to="/moderator/dashboard" replace />;
    }
    // For regular users, redirect to the main dashboard
    if (!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/moderator')) {
      return <Navigate to="/dashboard" replace />;
    }
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
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Make root path public with HomePage */}
            <Route element={<AppLayout />}>
              <Route 
                path="/" 
                element={
                  <PublicOrProtectedRoute>
                    <HomePage />
                  </PublicOrProtectedRoute>
                } 
              />
            </Route>
            
            {/* Auth Routes - accessible to everyone */}
            {authRoutes.map((route, i) => (
              <Route 
                key={`auth-${i}`}
                path={route.path} 
                element={<PublicRoute>{route.element}</PublicRoute>} 
              />
            ))}

            {/* Admin Routes - accessible ONLY to admins */}
            {adminRoutes.map((route, i) => {
              const isPublicRoute = 
                route.path?.endsWith('login') || 
                route.path?.includes('forgot-password') || 
                route.path?.includes('reset-password');
              
              return (
                <Route 
                  key={`admin-${i}`}
                  path={route.path} 
                  element={
                    isPublicRoute ? 
                      <PublicRoute>{route.element}</PublicRoute> : 
                      <AdminRoute>{route.element}</AdminRoute>
                  } 
                />
              );
            })}
            
            {/* Moderator Routes - accessible to moderators and admins */}
            {moderatorRoutes.map((route, i) => {
              const isPublicRoute = route.path?.endsWith('login');
              
              return (
                <Route 
                  key={`mod-${i}`}
                  path={route.path} 
                  element={
                    isPublicRoute ? 
                      <PublicRoute>{route.element}</PublicRoute> : 
                      <ModeratorRoute>{route.element}</ModeratorRoute>
                  } 
                />
              );
            })}

            {/* Main App Routes */}
            <Route element={<AppLayout />}>
              {mainRoutes
                .filter(route => route.path !== '/') // Filter out root route as we've defined it separately
                .map((route, i) => {
                  // Handle routes with children
                  if (route.children) {
                    return (
                      <Route key={`main-${i}`} path={route.path}>
                        {route.children.map((childRoute, j) => (
                          <Route
                            key={`main-${i}-child-${j}`}
                            path={childRoute.path}
                            element={
                              // Special handling for seeker routes - public
                              route.path === '/seeker' ? (
                                <PublicOrProtectedRoute>
                                  {childRoute.element}
                                </PublicOrProtectedRoute>
                              ) : (
                                // All other routes require authentication
                                <ProtectedRoute>
                                  {childRoute.element}
                                </ProtectedRoute>
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
                        // Special handling for seeker routes
                        route.path === '/seeker' ? (
                          <PublicOrProtectedRoute>
                            {route.element}
                          </PublicOrProtectedRoute>
                        ) : (
                          // All other routes require authentication
                          <ProtectedRoute>
                            {route.element}
                          </ProtectedRoute>
                        )
                      }
                      index={route.index}
                    />
                  );
                })}
            </Route>

            {/* Catch-all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;