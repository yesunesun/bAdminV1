// src/components/ui/Button.tsx
// Version: 1.0.0
// Last Modified: 04-02-2025 12:30 IST

import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon' | 'icon-primary' | 'icon-secondary' | 'icon-danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  href?: string;
  iconPosition?: 'left' | 'right';
}

const variantStyles = {
  primary: 'bg-[#7352FF] hover:bg-[#5e43d8] text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  'icon-primary': 'bg-[#7352FF] hover:bg-[#5e43d8] text-white rounded-full p-2',
  'icon-secondary': 'bg-[#E5E7EB] hover:bg-gray-200 text-[#7352FF] rounded-full p-2',
  'icon-danger': 'bg-red-500 hover:bg-red-600 text-white rounded-full p-2',
  icon: 'bg-transparent hover:bg-gray-100 text-gray-700 rounded-full p-2'
};

const sizeStyles = {
  sm: 'text-sm px-3 py-1',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-6 py-3'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    icon,
    href,
    iconPosition = 'left',
    className = '',
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7352FF] disabled:opacity-50 disabled:cursor-not-allowed';
    const styles = `${baseStyles} ${variantStyles[variant]} ${!variant.includes('icon') ? sizeStyles[size] : ''} ${className}`;

    if (href) {
      return (
        <Link to={href} className={styles}>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={styles}
        {...props}
      >
        {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Predefined Add Property Button
export const AddPropertyButton = () => (
  <Button
    variant="primary"
    href="/properties/add"
    icon={<Plus className="h-5 w-5" />}
  >
    Add Property
  </Button>
);