// src/modules/admin/components/dashboard/hooks/useDashboardData.ts

import { useState, useEffect, useCallback } from 'react';
import { DashboardQueries } from '../utils/dashboard-queries';
import type { DashboardData, DashboardError } from '../types/dashboard.types';

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: DashboardError | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DashboardError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch property stats and type distribution first
      const [
        propertyStats,
        propertyTypeDistribution,
        propertyPerformance
      ] = await Promise.all([
        DashboardQueries.getPropertyStats(),
        DashboardQueries.getPropertyTypeDistribution(),
        DashboardQueries.getPropertyPerformance()
      ]);

      // Then fetch financial analytics with type distribution data
      const financialAnalytics = await DashboardQueries.getFinancialAnalytics(propertyTypeDistribution);

      const dashboardData: DashboardData = {
        propertyStats,
        propertyTypeDistribution,
        propertyPerformance,
        financialAnalytics
      };

      setData(dashboardData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError({
        message: err instanceof Error ? err.message : 'Failed to fetch dashboard data',
        code: 'FETCH_ERROR',
        details: err
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdated
  };
}