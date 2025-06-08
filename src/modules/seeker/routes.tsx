// src/modules/seeker/routes.tsx
// Version: 1.2.0
// Last Modified: 02-06-2025 10:40 IST
// Purpose: Updated seeker routes to use FindPage instead of BrowseProperties

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PropertyDetailPage from './pages/PropertyDetailPage';
import AllProperties from './pages/AllProperties';
import FindPage from '../../pages/FindPage';

/**
 * Seeker Module Routes
 * Defines the routes for the property seeker functionality
 * Note: Now uses FindPage for the main seeker interface
 */
const SeekerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<FindPage />} />
      <Route path="/property/:id" element={<PropertyDetailPage />} />
      <Route path="/allproperties" element={<AllProperties />} />
    </Routes>
  );
};

export default SeekerRoutes;