// src/modules/owner/components/property/wizard/services/flows/FlowServiceFactory.ts
// Version: 1.0.0
// Last Modified: 12-05-2025 17:05 IST
// Purpose: Factory to manage all flow services and detect the correct one for data

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
  private static flowServices: FlowServiceInterface[] = [
    new ResidentialRentFlowService(),
    new ResidentialSaleFlowService(),
    new PGHostelFlowService(),
    new ResidentialFlatmatesFlowService(),
    new CommercialRentFlowService(),
    new CommercialSaleFlowService(),
    new CoworkingFlowService(),
    new LandSaleFlowService()
  ];
  
  private static defaultFlowService = new ResidentialRentFlowService();
  
  /**
   * Detect the appropriate flow service for the given form data and context
   */
  public static getFlowService(formData: any, flowContext: FlowContext): FlowServiceInterface {
    for (const service of this.flowServices) {
      if (service.detectFlow(formData, flowContext)) {
        console.log(`Detected flow type: ${service.getFlowType()}`);
        return service;
      }
    }
    
    console.log(`No flow detected, using default: ${this.defaultFlowService.getFlowType()}`);
    return this.defaultFlowService;
  }
  
  /**
   * Get a specific flow service by type
   */
  public static getFlowServiceByType(flowType: string): FlowServiceInterface {
    const service = this.flowServices.find(s => s.getFlowType() === flowType);
    return service || this.defaultFlowService;
  }
}