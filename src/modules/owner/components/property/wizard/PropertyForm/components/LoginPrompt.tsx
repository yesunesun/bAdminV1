// src/modules/owner/components/property/wizard/PropertyForm/components/LoginPrompt.tsx
// Version: 1.0.0
// Last Modified: 07-03-2025 16:30 IST
// Purpose: Login prompt component for unauthorized users

import React from 'react';
import { cn } from '@/lib/utils';

interface LoginPromptProps {
  onLoginClick: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onLoginClick }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <div className="bg-card p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You must be logged in to create a property listing.</p>
          <button
            onClick={onLoginClick}
            className={cn(
              "w-full py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            )}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;