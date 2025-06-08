// src/components/Search/components/SearchResultsTable.tsx
// Version: 1.0.0
// Last Modified: 01-06-2025 16:30 IST
// Purpose: Table component to display search results in tabular format

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchResult } from '../types/search.types';
import { 
  PROPERTY_TYPES, 
  TRANSACTION_TYPES, 
  BHK_TYPES 
} from '../constants/searchConstants';

interface SearchResultsTableProps {
  results: SearchResult[];
  loading: boolean;
  totalCount: number;
  onViewDetails?: (propertyId: string) => void;
  onContactOwner?: (propertyId: string) => void;
}

const SearchResultsTable: React.FC<SearchResultsTableProps> = ({
  results,
  loading,
  totalCount,
  onViewDetails,
  onContactOwner
}) => {
  const formatPrice = (price: number, transactionType: string) => {
    if (transactionType === 'rent') {
      return `₹${price.toLocaleString('en-IN')}/month`;
    }
    
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else {
      return `₹${price.toLocaleString('en-IN')}`;
    }
  };

  const formatArea = (area: number) => {
    return `${area.toLocaleString('en-IN')} sq ft`;
  };

  const getPropertyTypeLabel = (type: string) => {
    return PROPERTY_TYPES[type]?.label || type;
  };

  const getTransactionTypeLabel = (type: string) => {
    return TRANSACTION_TYPES[type] || type;
  };

  const getBHKLabel = (bhk: string | null) => {
    if (!bhk) return '-';
    return BHK_TYPES[bhk] || bhk;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600">Searching properties...</span>
        </div>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Properties Found</h3>
        <p className="text-slate-600">
          No properties match your current search criteria. Try adjusting your filters.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Results Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h2 className="text-xl font-semibold text-slate-800">
          Search Results ({totalCount} properties found)
        </h2>
      </div>

      {/* Mobile View - Cards */}
      <div className="block lg:hidden">
        <div className="divide-y divide-slate-200">
          {results.map((property) => (
            <div key={property.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                  {property.title}
                </h3>
                <span className="text-sm font-medium text-blue-600 ml-2">
                  {formatPrice(property.price, property.transactionType)}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-slate-600">
                <p><span className="font-medium">Location:</span> {property.location}</p>
                <p><span className="font-medium">Type:</span> {getPropertyTypeLabel(property.propertyType)} • {getTransactionTypeLabel(property.transactionType)}</p>
                {property.bhk && <p><span className="font-medium">BHK:</span> {getBHKLabel(property.bhk)}</p>}
                <p><span className="font-medium">Area:</span> {formatArea(property.area)}</p>
                <p><span className="font-medium">Owner:</span> {property.ownerName}</p>
                <p><span className="font-medium">Posted:</span> {formatDate(property.createdAt)}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onViewDetails?.(property.id)}
                  className="flex-1"
                >
                  View Details
                </Button>
                <Button 
                  size="sm"
                  onClick={() => onContactOwner?.(property.id)}
                  className="flex-1"
                >
                  Contact Owner
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 font-semibold text-slate-900">Property</th>
              <th className="text-left p-4 font-semibold text-slate-900">Location</th>
              <th className="text-left p-4 font-semibold text-slate-900">Type</th>
              <th className="text-left p-4 font-semibold text-slate-900">BHK</th>
              <th className="text-left p-4 font-semibold text-slate-900">Area</th>
              <th className="text-left p-4 font-semibold text-slate-900">Price</th>
              <th className="text-left p-4 font-semibold text-slate-900">Owner</th>
              <th className="text-left p-4 font-semibold text-slate-900">Posted</th>
              <th className="text-left p-4 font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {results.map((property) => (
              <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                      {property.title}
                    </h3>
                    <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {getTransactionTypeLabel(property.transactionType)}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {property.location}
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {getPropertyTypeLabel(property.propertyType)}
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {getBHKLabel(property.bhk)}
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {formatArea(property.area)}
                </td>
                <td className="p-4">
                  <span className="font-semibold text-slate-900">
                    {formatPrice(property.price, property.transactionType)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    <p className="font-medium text-slate-900">{property.ownerName}</p>
                    <p className="text-slate-500">{property.ownerPhone}</p>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {formatDate(property.createdAt)}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewDetails?.(property.id)}
                    >
                      View
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => onContactOwner?.(property.id)}
                    >
                      Contact
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default SearchResultsTable;