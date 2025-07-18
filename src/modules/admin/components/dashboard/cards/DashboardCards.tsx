// src/modules/admin/components/dashboard/cards/DashboardCards.tsx

import React from 'react';
import PropertyOverviewCard from './PropertyOverviewCard';
import PerformanceCard from './PerformanceCard';
import type { PropertyStats, PropertyTypeDistribution, FinancialAnalytics } from '../types/dashboard.types';

interface DashboardCardsProps {
  propertyStats: PropertyStats;
  typeDistribution: PropertyTypeDistribution;
  financialAnalytics: FinancialAnalytics;
  loading?: boolean;
}

export default function DashboardCards({ 
  propertyStats, 
  typeDistribution, 
  financialAnalytics, 
  loading = false 
}: DashboardCardsProps) {
  return (
    <div className="space-y-8">
      {/* Property Overview Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Overview</h2>
        <PropertyOverviewCard stats={propertyStats} loading={loading} />
      </div>

    </div>
  );
}