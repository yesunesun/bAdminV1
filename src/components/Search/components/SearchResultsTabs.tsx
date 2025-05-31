// src/components/Search/components/SearchResultsTabs.tsx
// Version: 1.0.0
// Last Modified: 01-06-2025 17:00 IST
// Purpose: Tab switcher for Table and Card views

import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, Grid3X3 } from 'lucide-react';

export type ViewMode = 'table' | 'cards';

interface SearchResultsTabsProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  resultsCount: number;
}

const SearchResultsTabs: React.FC<SearchResultsTabsProps> = ({
  activeView,
  onViewChange,
  resultsCount
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
      {/* Results count */}
      <div className="text-sm text-slate-600">
        {resultsCount > 0 ? (
          <span>{resultsCount} properties found</span>
        ) : (
          <span>No properties found</span>
        )}
      </div>

      {/* View toggle buttons */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
        <Button
          variant={activeView === 'table' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('table')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors ${
            activeView === 'table'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Table className="h-4 w-4" />
          Table
        </Button>
        
        <Button
          variant={activeView === 'cards' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('cards')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors ${
            activeView === 'cards'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Grid3X3 className="h-4 w-4" />
          Cards
        </Button>
      </div>
    </div>
  );
};

export default SearchResultsTabs;