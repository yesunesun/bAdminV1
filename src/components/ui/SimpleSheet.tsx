// src/components/ui/SimpleSheet.tsx
// Version: 1.0.0
// Last Modified: 26-02-2025 19:00 IST
// Purpose: Very simple sliding panel without dependencies

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleSheetProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  side?: 'left' | 'right';
  title?: string;
}

export const SimpleSheet: React.FC<SimpleSheetProps> = ({
  children,
  trigger,
  side = 'right',
  title
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSheet = () => {
    setIsOpen(!isOpen);
  };

  // Add overflow hidden to body when sheet is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <div onClick={toggleSheet} className="cursor-pointer">
        {trigger}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={toggleSheet}
        />
      )}

      {/* Sheet */}
      <div 
        className={cn(
          "fixed inset-y-0 z-50 bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out",
          side === 'left' 
            ? "left-0 w-3/4 max-w-sm border-r" 
            : "right-0 w-3/4 max-w-sm border-l",
          isOpen 
            ? "transform-none" 
            : side === 'left' 
              ? "-translate-x-full" 
              : "translate-x-full"
        )}
      >
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button 
            onClick={toggleSheet}
            className="p-1 rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div>
          {children}
        </div>
      </div>
    </>
  );
};

export const SimpleSheetTrigger: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ children, onClick }) => {
  return (
    <div onClick={onClick} className="cursor-pointer">
      {children}
    </div>
  );
};