// src/modules/seeker/routes.tsx
// Version: 1.0.0
// Last Modified: 26-02-2025 14:45 IST
// Purpose: Define routes for the Seeker module

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import BrowseProperties from './pages/BrowseProperties';
import PropertyDetailPage from './pages/PropertyDetailPage';

/**
 * Seeker Module Routes
 * Defines the routes for the property seeker functionality
 */
const SeekerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<BrowseProperties />} />
      <Route path="/property/:id" element={<PropertyDetailPage />} />
    </Routes>
  );
};

export default SeekerRoutes;