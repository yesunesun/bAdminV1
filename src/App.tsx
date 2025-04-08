// src/App.tsx 
// Version: 8.16.0
// Last Modified: 08-04-2025 11:45 IST
// Purpose: Fix property listing wizard navigation by adding nested routes to SeekerLayout

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { Header, BrandLogo } from '@/components/Header';
import { useAdminAccess } from './modules/admin/hooks/useAdminAccess';
import FavoritesDrawer from '@/modules/seeker/components/FavoritesDrawer';
import Footer from '@/components/Footer';

// Import HomePage and PropertyMapHome (updated path)
import HomePage from './pages/HomePage';
import PropertyMapHome from './modules/seeker'; // Updated import path

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
  const navigate = useNavigate();
  
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

// Main app layout with Header - used for non-seeker routes
function AppLayout() {
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  
  const handleFavoritesClick = () => {
    setIsFavoritesOpen(true);
  };
  
  const handleFavoritesClose = () => {
    setIsFavoritesOpen(false);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header onFavoritesClick={handleFavoritesClick} />
      <FavoritesDrawer open={isFavoritesOpen} onClose={handleFavoritesClose} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Standardized Seeker layout with consistent width and padding
function SeekerLayout() {
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  
  const handleFavoritesClick = () => {
    setIsFavoritesOpen(true);
  };
  
  const handleFavoritesClose = () => {
    setIsFavoritesOpen(false);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <Header onFavoritesClick={handleFavoritesClick} />
      </div>
      <FavoritesDrawer open={isFavoritesOpen} onClose={handleFavoritesClose} />
      <main className="flex-grow bg-background">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Root path - Use the standardized seeker layout */}
              <Route element={<SeekerLayout />}>
                <Route 
                  path="/" 
                  element={
                    <PublicOrProtectedRoute>
                      <PropertyMapHome />
                    </PublicOrProtectedRoute>
                  } 
                />
                
                {/* Home page */}
                <Route 
                  path="/home" 
                  element={
                    <PublicOrProtectedRoute>
                      <HomePage />
                    </PublicOrProtectedRoute>
                  } 
                />
                
                {/* Add the new browse route with SeekerLayout */}
                <Route 
                  path="/browse" 
                  element={
                    <PublicOrProtectedRoute>
                      {mainRoutes
                        .find(route => route.path === '/browse')
                        ?.element || <Navigate to="/" />}
                    </PublicOrProtectedRoute>
                  } 
                />
                
                {/* Seeker module routes */}
                <Route path="/seeker">
                  <Route 
                    index
                    element={
                      <PublicOrProtectedRoute>
                        <PropertyMapHome />
                      </PublicOrProtectedRoute>
                    } 
                  />
                  {/* Child routes of /seeker */}
                  {mainRoutes
                    .filter(route => route.path === '/seeker')
                    .flatMap(route => route.children || [])
                    .map((childRoute, j) => (
                      <Route
                        key={`seeker-child-${j}`}
                        path={childRoute.path}
                        element={
                          <PublicOrProtectedRoute>
                            {childRoute.element}
                          </PublicOrProtectedRoute>
                        }
                        index={childRoute.index}
                      />
                    ))}
                </Route>
                
                {/* Add properties main route to use seeker layout when coming from seeker module */}
                <Route 
                  path="/properties" 
                  element={
                    <PublicOrProtectedRoute>
                      {mainRoutes
                        .find(route => route.path === '/properties')
                        ?.children?.find(child => child.index)
                        ?.element || <Navigate to="/" />}
                    </PublicOrProtectedRoute>
                  } 
                />
                
                {/* Add properties/list path to use seeker layout when coming from seeker module */}
                <Route 
                  path="/properties/list" 
                  element={
                    <PublicOrProtectedRoute>
                      {mainRoutes
                        .find(route => route.path === '/properties')
                        ?.children?.find(child => child.path === 'list')
                        ?.element || <Navigate to="/" />}
                    </PublicOrProtectedRoute>
                  } 
                />
                
                {/* Add missing nested routes for property listing wizard */}
                <Route 
                  path="/properties/list/:category/:type" 
                  element={
                    <PublicOrProtectedRoute>
                      {mainRoutes
                        .find(route => route.path === '/properties')
                        ?.children?.find(child => child.path === 'list/:category/:type')
                        ?.element || <Navigate to="/" />}
                    </PublicOrProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/properties/list/:category/:type/:step" 
                  element={
                    <PublicOrProtectedRoute>
                      {mainRoutes
                        .find(route => route.path === '/properties')
                        ?.children?.find(child => child.path === 'list/:category/:type/:step')
                        ?.element || <Navigate to="/" />}
                    </PublicOrProtectedRoute>
                  } 
                />
                
                {/* Properties pages that should use the seeker layout */}
                <Route 
                  path="/properties/:id" 
                  element={
                    <PublicOrProtectedRoute>
                      {mainRoutes
                        .find(route => route.path === '/properties')
                        ?.children?.find(child => child.path === ':id')
                        ?.element || <Navigate to="/" />}
                    </PublicOrProtectedRoute>
                  } 
                />
                
                {/* Include other seeker-related routes here */}
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

              {/* Main App Routes with standard header */}
              <Route element={<AppLayout />}>
                {mainRoutes.map((route, i) => {
                  // Skip routes that are handled by the seeker layout
                  if (route.path === '/seeker' || route.path === '/home' || 
                      route.path === '/properties' || route.path === '/browse') {
                    return null;
                  }
                  
                  // Handle routes with children
                  if (route.children) {
                    // Skip the /properties route which is handled in SeekerLayout
                    if (route.path === '/properties') {
                      return null;
                    }
                    
                    return (
                      <Route key={`main-${i}`} path={route.path}>
                        {route.children.map((childRoute, j) => (
                          <Route
                            key={`main-${i}-child-${j}`}
                            path={childRoute.path}
                            element={
                              <ProtectedRoute>
                                {childRoute.element}
                              </ProtectedRoute>
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
                        <ProtectedRoute>
                          {route.element}
                        </ProtectedRoute>
                      }
                      index={route.index}
                    />
                  );
                })}
              </Route>

              {/* Catch-all route - redirect to root */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;