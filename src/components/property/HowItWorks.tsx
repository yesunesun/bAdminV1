// src/components/property/HowItWorks.tsx
// Version: 1.0.0
// Created: 06-02-2025 19:00 IST

import React from 'react';
import { Home, ClipboardCheck, Image, Rocket, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onStartListing?: () => void;
  showCTA?: boolean;
  className?: string;
}

export function HowItWorks({ onStartListing, showCTA = true, className }: HowItWorksProps) {
  const steps = [
    {
      icon: <Home className="w-8 h-8" />,
      title: "Choose Property Type",
      description: "Select your property category and listing type",
      color: "bg-blue-50",
      numberBg: "bg-blue-600"
    },
    {
      icon: <ClipboardCheck className="w-8 h-8" />,
      title: "Add Details",
      description: "Fill in your property specifications and features",
      color: "bg-purple-50",
      numberBg: "bg-purple-600"
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: "Upload Photos",
      description: "Add high-quality images to showcase your property",
      color: "bg-indigo-50",
      numberBg: "bg-indigo-600"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Go Live",
      description: "Your listing goes live instantly after verification",
      color: "bg-teal-50",
      numberBg: "bg-teal-600"
    }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* Top Section with Steps */}
      <div className="p-8">
        <h3 className="text-2xl font-semibold text-slate-800 text-center mb-12">
          How It Works
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-[2px] bg-gradient-to-r from-slate-200 to-slate-300">
                  <ArrowRight className="absolute -right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                </div>
              )}
              
              {/* Step Content */}
              <div className="relative flex flex-col items-center text-center space-y-4">
                {/* Step Number and Icon Container */}
                <div className="relative">
                  {/* Step Number */}
                  <div className={`absolute -top-2 -right-2 w-8 h-8 ${step.numberBg} rounded-full flex items-center justify-center z-20 shadow-lg ring-2 ring-white`}>
                    <span className="text-white font-semibold">{index + 1}</span>
                  </div>
                  
                  {/* Icon Circle */}
                  <div className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center text-slate-700 relative z-10 shadow-md`}>
                    {step.icon}
                  </div>
                </div>
                
                {/* Text Content */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">{step.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Section */}
      {showCTA && (
        <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 p-8 text-center">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">
            Ready to List Your Property?
          </h3>
          <p className="text-slate-600 max-w-2xl mx-auto mb-6">
            Join our growing community of property owners and connect with genuine buyers and tenants. 
            Our platform ensures a seamless listing experience with maximum visibility.
          </p>
          <button
            onClick={onStartListing}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200"
          >
            Start Listing
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}