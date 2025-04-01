// src/modules/properties/components/RecentSearches.tsx
// Version: 1.0.0
// Last Modified: 02-04-2025 17:00 IST
// Purpose: Dropdown showing recent searches with easy access

import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Search, Trash2 } from 'lucide-react';

interface RecentSearchesProps {
  searches: string[];
  onSelect: (query: string) => void;
  onClear: () => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ 
  searches, 
  onSelect,
  onClear
}) => {
  if (!searches.length) return null;
  
  return (
    <div className="absolute top-[64px] left-0 right-0 z-30 bg-card shadow-lg border-b">
      <div className="container py-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Recent Searches</span>
          </h3>
          <Button
            variant="ghost"
            size="sm"
           className="h-7 text-xs"
           onClick={onClear}
         >
           <Trash2 className="h-3.5 w-3.5 mr-1" />
           <span>Clear History</span>
         </Button>
       </div>
       
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pb-2">
         {searches.map((search, index) => (
           <Button
             key={index}
             variant="ghost"
             size="sm"
             className="justify-start text-left h-8 overflow-hidden"
             onClick={() => onSelect(search)}
           >
             <Search className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-muted-foreground" />
             <span className="truncate">{search}</span>
           </Button>
         ))}
       </div>
     </div>
   </div>
 );
};

export default RecentSearches;