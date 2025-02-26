// src/modules/owner/index.ts (or index.tsx)
// Version: 1.1.0
// Last Modified: 26-02-2025 18:00 IST

export { ownerRoutes } from './routes';
export { propertyService } from './services/propertyService';
export { usePropertyOwner } from './hooks/usePropertyOwner';

// Export pages directly - make sure these imports are correct
export { default as Dashboard } from './pages/Dashboard';
export { default as Properties } from './pages/Properties';
export { default as PropertyDetails } from './pages/PropertyDetails';
export { default as PropertyPreview } from './pages/PropertyPreview';
export { default as EditProperty } from './pages/EditProperty';
export { default as ListYourProperty } from './pages/ListYourProperty';
export { default as AddProperty } from './pages/AddProperty';

// Export components
export { PropertyList } from './components/property/PropertyList';
export { PropertyCard } from './components/property/PropertyCard';
export { HowItWorks } from './components/property/HowItWorks';
export { default as ImageGallery } from './components/property/ImageGallery';
export { StatsGrid } from './components/dashboard/StatsGrid';
export { RecentActivity } from './components/dashboard/RecentActivity';
export { StatCard } from './components/dashboard/StatCard';