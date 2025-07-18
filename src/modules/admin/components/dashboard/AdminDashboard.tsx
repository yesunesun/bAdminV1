// src/modules/admin/components/dashboard/AdminDashboard.tsx

import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DashboardCards from './cards/DashboardCards';
import PropertyAnalytics from './analytics/PropertyAnalytics';
import { useDashboardData } from './hooks/useDashboardData';

export default function AdminDashboard() {
  const { data, loading, error, refresh, lastUpdated } = useDashboardData();

  const handleRefresh = async () => {
    await refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 sm:px-0 flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="px-4 sm:px-0 mb-8">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <div className="text-sm text-red-800">
                    {error.message}. Please try refreshing the page.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {loading && !data && (
          <div className="px-4 sm:px-0">
            <div className="animate-pulse space-y-8">
              {/* Cards skeleton */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
              
              {/* Analytics skeleton */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6">
                    <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {data && (
          <div className="px-4 sm:px-0 space-y-8">
            {/* Dashboard Cards */}
            <DashboardCards
              propertyStats={data.propertyStats}
              typeDistribution={data.propertyTypeDistribution}
              financialAnalytics={data.financialAnalytics}
              loading={loading}
            />

            {/* Property Analytics */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Property Analytics</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Detailed insights into property performance and market trends
                </p>
              </div>
              <div className="p-6">
                <PropertyAnalytics
                  propertyStats={data.propertyStats}
                  typeDistribution={data.propertyTypeDistribution}
                  performance={data.propertyPerformance}
                  financialAnalytics={data.financialAnalytics}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !data && (
          <div className="px-4 sm:px-0">
            <div className="text-center py-12">
              <p className="text-gray-500">No dashboard data available</p>
              <Button onClick={handleRefresh} className="mt-4">
                Load Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}