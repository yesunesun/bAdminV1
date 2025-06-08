// src/modules/owner/components/property/wizard/sections/PropertySummary/types.ts
// Version: 2.0.0
// Last Modified: 14-05-2025 17:10 IST
// Purpose: Extended type definitions for PropertySummary module

import { FormData } from '../types';
import { ReactNode } from 'react';

export interface PropertySummaryProps {
  formData: FormData;
  onPrevious: () => void;
  onSaveAsDraft: () => Promise<string>;
  onSaveAndPublish: () => Promise<string>;
  onUpdate: () => Promise<void>;
  saving: boolean;
  status?: 'draft' | 'published';
  propertyId?: string;
}

export interface SummarySectionProps {
  title: string;
  icon: React.ReactNode;
  items?: SummaryItem[];
  children?: ReactNode;
}

export interface SummaryItem {
  label: string;
  value?: string | number | boolean | string[];
}

export interface StepIds {
  basicDetails?: string;
  location?: string;
  rental?: string;
  saleDetails?: string;
  features?: string;
  flatmateDetails?: string;
  pgDetails?: string;
  coworkingDetails?: string;
  landFeatures?: string;
}

export interface PropertyDerivedValues {
  flowInfo: string;
  coordinates: string;
  fullAddress: string;
}

export interface SectionComponentProps {
  data: any;
  flowType?: string;
  listingType?: string;
}