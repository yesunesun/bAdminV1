// src/components/property/wizard/sections/PropertySelectionSection.tsx
// Version: 1.0.0
// Created: 06-02-2025 19:00 IST

import React from 'react';
import { Building2, Home, Trees } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PropertyTypeFormData } from '../types';
import { UseFormReturn } from 'react-hook-form';
import { FormSection } from '@/components/FormSection';

const propertyCategories = [
  {
    id: 'residential',
    title: 'Residential',
    icon: Home,
    listingTypes: ['Rent', 'Resale', 'PG/Hostel', 'Flatmates']
  },
  {
    id: 'commercial',
    title: 'Commercial',
    icon: Building2,
    listingTypes: ['Rent', 'Sale', 'Coworking']
  },
  {
    id: 'land',
    title: 'Land/Plot',
    icon: Trees,
    listingTypes: ['Sale']
  }
];

interface PropertySelectionSectionProps {
  form: UseFormReturn<PropertyTypeFormData>;
}

export function PropertySelectionSection({ form }: PropertySelectionSectionProps) {
  const { watch, setValue } = form;
  const selectedCategory = watch('propertyType');
  const selectedListingType = watch('listingType');
  const selectedCategoryData = propertyCategories.find(cat => cat.id === selectedCategory);

  return (
    <FormSection
      title="Property Type Selection"
      description="Choose the type of property you want to list"
    >
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-slate-600 font-medium">Property Type</p>
          <div className="grid grid-cols-3 gap-3">
            {propertyCategories.map(category => (
              <button
                type="button"
                key={category.id}
                onClick={() => {
                  setValue('propertyType', category.id);
                  setValue('listingType', '');
                }}
                className={cn(
                  "flex flex-col items-center p-4 rounded-lg border transition-all",
                  selectedCategory === category.id
                    ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                    : "border-slate-200 hover:border-indigo-200 text-slate-600"
                )}
              >
                <category.icon className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">{category.title}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedCategory && (
          <div>
            <p className="mb-3 text-slate-600 font-medium">Listing Type</p>
            <div className="grid grid-cols-2 gap-3">
              {selectedCategoryData?.listingTypes.map(type => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setValue('listingType', type)}
                  className={cn(
                    "py-3 px-4 rounded-lg border text-center transition-all",
                    selectedListingType === type
                      ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                      : "border-slate-200 hover:border-indigo-200 text-slate-600"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </FormSection>
  );
}