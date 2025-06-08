// src/modules/owner/routes.tsx
// Version: 1.0.0
// Last Modified: 26-02-2025 16:00 IST
// Purpose: Define routes for property owner module

import { Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import PropertyPreview from './pages/PropertyPreview';
import EditProperty from './pages/EditProperty';
import ListYourProperty from './pages/ListYourProperty';
import AddProperty from './pages/AddProperty';

export const ownerRoutes = [
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/properties',
    children: [
      { index: true, element: <Properties /> },
      {
        path: 'list',
        children: [
          { index: true, element: <ListYourProperty /> },
          {
            path: ':category/:type',
            children: [
              { index: true, element: <ListYourProperty /> },
              { path: ':step', element: <ListYourProperty /> }
            ]
          }
        ]
      },
      { path: ':id/preview', element: <PropertyPreview /> },
      { path: ':id/edit', element: <EditProperty /> },
      { path: ':id', element: <PropertyDetails /> }
    ]
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> }
];