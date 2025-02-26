// src/modules/seeker/components/Search/SearchBar.tsx
// Version: 1.0.0
// Last Modified: 26-02-2025 15:20 IST
// Purpose: Search input for property search

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  initialValue = '', 
  onSearch, 
  placeholder = 'Search by location, property name, or description' 
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full">
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        className="pr-16 rounded-r-none focus-visible:ring-2"
      />
      <Button 
        type="submit" 
        variant="default" 
        className="rounded-l-none"
      >
        <SearchIcon className="h-4 w-4 mr-2" />
        <span>Search</span>
      </Button>
    </form>
  );
};

export default SearchBar;