// src/modules/admin/components/dashboard/cards/PropertyOverviewCard.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, CheckCircle, Clock, Plus } from 'lucide-react';
import type { PropertyStats } from '../types/dashboard.types';

interface PropertyOverviewCardProps {
  stats: PropertyStats;
  loading?: boolean;
}

export default function PropertyOverviewCard({ stats, loading = false }: PropertyOverviewCardProps) {
  const cards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: Building2,
      change: `+${stats.propertiesAddedThisMonth}`,
      changeLabel: 'this month',
      changeType: 'positive' as const,
      className: 'bg-blue-50 border-blue-200',
      iconClassName: 'text-blue-600',
      valueClassName: 'text-blue-900'
    },
    {
      title: 'Active Properties',
      value: stats.activeProperties,
      icon: CheckCircle,
      change: `${Math.round((stats.activeProperties / Math.max(stats.totalProperties, 1)) * 100)}%`,
      changeLabel: 'of total',
      changeType: 'neutral' as const,
      className: 'bg-green-50 border-green-200',
      iconClassName: 'text-green-600',
      valueClassName: 'text-green-900'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: Clock,
      change: 'Action needed',
      changeLabel: '',
      changeType: stats.pendingApprovals > 10 ? 'negative' : 'neutral' as const,
      className: 'bg-orange-50 border-orange-200',
      iconClassName: 'text-orange-600',
      valueClassName: 'text-orange-900'
    },
    {
      title: 'Added Today',
      value: stats.propertiesAddedToday,
      icon: Plus,
      change: `+${stats.propertiesAddedThisWeek}`,
      changeLabel: 'this week',
      changeType: 'positive' as const,
      className: 'bg-purple-50 border-purple-200',
      iconClassName: 'text-purple-600',
      valueClassName: 'text-purple-900'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="mt-4">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card 
            key={card.title} 
            className={`hover:shadow-lg transition-all duration-200 ${card.className}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    {card.title}
                  </dt>
                  <dd className={`mt-1 text-3xl font-bold ${card.valueClassName}`}>
                    {card.value.toLocaleString()}
                  </dd>
                </div>
                <div className={`p-3 rounded-lg bg-white shadow-sm`}>
                  <Icon className={`h-6 w-6 ${card.iconClassName}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`
                  text-sm font-medium
                  ${card.changeType === 'positive' ? 'text-green-600' : 
                    card.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'}
                `}>
                  {card.change}
                </span>
                {card.changeLabel && (
                  <span className="text-sm text-gray-500 ml-2">{card.changeLabel}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}