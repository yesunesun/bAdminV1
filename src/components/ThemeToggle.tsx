import React from 'react';
import { Sunset, Waves } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme(theme === 'ocean' ? 'sunset' : 'ocean')}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
          "transition-colors duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          theme === 'ocean' ? "text-primary" : "text-foreground"
        )}
      >
        {theme === 'ocean' ? (
          <>
            <Waves className="h-4 w-4" />
            Ocean Breeze
          </>
        ) : (
          <>
            <Sunset className="h-4 w-4" />
            Sunset Glow
          </>
        )}
      </button>
    </div>
  );
}