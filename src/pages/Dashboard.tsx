// src/pages/Dashboard.tsx
// Version: 1.4.0
// Last Modified: 06-02-2025 18:15 IST
// Updates: Refactored to use component-based architecture, moved role to header

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PageLayout from '@/components/layout/PageLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

interface DashboardMetrics {
  totalProperties: number;
  publishedProperties: number;
  draftProperties: number;
  averagePrice: number;
  recentActivity: {
    type: 'created' | 'published' | 'updated';
    propertyTitle: string;
    date: string;
  }[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;

      try {
        const { data: properties, error } = await supabase
          .from('properties')
          .select('*')
          .eq('owner_id', user.id);

        if (error) throw error;

        const publishedProperties = properties.filter(p => p.status === 'published');
        const draftProperties = properties.filter(p => p.status === 'draft');
        const totalPrices = properties.reduce((sum, p) => sum + p.price, 0);

        setMetrics({
          totalProperties: properties.length,
          publishedProperties: publishedProperties.length,
          draftProperties: draftProperties.length,
          averagePrice: properties.length ? totalPrices / properties.length : 0,
          recentActivity: properties
            .slice(0, 5)
            .map(p => ({
              type: p.status === 'published' ? 'published' : 'created',
              propertyTitle: p.title,
              date: new Date(p.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            }))
        });
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner message="Loading dashboard..." />;
    }

    if (error) {
      return (
        <ErrorState
          title="Dashboard Error"
          message={error}
          action={
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-red-800 hover:text-red-900 font-medium"
            >
              Try again
            </button>
          }
        />
      );
    }

    if (!metrics) return null;

    return (
      <div className="space-y-6">
        <StatsGrid metrics={metrics} />
        <RecentActivity activities={metrics.recentActivity} />
      </div>
    );
  };

  return (
    <PageLayout
      title="Dashboard"
      actions={
        <Link
          to="/properties/list"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          List your Property
        </Link>
      }
    >
      {renderContent()}
    </PageLayout>
  );
}