// src/components/layout/PageLayout.tsx
// Version: 1.6.0
// Last Modified: 04-04-2025 13:00 IST
// Purpose: Added Footer component to page layout

import React from 'react';
import Footer from '@/components/Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  fullWidth?: boolean;
  contentClass?: string;
}

const PageLayout = ({ 
  children, 
  title, 
  subtitle,
  actions,
  fullWidth = false,
  contentClass = ''
}: PageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className={`flex-grow bg-background ${fullWidth ? '' : 'py-8 md:py-12'}`}>
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
      </div>
      <Footer />
    </div>
  );
};

export default PageLayout;