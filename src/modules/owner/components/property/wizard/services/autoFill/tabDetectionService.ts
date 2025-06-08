// src/modules/owner/components/property/wizard/services/autoFill/tabDetectionService.ts
// Version: 1.0.0
// Last Modified: 03-05-2025 19:30 IST
// Purpose: Service to detect the currently active tab

export class TabDetectionService {
  /**
   * Detects which tab is currently active in the UI
   * This helps us determine which fields to fill
   */
  static detectActiveTab(): string | null {
    try {
      // Look for active tab indicators in the DOM
      
      // First try: Look for an element with "active" or "selected" class that contains tab text
      const activeElements = document.querySelectorAll('[class*="active"],[class*="selected"]');
      for (const el of Array.from(activeElements)) {
        const text = el.textContent?.trim();
        if (text && ['Basic Details', 'Location', 'Rental', 'Features', 'Review', 'Photos'].includes(text)) {
          return text;
        }
      }
      
      // Second try: Look for specific tab headings that contain rental-related text in the visible area
      if (document.querySelector('h2, h3, h4')?.textContent?.includes('Rental Details')) {
        return 'Rental';
      }
      
      // Check if rental-specific fields are visible (like rent amount, security deposit)
      if (document.querySelector('label')?.textContent?.includes('Rent Amount') ||
          document.querySelector('input[placeholder*="e.g. 15000"]')) {
        return 'Rental';
      }
      
      // Look for other section headers to identify the current tab
      const headers = document.querySelectorAll('h2, h3, h4');
      for (const header of Array.from(headers)) {
        const text = header.textContent?.trim();
        if (text) {
          if (text.includes('Property Details') || text.includes('Basic Details')) {
            return 'Basic Details';
          } else if (text.includes('Location')) {
            return 'Location';
          } else if (text.includes('Features') || text.includes('Amenities')) {
            return 'Features';
          }
        }
      }
      
      // Try to detect by form field presence
      if (document.querySelector('label')?.textContent?.includes('Property Type')) {
        return 'Basic Details';
      }
      
      // If we still can't detect, return null
      return null;
    } catch (error) {
      console.error("Error detecting active tab:", error);
      return null;
    }
  }
}