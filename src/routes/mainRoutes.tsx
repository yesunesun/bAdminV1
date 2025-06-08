// src/routes/mainRoutes.tsx
// Version: 12.1.0
// Last Modified: 02-06-2025 10:40 IST
// Purpose: Made /browse and /explore render the same FindPage component instead of redirects

import React from 'react';
import { Navigate } from 'react-router-dom';
// Import from the owner module
import Dashboard from '../modules/owner/pages/Dashboard';
import Properties from '../modules/owner/pages/Properties';
import PropertyDetails from '../modules/owner/pages/PropertyDetails';
import PropertyPreview from '../modules/owner/pages/PropertyPreview';
import EditProperty from '../modules/owner/pages/EditProperty';
import ListYourProperty from '../modules/owner/pages/ListYourProperty';
// Import from the seeker module
import PropertyDetailPage from '../modules/seeker/pages/PropertyDetailPage';
import AllProperties from '../modules/seeker/pages/AllProperties/index';
// Import our pages
import HomePage from '../pages/HomePage';
import FindPage from '../pages/FindPage';

export const mainRoutes = [
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/properties',
    children: [
      { index: true, element: <Properties /> },
      // Main listing route - handles both selection and wizard
      { path: 'list', element: <ListYourProperty /> },
      // Specific flow routes - all render the same ListYourProperty component
      // The component will detect the flow from URL parameters via FlowContext
      { path: 'list/:category/:type', element: <ListYourProperty /> },
      { path: 'list/:category/:type/:step', element: <ListYourProperty /> },
      // Property management routes
      { path: ':id/preview', element: <PropertyPreview /> },
      { path: ':id/edit', element: <EditProperty /> },
      { path: ':id', element: <PropertyDetails /> }
    ]
  },
  {
    path: '/seeker',
    children: [
      { index: true, element: <FindPage /> }, // Seeker index now uses FindPage
      { path: 'property/:id', element: <PropertyDetailPage /> },
      { path: 'allproperties', element: <AllProperties /> }
    ]
  },
  // Main find page for property search
  { path: '/find', element: <FindPage /> },
  // Browse and explore routes - same functionality as find
  { path: '/browse', element: <FindPage /> },
  { path: '/explore', element: <FindPage /> },
  // Add direct route to AllProperties
  { path: '/allproperties', element: <AllProperties /> },
  // Keep existing HomePage at /home path unchanged
  { path: '/home', element: <HomePage /> },
  // Add explicit handler for root path to avoid unexpected redirects
  { path: '/', element: <Navigate to="/home" replace /> }
];