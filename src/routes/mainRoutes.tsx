// src/routes/mainRoutes.tsx
// Version: 12.0.0
// Last Modified: 25-05-2025 21:30 IST
// Purpose: Fixed property listing routes to work with FlowContext

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
import BrowseProperties from '../modules/seeker/pages/BrowseProperties';
import PropertyDetailPage from '../modules/seeker/pages/PropertyDetailPage';
import AllProperties from '../modules/seeker/pages/AllProperties/index';
// Import our HomePage component
import HomePage from '../pages/HomePage';

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
      { index: true, element: <BrowseProperties /> },
      { path: 'property/:id', element: <PropertyDetailPage /> },
      { path: 'allproperties', element: <AllProperties /> }
    ]
  },
  // Add the new browse route
  { path: '/browse', element: <BrowseProperties /> },
  // Add direct route to AllProperties
  { path: '/allproperties', element: <AllProperties /> },
  // Keep existing HomePage at /home path unchanged
  { path: '/home', element: <HomePage /> },
  // Add explicit handler for root path to avoid unexpected redirects
  { path: '/', element: <Navigate to="/home" replace /> }
];