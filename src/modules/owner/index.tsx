// src/modules/owner/index.tsx
// Version: 2.0.0
// Last Modified: 27-02-2025 01:15 IST
// Purpose: Updated owner module index with PropertyForm exports

import { ownerRoutes } from './routes';
import { propertyService } from './services/propertyService';
import { usePropertyOwner } from './hooks/usePropertyOwner';

// Export routes and services
export {
  ownerRoutes,
  propertyService,
  usePropertyOwner
};

// Export components
export { PropertyList } from './components/property/PropertyList';
export { PropertyCard } from './components/property/PropertyCard';
export { HowItWorks } from './components/property/HowItWorks';
export { default as ImageGallery } from './components/property/ImageGallery';
export { StatsGrid } from './components/dashboard/StatsGrid';
export { RecentActivity } from './components/dashboard/RecentActivity';
export { StatCard } from './components/dashboard/StatCard';
export { PropertyForm } from './components/property/wizard/PropertyForm';

// Export types
export { Property, FormData } from './components/property/PropertyFormTypes';

// Export pages
export { default as Dashboard } from './pages/Dashboard';
export { default as Properties } from './pages/Properties';
export { default as PropertyDetails } from './pages/PropertyDetails';
export { default as PropertyPreview } from './pages/PropertyPreview';
export { default as EditProperty } from './pages/EditProperty';
export { default as ListYourProperty } from './pages/ListYourProperty';
export { default as AddProperty } from './pages/AddProperty';