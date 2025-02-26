// src/routes/mainRoutes.tsx
// Version: 9.0.0
// Last Modified: 28-02-2025 13:15 IST
// Purpose: Routes with minimal changes to use owner module components

import React from 'react';
import { Navigate } from 'react-router-dom';
// Import from the owner module
import Dashboard from '../modules/owner/pages/Dashboard';
import Properties from '../modules/owner/pages/Properties';
import PropertyDetails from '../modules/owner/pages/PropertyDetails';
import PropertyPreview from '../modules/owner/pages/PropertyPreview';
import EditProperty from '../modules/owner/pages/EditProperty';
import ListYourProperty from '../modules/owner/pages/ListYourProperty';

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
  { path: '/', element: <Navigate to="/dashboard" replace /> }
];