// src/modules/owner/components/property/wizard/constants/landDetails.ts
// Version: 1.0.0
// Last Modified: 10-04-2025 22:45 IST
// Purpose: Constants for Land/Plot Sale property flow

export const LAND_TYPES = [
  'Residential Plot',
  'Commercial Plot',
  'Agricultural Land',
  'Industrial Land',
  'Mixed-use Land'
] as const;

export const PLOT_FACING = [
  'North',
  'South',
  'East',
  'West',
  'North-East',
  'North-West',
  'South-East',
  'South-West',
  'Corner Plot'
] as const;

export const APPROVAL_STATUS = [
  'HMDA Approved',
  'DTCP Approved',
  'Panchayat Approved',
  'Corporation Approved',
  'Unapproved'
] as const;

export const BOUNDARY_TYPES = [
  'Compound Wall',
  'Fencing',
  'No Boundary',
  'Partial Boundary'
] as const;

export const SOIL_TYPES = [
  'Black Soil',
  'Red Soil',
  'Sandy Soil',
  'Clay Soil',
  'Loamy Soil',
  'Rocky Land'
] as const;

export const TOPOGRAPHY_TYPES = [
  'Flat',
  'Sloped',
  'Undulating',
  'Hilltop',
  'Riverside',
  'Lakefront'
] as const;

export const WATER_AVAILABILITY = [
  'Borewell Available',
  'Municipal Water',
  'Water Tanker',
  'Natural Water Source',
  'No Water Source'
] as const;

export const ELECTRICITY_STATUS = [
  'Connection Available',
  'No Connection',
  'Connection Nearby'
] as const;

export const ROAD_CONNECTIVITY = [
  'Tar Road',
  'Concrete Road',
  'Gravel Road',
  'Mud Road',
  'No Direct Road Access'
] as const;

export const DEVELOPMENT_STATUS = [
  'Developed Land',
  'Undeveloped Land',
  'Under Development',
  'Ready for Construction'
] as const;