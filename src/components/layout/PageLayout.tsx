// src/components/layout/PageLayout.tsx
// Version: 1.0.0
// Last Modified: 04-02-2025 10:30 IST

import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  fullWidth?: boolean;
}

const PageLayout = ({ 
  children, 
  title, 
  actions,
  fullWidth = false 
}: PageLayoutProps) => {
  return (
    <div className={`min-h-[calc(100vh-4rem)] bg-gray-50 ${fullWidth ? '' : 'py-8'}`}>
      <div className={`${fullWidth ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
        {(title || actions) && (
          <div className="flex justify-between items-center mb-8">
            {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
            {actions && <div className="flex space-x-4">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageLayout;