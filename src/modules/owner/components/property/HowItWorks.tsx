// src/modules/owner/components/property/HowItWorks.tsx
// Version: 2.0.0
// Last Modified: 26-02-2025 17:30 IST
// Purpose: Informational component for new property owners

import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Image, Check } from 'lucide-react';
import { HowItWorksProps } from './types';

export function HowItWorks({ onStartListing, showCTA = true, className = '' }: HowItWorksProps) {
  const steps = [
    {
      icon: FileText,
      title: "Add property details",
      description: "Enter information about your property type, location, amenities, and pricing."
    },
    {
      icon: Image,
      title: "Upload photos",
      description: "Add high-quality images of your property to attract potential tenants or buyers."
    },
    {
      icon: Check,
      title: "Publish your listing",
      description: "Review your property details and publish it to make it visible to users."
    }
  ];

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">How to List Your Property</h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Create attractive listings for your properties in just a few simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="bg-white rounded-lg p-5 shadow transition-all hover:shadow-md">
            <div className="bg-primary/10 text-primary p-3 inline-flex rounded-full mb-4">
              <step.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-gray-600 text-sm">{step.description}</p>
          </div>
        ))}
      </div>

      {showCTA && (
        <div className="mt-8 text-center">
          {onStartListing ? (
            <button
              onClick={onStartListing}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Start Listing Your Property
            </button>
          ) : (
            <Link
              to="/properties/list"
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Start Listing Your Property
            </Link>
          )}
        </div>
      )}
    </div>
  );
}