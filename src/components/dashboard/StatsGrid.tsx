// src/components/dashboard/StatsGrid.tsx
// Version: 1.0.0
// Last Modified: 06-02-2025 18:00 IST

import React from 'react';
import { Building2, Eye, Clock, IndianRupee } from 'lucide-react';
import { StatCard } from './StatCard';

interface StatsGridProps {
  metrics: {
    totalProperties: number;
    publishedProperties: number;
    draftProperties: number;
    averagePrice: number;
  };
}

export function StatsGrid({ metrics }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Building2}
        label="Total Properties"
        value={metrics.totalProperties}
      />
      <StatCard
        icon={Eye}
        label="Published Properties"
        value={metrics.publishedProperties}
        trend={{ direction: 'up', label: 'Active' }}
      />
      <StatCard
        icon={Clock}
        label="Draft Properties"
        value={metrics.draftProperties}
        trend={{ direction: 'down', label: 'Pending' }}
      />
      <StatCard
        icon={IndianRupee}
        label="Average Price"
        value={`₹${Math.round(metrics.averagePrice).toLocaleString('en-IN')}`}
      />
    </div>
  );
}