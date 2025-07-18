// src/modules/admin/components/dashboard/cards/PerformanceCard.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Building, MapPin, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import type { PropertyTypeDistribution, FinancialAnalytics } from '../types/dashboard.types';

interface PerformanceCardProps {
  typeDistribution: PropertyTypeDistribution;
  financialAnalytics: FinancialAnalytics;
  loading?: boolean;
}

export default function PerformanceCard({ 
  typeDistribution, 
  financialAnalytics, 
  loading = false 
}: PerformanceCardProps) {
  const totalProperties = typeDistribution.residential + typeDistribution.commercial + typeDistribution.land;
  
  const performanceCards = [];

  // Since we removed Property Types (duplicate of Property Type Distribution),
  // this component now just shows a message or can be removed entirely
  return (
    <div className="text-center py-8 text-gray-500">
      <p>Performance metrics are shown in the Property Analytics section below.</p>
    </div>
  );
}