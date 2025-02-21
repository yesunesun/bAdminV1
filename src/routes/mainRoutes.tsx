// src/routes/mainRoutes.tsx
// Version: 1.0.0
// Last Modified: 20-02-2025 15:00 IST

import { Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Properties from '@/pages/Properties';
import PropertyDetails from '@/pages/PropertyDetails';
import PropertyPreview from '@/pages/PropertyPreview';
import EditProperty from '@/pages/EditProperty';
import ListYourProperty from '@/pages/ListYourProperty';

export const mainRoutes = [
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