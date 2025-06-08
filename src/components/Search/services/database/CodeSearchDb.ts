// src/components/Search/services/database/CodeSearchDb.ts
// Version: 1.0.0
// Last Modified: 02-06-2025 16:35 IST
// Purpose: Property code search database class

import { supabase } from '@/lib/supabase';
import { DatabaseSearchResult } from '../searchService/types/searchService.types';

/**
 * Property code search database class
 * Handles all 6-character property code search operations
 */
export class CodeSearchDb {
  /**
   * Search property by exact code using search_property_by_code SQL function
   */
  async searchByCode(code: string): Promise<DatabaseSearchResult[]> {
    console.log('🏷️ Code Database: Searching by exact code:', code);
    
    // Validate input
    if (!code || code.trim() === '') {
      throw new Error('Property code cannot be empty');
    }

    const trimmedCode = code.trim();
    
    try {
      const { data, error } = await supabase.rpc('search_property_by_code', {
        p_code: trimmedCode
      });
      
      if (error) {
        console.error('❌ search_property_by_code error:', error);
        throw new Error(`Failed to search property by code: ${error.message}`);
      }
      
      const results = data || [];
      console.log(`✅ Code Database: Found ${results.length} results for code: ${trimmedCode}`);
      return results;
      
    } catch (error) {
      console.error('❌ CodeSearchDb.searchByCode error:', error);
      throw new Error(`Database error while searching by code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search property by code (case insensitive) using search_property_by_code_insensitive SQL function
   */
  async searchByCodeInsensitive(code: string): Promise<DatabaseSearchResult[]> {
    console.log('🏷️ Code Database: Searching by case-insensitive code:', code);
    
    // Validate input
    if (!code || code.trim() === '') {
      throw new Error('Property code cannot be empty');
    }

    const trimmedCode = code.trim();
    
    try {
      const { data, error } = await supabase.rpc('search_property_by_code_insensitive', {
        p_code: trimmedCode
      });
      
      if (error) {
        console.error('❌ search_property_by_code_insensitive error:', error);
        throw new Error(`Failed to search property by code (insensitive): ${error.message}`);
      }
      
      const results = data || [];
      console.log(`✅ Code Database: Found ${results.length} results for insensitive code: ${trimmedCode}`);
      return results;
      
    } catch (error) {
      console.error('❌ CodeSearchDb.searchByCodeInsensitive error:', error);
      throw new Error(`Database error while searching by code (insensitive): ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Smart code search - tries case sensitive first, then case insensitive
   */
  async smartCodeSearch(code: string): Promise<DatabaseSearchResult[]> {
    console.log('🧠 Code Database: Smart code search for:', code);
    
    try {
      // First try exact match
      let results = await this.searchByCode(code);
      
      // If no results found, try case insensitive
      if (results.length === 0) {
        console.log('🔄 Code Database: No exact match found, trying case insensitive search');
        results = await this.searchByCodeInsensitive(code);
      }
      
      console.log(`✅ Code Database: Smart search completed. Found ${results.length} results`);
      return results;
      
    } catch (error) {
      console.error('❌ CodeSearchDb.smartCodeSearch error:', error);
      throw new Error(`Smart code search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate if a string is a valid 6-character property code format
   */
  isValidPropertyCode(code: string): boolean {
    if (!code || typeof code !== 'string') {
      return false;
    }
    
    const trimmedCode = code.trim();
    
    // Check if it's exactly 6 characters and alphanumeric
    const isValid = /^[A-Za-z0-9]{6}$/.test(trimmedCode);
    
    console.log(`🔍 Code validation: "${trimmedCode}" is ${isValid ? 'valid' : 'invalid'}`);
    return isValid;
  }

  /**
   * Format code for display (uppercase)
   */
  formatCodeForDisplay(code: string): string {
    return code.trim().toUpperCase();
  }

  /**
   * Extract property code from search query if it matches the pattern
   */
  extractCodeFromQuery(query: string): string | null {
    if (!query || typeof query !== 'string') {
      return null;
    }
    
    const trimmedQuery = query.trim();
    
    // Check if the entire query is a property code
    if (this.isValidPropertyCode(trimmedQuery)) {
      return this.formatCodeForDisplay(trimmedQuery);
    }
    
    // Try to extract 6-character alphanumeric code from longer query
    const codeMatch = trimmedQuery.match(/\b[A-Za-z0-9]{6}\b/);
    if (codeMatch) {
      const extractedCode = codeMatch[0];
      if (this.isValidPropertyCode(extractedCode)) {
        return this.formatCodeForDisplay(extractedCode);
      }
    }
    
    return null;
  }

  /**
   * Get statistics about code search performance
   */
  async getCodeSearchStats(): Promise<{ totalPropertiesWithCodes: number; uniqueCodes: number }> {
    try {
      console.log('📊 Code Database: Getting code search statistics');
      
      const { data, error } = await supabase
        .from('properties_v2')
        .select('property_details')
        .not('property_details->meta->code', 'is', null)
        .limit(1000); // Limit for performance

      if (error) {
        console.error('❌ Error getting code statistics:', error);
        return { totalPropertiesWithCodes: 0, uniqueCodes: 0 };
      }

      const codes = new Set<string>();
      let totalPropertiesWithCodes = 0;

      if (data) {
        data.forEach(item => {
          const code = item.property_details?.meta?.code;
          if (code && typeof code === 'string') {
            totalPropertiesWithCodes++;
            codes.add(code.toUpperCase());
          }
        });
      }

      const stats = {
        totalPropertiesWithCodes,
        uniqueCodes: codes.size
      };

      console.log('📊 Code search statistics:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Error in getCodeSearchStats:', error);
      return { totalPropertiesWithCodes: 0, uniqueCodes: 0 };
    }
  }
}

/**
 * Singleton instance for code search database
 */
export const codeSearchDb = new CodeSearchDb();