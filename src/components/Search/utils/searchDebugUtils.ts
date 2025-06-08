// src/components/Search/utils/searchDebugUtils.ts
// Version: 1.0.0
// Last Modified: 01-06-2025 17:45 IST
// Purpose: Debug utilities for monitoring database search integration

import { SearchFilters, SearchResult } from '../types/search.types';

/**
 * Log search parameters in a readable format
 */
export const logSearchParams = (filters: SearchFilters, dbParams: Record<string, any>) => {
  console.group('🔍 Search Debug Info');
  
  console.log('📋 Frontend Filters:', {
    searchQuery: filters.searchQuery || 'None',
    location: filters.selectedLocation || 'Any',
    transactionType: filters.transactionType || 'Any',
    propertyType: filters.selectedPropertyType || 'Any',
    subType: filters.selectedSubType || 'Any',
    bhk: filters.selectedBHK || 'Any',
    priceRange: filters.selectedPriceRange || 'Any'
  });
  
  console.log('🗄️ Database Parameters:', dbParams);
  
  console.groupEnd();
};

/**
 * Log search results summary
 */
export const logSearchResults = (results: SearchResult[], totalCount: number, timing: number) => {
  console.group('✅ Search Results Summary');
  
  console.log(`📊 Results: ${results.length} shown, ${totalCount} total`);
  console.log(`⏱️ Query Time: ${timing}ms`);
  
  if (results.length > 0) {
    console.log('🏠 Property Types:', 
      [...new Set(results.map(r => r.propertyType))].join(', ')
    );
    console.log('💰 Price Range:', 
      `₹${Math.min(...results.map(r => r.price)).toLocaleString()} - ₹${Math.max(...results.map(r => r.price)).toLocaleString()}`
    );
    console.log('📍 Locations:', 
      [...new Set(results.map(r => r.location))].slice(0, 3).join(', ')
    );
  }
  
  console.groupEnd();
};

/**
 * Log search errors with context
 */
export const logSearchError = (error: any, filters: SearchFilters, dbParams: Record<string, any>) => {
  console.group('❌ Search Error');
  
  console.error('Error Details:', error);
  console.log('Frontend Filters:', filters);
  console.log('Database Parameters:', dbParams);
  
  console.groupEnd();
};

/**
 * Validate database search function parameters
 */
export const validateSearchParams = (params: Record<string, any>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required parameters
  if (params.p_limit && (params.p_limit < 1 || params.p_limit > 1000)) {
    errors.push('p_limit must be between 1 and 1000');
  }
  
  if (params.p_offset && params.p_offset < 0) {
    errors.push('p_offset must be non-negative');
  }
  
  if (params.p_sort_by && !['created_at', 'price', 'area', 'title'].includes(params.p_sort_by)) {
    errors.push('p_sort_by must be one of: created_at, price, area, title');
  }
  
  if (params.p_sort_order && !['ASC', 'DESC'].includes(params.p_sort_order)) {
    errors.push('p_sort_order must be ASC or DESC');
  }
  
  // Check price range
  if (params.p_min_price && params.p_max_price && params.p_min_price > params.p_max_price) {
    errors.push('p_min_price cannot be greater than p_max_price');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format database result for logging
 */
export const formatDbResultForLog = (dbResult: any) => {
  return {
    id: dbResult.id,
    title: dbResult.title,
    propertyType: dbResult.property_type,
    flowType: dbResult.flow_type,
    price: `₹${dbResult.price?.toLocaleString() || 0}`,
    location: `${dbResult.city || 'Unknown'}, ${dbResult.state || 'Unknown'}`,
    area: `${dbResult.area || 0} ${dbResult.area_unit || 'sq ft'}`,
    bedrooms: dbResult.bedrooms || 'N/A',
    owner: dbResult.owner_email || 'Unknown'
  };
};

/**
 * Monitor search performance
 */
export class SearchPerformanceMonitor {
  private startTime: number = 0;
  private searchId: string = '';
  
  start(filters: SearchFilters): string {
    this.searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = performance.now();
    
    console.log(`🚀 Starting search ${this.searchId}`, {
      timestamp: new Date().toISOString(),
      filters: this.summarizeFilters(filters)
    });
    
    return this.searchId;
  }
  
  end(resultCount: number, totalCount: number): number {
    const duration = performance.now() - this.startTime;
    
    console.log(`🏁 Search ${this.searchId} completed`, {
      duration: `${duration.toFixed(2)}ms`,
      resultCount,
      totalCount,
      performance: this.getPerformanceRating(duration)
    });
    
    return duration;
  }
  
  error(error: any): void {
    const duration = performance.now() - this.startTime;
    
    console.error(`💥 Search ${this.searchId} failed after ${duration.toFixed(2)}ms`, error);
  }
  
  private summarizeFilters(filters: SearchFilters): string {
    const parts = [];
    if (filters.searchQuery) parts.push(`query:"${filters.searchQuery}"`);
    if (filters.selectedLocation && filters.selectedLocation !== 'any') parts.push(`location:${filters.selectedLocation}`);
    if (filters.selectedPropertyType && filters.selectedPropertyType !== 'any') parts.push(`type:${filters.selectedPropertyType}`);
    if (filters.transactionType) parts.push(`transaction:${filters.transactionType}`);
    
    return parts.join(', ') || 'no filters';
  }
  
  private getPerformanceRating(duration: number): string {
    if (duration < 500) return '⚡ Excellent';
    if (duration < 1000) return '✅ Good';
    if (duration < 2000) return '⚠️ Acceptable';
    return '🐌 Slow';
  }
}

/**
 * Create a reusable performance monitor instance
 */
export const searchPerformanceMonitor = new SearchPerformanceMonitor();