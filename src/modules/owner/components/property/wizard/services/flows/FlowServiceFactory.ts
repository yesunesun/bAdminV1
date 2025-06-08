// src/modules/owner/components/property/wizard/services/flows/FlowServiceFactory.ts
// Version: 2.0.0
// Last Modified: 25-05-2025 16:30 IST
// Purpose: Remove default fallback and show explicit errors when no flow detected

import { FlowServiceInterface, FlowContext } from './FlowServiceInterface';
import { ResidentialRentFlowService } from './ResidentialRentFlowService';
import { ResidentialSaleFlowService } from './ResidentialSaleFlowService';
import { PGHostelFlowService } from './PGHostelFlowService';
import { CommercialRentFlowService } from './CommercialRentFlowService';
import { CommercialSaleFlowService } from './CommercialSaleFlowService';
import { CoworkingFlowService } from './CoworkingFlowService';
import { LandSaleFlowService } from './LandSaleFlowService';
import { ResidentialFlatmatesFlowService } from './ResidentialFlatmatesFlowService';

export class FlowServiceFactory {
  // Order matters - more specific flows should be checked first
  private static flowServices: FlowServiceInterface[] = [
    // Check specialized flows first (most specific)
    new PGHostelFlowService(),
    new CoworkingFlowService(),
    new LandSaleFlowService(),
    
    // Then check other specific flows
    new ResidentialFlatmatesFlowService(),
    
    // Then check commercial flows
    new CommercialSaleFlowService(),
    new CommercialRentFlowService(),
    
    // Finally check generic residential flows (most general)
    new ResidentialSaleFlowService(),
    new ResidentialRentFlowService()
  ];
  
  /**
   * Detect the appropriate flow service for the given form data and context
   * Throws error if no valid flow is detected instead of using fallback
   */
  public static getFlowService(formData: any, flowContext: FlowContext): FlowServiceInterface {
    // Enhanced debug logging
    console.log('Detecting flow service for:', {
      urlPath: flowContext.urlPath,
      adType: flowContext.adType,
      formFlow: formData.flow,
      isPGHostelMode: flowContext.isPGHostelMode,
      isPgOrHostelInUrl: flowContext.urlPath?.toLowerCase().includes('pghostel') || 
                          flowContext.urlPath?.toLowerCase().includes('pg-hostel') || 
                          flowContext.urlPath?.toLowerCase().includes('/pg/') || 
                          flowContext.urlPath?.toLowerCase().includes('/hostel/')
    });
    
    // Special handling for PG/Hostel flow
    // If URL indicates PG/Hostel, always use PG/Hostel flow
    if (flowContext.urlPath?.toLowerCase().includes('pghostel') || 
        flowContext.urlPath?.toLowerCase().includes('pg-hostel') || 
        flowContext.urlPath?.toLowerCase().includes('/pg/') || 
        flowContext.urlPath?.toLowerCase().includes('/hostel/')) {
      const pgHostelService = this.flowServices.find(s => s instanceof PGHostelFlowService);
      if (pgHostelService) {
        console.log(`Using PG/Hostel flow from URL path: ${flowContext.urlPath}`);
        return pgHostelService;
      }
    }
    
    // If we have direct information that this is a PG/Hostel, use that flow
    if (flowContext.isPGHostelMode) {
      const pgHostelService = this.flowServices.find(s => s instanceof PGHostelFlowService);
      if (pgHostelService) {
        console.log(`Using PG/Hostel flow from context flag`);
        return pgHostelService;
      }
    }
    
    // Check data structure for more direct flow indicators
    if (formData.flow?.category && formData.flow?.listingType) {
      // Special handling for PG/Hostel
      if (formData.flow.listingType.toLowerCase() === 'pghostel' || 
          formData.flow.listingType.toLowerCase().includes('pg') || 
          formData.flow.listingType.toLowerCase().includes('hostel')) {
        const pgHostelService = this.flowServices.find(s => s instanceof PGHostelFlowService);
        if (pgHostelService) {
          console.log(`Using PG/Hostel flow from flow.listingType: ${formData.flow.listingType}`);
          return pgHostelService;
        }
      }
    }
    
    // Special check for adType parameter
    if (flowContext.adType?.toLowerCase().includes('pg') || 
        flowContext.adType?.toLowerCase().includes('hostel')) {
      const pgHostelService = this.flowServices.find(s => s instanceof PGHostelFlowService);
      if (pgHostelService) {
        console.log(`Using PG/Hostel flow from adType: ${flowContext.adType}`);
        return pgHostelService;
      }
    }
    
    // Standard detection loop through all services
    for (const service of this.flowServices) {
      if (service.detectFlow(formData, flowContext)) {
        console.log(`Detected flow type: ${service.getFlowType()}`);
        return service;
      }
    }
    
    // Instead of fallback, throw an error
    const errorMessage = `No valid property flow detected. Please ensure you've selected a valid property type and listing option. Context: ${JSON.stringify({
      urlPath: flowContext.urlPath,
      adType: flowContext.adType,
      formFlow: formData.flow
    })}`;
    
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  /**
   * Get a specific flow service by type
   * Used when we know exactly which flow service we need (e.g., for creating or updating properties)
   */
  public static getFlowServiceByType(flowType: string): FlowServiceInterface {
    // Special case: handle 'pghostel' and variations
    if (flowType.toLowerCase().includes('pghostel') || 
        flowType.toLowerCase().includes('pg') || 
        flowType.toLowerCase().includes('hostel')) {
      const pgHostelService = this.flowServices.find(s => s instanceof PGHostelFlowService);
      if (pgHostelService) {
        console.log(`Using PG/Hostel flow for type "${flowType}"`);
        return pgHostelService;
      }
    }
    
    // Standard lookup by flow type
    const service = this.flowServices.find(s => s.getFlowType() === flowType);
    
    if (!service) {
      const errorMessage = `Flow service for type "${flowType}" not found. Available types: ${this.flowServices.map(s => s.getFlowType()).join(', ')}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    return service;
  }
  
  /**
   * Get a flow service by category and listingType
   * Used when we have these details directly
   */
  public static getService(category: string, listingType: string): FlowServiceInterface {
    // Handle PG/Hostel special case with enhanced detection
    if (listingType.toLowerCase() === 'pghostel' || 
        listingType.toLowerCase().includes('pg') || 
        listingType.toLowerCase().includes('hostel')) {
      const pgHostelService = this.flowServices.find(s => s instanceof PGHostelFlowService);
      if (pgHostelService) {
        console.log(`Using PG/Hostel flow service for category: ${category}, listingType: ${listingType}`);
        return pgHostelService;
      }
    }
    
    const flowType = `${category}_${listingType}`;
    
    // Map common variations
    const mappedFlowType = this.mapFlowTypeVariations(flowType);
    
    const service = this.flowServices.find(s => s.getFlowType() === mappedFlowType);
    
    if (!service) {
      const errorMessage = `Flow service for category "${category}" and listingType "${listingType}" not found. Available flow types: ${this.flowServices.map(s => s.getFlowType()).join(', ')}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    console.log(`Found flow service for: ${mappedFlowType}`);
    return service;
  }
  
  /**
   * Map common flow type variations to ensure correct service selection
   */
  private static mapFlowTypeVariations(flowType: string): string {
    const mappings: Record<string, string> = {
      'commercial_rent': 'commercial_rent',
      'commercial_sale': 'commercial_sale',
      'commercial_sell': 'commercial_sale',
      'commercial_coworking': 'commercial_coworking',
      'residential_rent': 'residential_rent',
      'residential_sale': 'residential_sale',
      'residential_sell': 'residential_sale',
      'residential_flatmates': 'residential_flatmates',
      'residential_pghostel': 'residential_pghostel',
      'residential_pg': 'residential_pghostel',
      'residential_hostel': 'residential_pghostel',
      'land_sale': 'land_sale',
      'land_sell': 'land_sale'
    };
    
    const normalized = flowType.toLowerCase();
    const mapped = mappings[normalized];
    
    if (!mapped) {
      throw new Error(`Unknown flow type variation: ${flowType}. Please use a valid property type and listing option.`);
    }
    
    return mapped;
  }
}