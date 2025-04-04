// src/modules/seeker/routes.tsx
// Version: 1.1.0
// Last Modified: 05-04-2025 14:45 IST
// Purpose: Add AllProperties route to the Seeker module

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import BrowseProperties from './pages/BrowseProperties';
import PropertyDetailPage from './pages/PropertyDetailPage';
import AllProperties from './pages/AllProperties';

/**
 * Seeker Module Routes
 * Defines the routes for the property seeker functionality
 */
const SeekerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<BrowseProperties />} />
      <Route path="/property/:id" element={<PropertyDetailPage />} />
      <Route path="/allproperties" element={<AllProperties />} />
    </Routes>
  );
};

export default SeekerRoutes;