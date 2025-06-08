// src/components/ui/CopyButton.tsx
// Version: 1.0.0
// Last Modified: 25-05-2025 19:15 IST
// Purpose: Reusable copy to clipboard component with icon and toast feedback

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showSuccessIcon?: boolean;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  label,
  className,
  size = 'sm',
  variant = 'ghost',
  showSuccessIcon = true
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!value || value.trim() === '') {
      toast({
        title: "Copy failed",
        description: "No value to copy",
        variant: "destructive"
      });
      return;
    }

    try {
      // Modern browsers
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('Fallback copy failed');
        }
      }

      // Success feedback
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);

      toast({
        title: "Copied to clipboard",
        description: label ? `${label} copied successfully` : "Value copied successfully",
      });

    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try selecting and copying manually.",
        variant: "destructive"
      });
    }
  };

  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleCopy}
      className={cn(
        'p-1 transition-colors',
        buttonSize,
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        isCopied && showSuccessIcon && 'text-green-600 dark:text-green-400',
        className
      )}
      title={label ? `Copy ${label}` : 'Copy to clipboard'}
      aria-label={label ? `Copy ${label}` : 'Copy to clipboard'}
    >
      {isCopied && showSuccessIcon ? (
        <Check className={cn(iconSize, 'text-green-600 dark:text-green-400')} />
      ) : (
        <Copy className={cn(iconSize, 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300')} />
      )}
    </Button>
  );
};

export default CopyButton;