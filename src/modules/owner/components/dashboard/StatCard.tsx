// src/modules/owner/components/dashboard/StatCard.tsx
// Version: 2.0.0
// Last Modified: 26-02-2025 16:00 IST
// Purpose: Stat card component for owner dashboard

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    label: string;
  };
}

export function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend.direction === 'up' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {trend.direction === 'up' ? (
                      <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="self-center flex-shrink-0 h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {trend.direction === 'up' ? 'Increased' : 'Decreased'}
                    </span>
                    {trend.label}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}