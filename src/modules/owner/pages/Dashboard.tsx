// src/modules/owner/pages/Dashboard.tsx
// Version: 6.0.0
// Last Modified: 26-02-2025 23:15 IST
// Purpose: Owner dashboard using migrated components

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import PageLayout from '@/components/layout/PageLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { usePropertyOwner } from '../hooks/usePropertyOwner';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();
  const { 
    properties, 
    loading, 
    error, 
    refreshProperties
  } = usePropertyOwner();
  
  const [metrics, setMetrics] = useState({
    totalProperties: 0,
    publishedProperties: 0,
    draftProperties: 0,
    averagePrice: 0,
    recentActivity: [] as any[]
  });

  // Calculate metrics when properties change
  useEffect(() => {
    if (!properties || properties.length === 0) {
      setMetrics({
        totalProperties: 0,
        publishedProperties: 0,
        draftProperties: 0,
        averagePrice: 0,
        recentActivity: []
      });
      return;
    }

    const publishedProperties = properties.filter(p => p.status === 'published');
    const draftProperties = properties.filter(p => p.status === 'draft');
    const totalPrices = properties.reduce((sum, p) => sum + parseFloat(p.price || '0'), 0);

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
  }, [properties]);

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner message="Loading dashboard..." />;
    }

    if (error) {
      return (
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800">Dashboard Error</h3>
          <p className="mt-2 text-red-600">{error}</p>
          <button
            onClick={() => refreshProperties()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <StatsGrid metrics={metrics} />
        <RecentActivity activities={metrics.recentActivity} />
        
        {properties.length === 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm border border-blue-100">
            <h3 className="text-xl font-semibold text-blue-800">Get Started with Your First Property</h3>
            <p className="mt-2 text-blue-600">List your property to reach potential buyers and tenants.</p>
            <Link to="/properties/list" className="mt-4 inline-block">
              <Button variant="default" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                List your Property
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <PageLayout
      title="Owner Dashboard"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => refreshProperties()}
            className="inline-flex items-center px-3 py-2 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </button>
          <Link
            to="/properties/list"
            className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            List your Property
          </Link>
        </div>
      }
    >
      {renderContent()}
    </PageLayout>
  );
}