// src/pages/SearchPage.tsx
// Version: 4.0.0
// Last Modified: 01-06-2025 16:00 IST
// Purpose: Clean search page using refactored SearchContainer component

import React from 'react';
import { SearchContainer, SearchFilters } from '@/components/Search';

const SearchPage: React.FC = () => {
  const handleSearch = (filters: SearchFilters) => {
    console.log('Search initiated from SearchPage with:', filters);
    
    // Here you can add additional logic for the SearchPage specifically
    // For example:
    // - Analytics tracking
    // - URL parameter updates
    // - Additional API calls
    // - Navigation logic
  };

  return (
    <SearchContainer 
      onSearch={handleSearch}
      showResults={true}
    />
  );
};

export default SearchPage;