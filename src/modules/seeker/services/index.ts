// src/modules/seeker/services/index.ts
// Version: 1.2.0
// Last Modified: 02-06-2025 14:00 IST
// Purpose: Re-export all seeker services including new similar properties service

// Re-export everything from individual service files
export * from './constants';
export * from './utilityService';
export * from './propertyService';
export * from './favoriteService';
export * from './visitService';
export * from './mapService';
export * from './similarPropertiesService';

// Re-export from seekerService for backward compatibility
export * from './seekerService';