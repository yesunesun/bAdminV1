// src/components/layout/PageLayout.tsx
// Version: 1.5.0
// Last Modified: 04-04-2025 11:30 IST
// Purpose: Updated to use theme variables and improved responsive behavior

import React from 'react';

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
    <div className={`min-h-[calc(100vh-4rem)] bg-background ${fullWidth ? '' : 'py-8 md:py-12'}`}>
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
  );
};

export default PageLayout;