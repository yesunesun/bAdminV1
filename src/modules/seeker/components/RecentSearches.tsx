// src/modules/seeker/components/RecentSearches.tsx
// Version: 1.0.0
// Last Modified: 03-04-2025 12:35 IST
// Purpose: Migrated from properties module to seeker module

import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, Search } from 'lucide-react';

interface RecentSearchesProps {
  searches: string[];
  onSelect: (search: string) => void;
  onClear: () => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ searches, onSelect, onClear }) => {
  if (searches.length === 0) {
    return null;
  }
  
  return (
    <div className="absolute left-0 right-0 top-[calc(100%+1px)] z-50 container">
      <div className="bg-card border rounded-md shadow-md overflow-hidden max-h-72 overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>Recent Searches</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs hover:text-destructive"
            onClick={onClear}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        </div>
        
        <ul className="py-1">
          {searches.map((search, index) => (
            <li key={index}>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm px-3 py-2 h-9 rounded-none"
                onClick={() => onSelect(search)}
              >
                <Search className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {search}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecentSearches;