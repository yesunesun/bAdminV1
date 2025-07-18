// src/modules/admin/components/dashboard/analytics/PropertyAnalytics.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart, TrendingUp, Clock } from 'lucide-react';
import type { 
  PropertyStats, 
  PropertyTypeDistribution, 
  PropertyPerformance, 
  FinancialAnalytics 
} from '../types/dashboard.types';

interface PropertyAnalyticsProps {
  propertyStats: PropertyStats;
  typeDistribution: PropertyTypeDistribution;
  performance: PropertyPerformance;
  financialAnalytics: FinancialAnalytics;
  loading?: boolean;
}

export default function PropertyAnalytics({
  propertyStats,
  typeDistribution,
  performance,
  financialAnalytics,
  loading = false
}: PropertyAnalyticsProps) {
  const totalProperties = typeDistribution.residential + typeDistribution.commercial + typeDistribution.land;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-40"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Property Distribution Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Property Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Residential', value: typeDistribution.residential, color: 'bg-blue-500' },
                { label: 'Commercial', value: typeDistribution.commercial, color: 'bg-green-500' },
                { label: 'Land', value: typeDistribution.land, color: 'bg-orange-500' }
              ].map((item) => {
                const percentage = totalProperties > 0 ? Math.round((item.value / totalProperties) * 100) : 0;
                return (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{item.value}</span>
                      <span className="text-xs text-gray-400">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Total: <span className="font-semibold">{totalProperties}</span> properties
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Split */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Market Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded bg-purple-500"></div>
                  <span className="text-sm font-medium">Rental Market</span>
                </div>
                <span className="text-lg font-semibold">{financialAnalytics.marketSplit.rental}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded bg-indigo-500"></div>
                  <span className="text-sm font-medium">Sale Market</span>
                </div>
                <span className="text-lg font-semibold">{financialAnalytics.marketSplit.sale}%</span>
              </div>
            </div>
            
            {/* Visual bar representation */}
            <div className="mt-4 space-y-2">
              <div className="text-xs text-gray-500 mb-1">Market Distribution</div>
              <div className="w-full bg-gray-200 rounded-full h-2 flex overflow-hidden">
                <div 
                  className="bg-purple-500 h-full" 
                  style={{ width: `${financialAnalytics.marketSplit.rental}%` }}
                ></div>
                <div 
                  className="bg-indigo-500 h-full" 
                  style={{ width: `${financialAnalytics.marketSplit.sale}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Time to Publish</span>
                <span className="text-lg font-semibold">
                  {performance.averageTimeToPublish > 0 ? 
                    `${performance.averageTimeToPublish} days` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Most Popular Type</span>
                <span className="text-lg font-semibold capitalize">
                  {performance.mostPopularType}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Properties</span>
                <span className="text-lg font-semibold">
                  {Math.round((propertyStats.activeProperties / Math.max(propertyStats.totalProperties, 1)) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Average Prices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Residential', value: financialAnalytics.averagePrices.residential, color: 'text-blue-600' },
                { label: 'Commercial', value: financialAnalytics.averagePrices.commercial, color: 'text-green-600' },
                { label: 'Land', value: financialAnalytics.averagePrices.land, color: 'text-orange-600' }
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`text-lg font-semibold ${item.color}`}>
                    {item.value > 0 ? `₹${(item.value / 100000).toFixed(1)}L` : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Range Distribution */}
      {performance.priceRangeDistribution && performance.priceRangeDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Price Range Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performance.priceRangeDistribution.map((range, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{range.range}</span>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${range.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {range.count} ({range.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}