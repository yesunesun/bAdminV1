// src/modules/seeker/components/PropertyDetails/SaleDetailsCard.tsx
// Version: 2.0.0
// Last Modified: 27-01-2025 15:45 IST
// Purpose: Enhanced sale details with Phase 1 design system, Indian formatting, and responsive layout

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  IndianRupee,
  Wrench,
  Calendar,
  ChefHat,
  CheckCircle2,
  Settings,
  Home,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  formatIndianRupees,
  formatIndianDate,
  renderFieldValue,
  formatFieldLabel,
  shouldDisplayValue,
  formatBoolean
} from './utils/dataFormatters';

interface SaleDetailsCardProps {
  saleInfo: any;
}

const SaleDetailsCard: React.FC<SaleDetailsCardProps> = ({ saleInfo }) => {
  if (!saleInfo || Object.keys(saleInfo).length === 0) return null;

  // Get main sale details with better fallbacks
  const expectedPrice = saleInfo.expectedPrice || saleInfo.salePrice || saleInfo.price || 0;
  const maintenanceCost = saleInfo.maintenanceCost || saleInfo.maintenance || 0;
  const kitchenType = saleInfo.kitchenType || saleInfo.kitchen;
  const possessionDate = saleInfo.possessionDate || saleInfo.availableFrom || saleInfo.handoverDate;
  const priceNegotiable = saleInfo.priceNegotiable || saleInfo.isNegotiable;

  // Fields to exclude from additional details display
  const excludedFields = [
    'expectedPrice', 'salePrice', 'price', 'maintenanceCost', 'maintenance', 
    'kitchenType', 'kitchen', 'possessionDate', 'availableFrom', 'handoverDate',
    'priceNegotiable', 'isNegotiable'
  ];

  // Get additional details
  const additionalDetails = Object.entries(saleInfo)
    .filter(([key, value]) => 
      !excludedFields.includes(key) && 
      shouldDisplayValue(value)
    );

  return (
    <Card className={cn("overflow-hidden shadow-sm border-border/50 transition-colors duration-200")}>
      <CardContent className="p-4 md:p-6">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold">Sale Details</h2>
          {priceNegotiable && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium ml-auto">
              Negotiable
            </span>
          )}
        </div>

        {/* Main Sale Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {expectedPrice > 0 && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-green-500/10 mb-3">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Expected Price</span>
              <span className="font-semibold text-center text-sm mt-1">
                {formatIndianRupees(expectedPrice)}
              </span>
            </div>
          )}

          {maintenanceCost > 0 && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-orange-500/10 mb-3">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Maintenance Cost</span>
              <span className="font-semibold text-center text-sm mt-1">
                {formatIndianRupees(maintenanceCost)}
              </span>
            </div>
          )}

          {kitchenType && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-blue-500/10 mb-3">
                <ChefHat className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Kitchen Type</span>
              <span className="font-semibold text-center text-sm mt-1 capitalize">
                {kitchenType}
              </span>
            </div>
          )}

          {possessionDate && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-purple-500/10 mb-3">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Available From</span>
              <span className="font-semibold text-center text-sm mt-1">
                {formatIndianDate(possessionDate)}
              </span>
            </div>
          )}
        </div>

        {/* Sale Terms Section */}
        {additionalDetails.length > 0 && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">Sale Information</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {additionalDetails.map(([key, value]) => {
                // Determine icon based on field type
                let IconComponent = Settings;
                const keyLower = key.toLowerCase();
                
                if (keyLower.includes('price') || keyLower.includes('cost') || keyLower.includes('amount')) {
                  IconComponent = IndianRupee;
                } else if (keyLower.includes('date') || keyLower.includes('time')) {
                  IconComponent = Calendar;
                } else if (keyLower.includes('kitchen') || keyLower.includes('cooking')) {
                  IconComponent = ChefHat;
                } else if (keyLower.includes('maintenance') || keyLower.includes('service')) {
                  IconComponent = Wrench;
                }

                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {formatFieldLabel(key)}
                      </span>
                      <p className="font-medium text-foreground">
                        {/* Special formatting for different field types */}
                        {keyLower.includes('price') || keyLower.includes('cost') || keyLower.includes('amount') ? 
                          formatIndianRupees(value) :
                          keyLower.includes('date') ? 
                            formatIndianDate(value) :
                            typeof value === 'boolean' || 
                            (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) ?
                              formatBoolean(value) :
                              renderFieldValue(value, key)
                        }
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Summary for Mobile */}
        <div className="lg:hidden mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-6 text-center">
            {expectedPrice > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-primary">{formatIndianRupees(expectedPrice, { compact: true })}</span>
                <span className="text-xs text-muted-foreground">Price</span>
              </div>
            )}
            {maintenanceCost > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-primary">{formatIndianRupees(maintenanceCost, { compact: true })}</span>
                <span className="text-xs text-muted-foreground">Maintenance</span>
              </div>
            )}
            {priceNegotiable && (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-green-600">Yes</span>
                <span className="text-xs text-muted-foreground">Negotiable</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaleDetailsCard;