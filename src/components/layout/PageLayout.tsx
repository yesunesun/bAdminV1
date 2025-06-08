// src/components/layout/PageLayout.tsx
// Version: 1.7.0
// Last Modified: 05-04-2025 21:15 IST
// Purpose: Added support for 80% width layout for Seeker pages

import React from 'react';
import Footer from '@/components/Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  fullWidth?: boolean;
  contentClass?: string;
  isSeeker?: boolean; // New prop to indicate Seeker module
}

const PageLayout = ({ 
  children, 
  title, 
  subtitle,
  actions,
  fullWidth = false,
  contentClass = '',
  isSeeker = false // Default to false
}: PageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className={`flex-grow bg-background ${fullWidth ? '' : 'py-8 md:py-12'}`}>
        {isSeeker ? (
          // Seeker layout with 80% width
          <div className="w-full">
            <div className="w-4/5 mx-auto p-4">
              {(title || actions) && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                  <div>
                    {title && <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>}
                    {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
                  </div>
                  {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
                </div>
              )}
              <div className={contentClass}>
                {children}
              </div>
            </div>
          </div>
        ) : (
          // Original layout
          <div className={`${fullWidth ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
            {(title || actions) && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                <div>
                  {title && <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>}
                  {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
                </div>
                {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
              </div>
            )}
            <div className={contentClass}>
              {children}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PageLayout;