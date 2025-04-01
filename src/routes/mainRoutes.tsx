// src/routes/mainRoutes.tsx
// Version: 11.1.0
// Last Modified: 01-04-2025 10:00 IST
// Purpose: Routes with added home page navigation hub and moving HomePage to /home

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
// Import our new HomePage component
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
      { path: 'list', element: <ListYourProperty /> },
      { path: 'list/:category/:type', element: <ListYourProperty /> },
      { path: 'list/:category/:type/:step', element: <ListYourProperty /> },
      { path: ':id/preview', element: <PropertyPreview /> },
      { path: ':id/edit', element: <EditProperty /> },
      { path: ':id', element: <PropertyDetails /> }
    ]
  },
  {
    path: '/seeker',
    children: [
      { index: true, element: <BrowseProperties /> },
      { path: 'property/:id', element: <PropertyDetailPage /> }
    ]
  },
  // Move HomePage to /home path
  { path: '/home', element: <HomePage /> },
  // Root path will be defined directly in App.tsx with a simple message
]