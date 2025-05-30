// src/App.tsx 
// Version: 9.4.0
// Last Modified: 01-06-2025 14:30 IST
// Purpose: Added search page route to SeekerLayout

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { FlowProvider } from './contexts/FlowContext';
import { Header, BrandLogo } from '@/components/Header';
import { useAdminAccess } from './modules/admin/hooks/useAdminAccess';
import FavoritesDrawer from '@/modules/seeker/components/FavoritesDrawer';
import Footer from '@/components/Footer';

// Import components directly
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PropertyMapHome from './modules/seeker';
import Dashboard from './modules/owner/pages/Dashboard';
import Properties from './modules/owner/pages/Properties';
import PropertyDetails from './modules/owner/pages/PropertyDetails';
import PropertyPreview from './modules/owner/pages/PropertyPreview';
import EditProperty from './modules/owner/pages/EditProperty';
import ListYourProperty from './modules/owner/pages/ListYourProperty';
import BrowseProperties from './modules/seeker/pages/BrowseProperties';
import PropertyDetailPage from './modules/seeker/pages/PropertyDetailPage';
import AllProperties from './modules/seeker/pages/AllProperties/index';

// Route Configurations
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
  
  if (!isPropertyModerator && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
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

// Main app layout with Header - used for property owner management routes
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

// Standardized Seeker layout - FIXED: Now handles property wizard too
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
          <FlowProvider>
            <div className="min-h-screen bg-background">
              <Routes>
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

                {/* FIXED: SeekerLayout with proper property wizard routes */}
                <Route element={<SeekerLayout />}>
                  <Route 
                    path="/" 
                    element={
                      <PublicOrProtectedRoute>
                        <PropertyMapHome />
                      </PublicOrProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/home" 
                    element={
                      <PublicOrProtectedRoute>
                        <HomePage />
                      </PublicOrProtectedRoute>
                    } 
                  />
                  
                  {/* NEW: Search Page Route */}
                  <Route 
                    path="/search" 
                    element={
                      <PublicOrProtectedRoute>
                        <SearchPage />
                      </PublicOrProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/browse" 
                    element={
                      <PublicOrProtectedRoute>
                        <BrowseProperties />
                      </PublicOrProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/allproperties" 
                    element={
                      <PublicOrProtectedRoute>
                        <AllProperties />
                      </PublicOrProtectedRoute>
                    } 
                  />
                  
                  {/* Seeker routes */}
                  <Route path="/seeker">
                    <Route 
                      index
                      element={
                        <PublicOrProtectedRoute>
                          <PropertyMapHome />
                        </PublicOrProtectedRoute>
                      } 
                    />
                    <Route 
                      path="property/:id" 
                      element={
                        <PublicOrProtectedRoute>
                          <PropertyDetailPage />
                        </PublicOrProtectedRoute>
                      } 
                    />
                    <Route 
                      path="allproperties" 
                      element={
                        <PublicOrProtectedRoute>
                          <AllProperties />
                        </PublicOrProtectedRoute>
                      } 
                    />
                  </Route>
                  
                  {/* FIXED: Property listing wizard routes - now in SeekerLayout with proper parameter handling */}
                  <Route 
                    path="/properties/list" 
                    element={
                      <PublicOrProtectedRoute>
                        <ListYourProperty />
                      </PublicOrProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/properties/list/:category/:type" 
                    element={
                      <PublicOrProtectedRoute>
                        <ListYourProperty />
                      </PublicOrProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/properties/list/:category/:type/:step" 
                    element={
                      <PublicOrProtectedRoute>
                        <ListYourProperty />
                      </PublicOrProtectedRoute>
                    } 
                  />
                  
                  {/* Property detail pages for seekers */}
                  <Route 
                    path="/properties/:id" 
                    element={
                      <PublicOrProtectedRoute>
                        <PropertyDetailPage />
                      </PublicOrProtectedRoute>
                    } 
                  />
                </Route>

                {/* Owner/Property Management Routes with AppLayout */}
                <Route element={<AppLayout />}>
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
                  
                  {/* Property management routes */}
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
                </Route>

                {/* Catch-all route - redirect to root */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </FlowProvider>
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;