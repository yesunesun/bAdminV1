// src/modules/seeker/components/PropertyDetails/RentalDetailsCard.tsx
// Version: 2.0.0
// Last Modified: 27-01-2025 15:30 IST
// Purpose: Enhanced rental details with Phase 1 design system, Indian formatting, and responsive layout

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  IndianRupee,
  Shield,
  Calendar,
  Wrench,
  Users,
  CheckCircle2,
  Clock,
  Settings,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  formatIndianRupees,
  formatIndianDate,
  renderFieldValue,
  formatFieldLabel,
  shouldDisplayValue
} from './utils/dataFormatters';

interface RentalDetailsCardProps {
  rentalInfo: any;
}

const RentalDetailsCard: React.FC<RentalDetailsCardProps> = ({ rentalInfo }) => {
  if (!rentalInfo || Object.keys(rentalInfo).length === 0) return null;

  // Get main rental details with better fallbacks
  const rentAmount = rentalInfo.rentAmount || rentalInfo.monthlyRent || 0;
  const securityDeposit = rentalInfo.securityDeposit || rentalInfo.deposit || 0;
  const maintenanceCharges = rentalInfo.maintenanceCharges || rentalInfo.maintenance || 0;
  const availableFrom = rentalInfo.availableFrom || rentalInfo.availabilityDate;
  const furnishingStatus = rentalInfo.furnishingStatus || rentalInfo.furnishing;
  const leaseDuration = rentalInfo.leaseDuration || rentalInfo.minimumLease;
  const rentNegotiable = rentalInfo.rentNegotiable || rentalInfo.isNegotiable;
  const preferredTenants = rentalInfo.preferredTenants || [];

  // Fields to exclude from additional details display
  const excludedFields = [
    'rentAmount', 'monthlyRent', 'securityDeposit', 'deposit', 'maintenanceCharges', 
    'maintenance', 'availableFrom', 'availabilityDate', 'furnishingStatus', 
    'furnishing', 'leaseDuration', 'minimumLease', 'rentNegotiable', 'isNegotiable', 
    'preferredTenants'
  ];

  // Get additional details
  const additionalDetails = Object.entries(rentalInfo)
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
            <Home className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold">Rental Details</h2>
          {rentNegotiable && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium ml-auto">
              Negotiable
            </span>
          )}
        </div>

        {/* Main Rental Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {rentAmount > 0 && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-green-500/10 mb-3">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monthly Rent</span>
              <span className="font-semibold text-center text-sm mt-1">
                {formatIndianRupees(rentAmount)}
              </span>
            </div>
          )}

          {securityDeposit > 0 && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-blue-500/10 mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Security Deposit</span>
              <span className="font-semibold text-center text-sm mt-1">
                {formatIndianRupees(securityDeposit)}
              </span>
            </div>
          )}

          {maintenanceCharges > 0 && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-orange-500/10 mb-3">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Maintenance</span>
              <span className="font-semibold text-center text-sm mt-1">
                {formatIndianRupees(maintenanceCharges)}
              </span>
            </div>
          )}

          {availableFrom && (
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50",
              "transition-all hover:-translate-y-1 hover:shadow-md"
            )}>
              <div className="p-3 rounded-full bg-purple-500/10 mb-3">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Available From</span>
              <span className="font-semibold text-center text-sm mt-1">
                {formatIndianDate(availableFrom)}
              </span>
            </div>
          )}
        </div>

        {/* Rental Terms Section */}
        {(furnishingStatus || leaseDuration || preferredTenants.length > 0) && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">Rental Terms</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {furnishingStatus && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Home className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-muted-foreground">Furnishing Status</span>
                    <p className="font-medium text-foreground capitalize">{furnishingStatus}</p>
                  </div>
                </div>
              )}

              {leaseDuration && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-muted-foreground">Lease Duration</span>
                    <p className="font-medium text-foreground">{leaseDuration}</p>
                  </div>
                </div>
              )}

              {preferredTenants.length > 0 && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <div className="p-2 rounded-full bg-primary/10 mt-0.5">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-muted-foreground">Preferred Tenants</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {preferredTenants.map((tenant: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                        >
                          {tenant}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Details Section */}
        {additionalDetails.length > 0 && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-base md:text-lg font-medium">Additional Information</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {additionalDetails.map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Settings className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatFieldLabel(key)}
                    </span>
                    <p className="font-medium text-foreground">
                      {renderFieldValue(value, key)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Summary for Mobile */}
        <div className="lg:hidden mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-6 text-center">
            {rentAmount > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-primary">{formatIndianRupees(rentAmount, { compact: true })}</span>
                <span className="text-xs text-muted-foreground">Rent</span>
              </div>
            )}
            {securityDeposit > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-primary">{formatIndianRupees(securityDeposit, { compact: true })}</span>
                <span className="text-xs text-muted-foreground">Deposit</span>
              </div>
            )}
            {maintenanceCharges > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-primary">{formatIndianRupees(maintenanceCharges, { compact: true })}</span>
                <span className="text-xs text-muted-foreground">Maintenance</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RentalDetailsCard;