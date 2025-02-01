// src/pages/Dashboard.tsx
// Version: 1.5.0
// Last Modified: 2025-02-02T15:00:00+05:30 (IST)

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Home, ListFilter, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardMetrics {
  totalProperties: number;
  pendingReview: number;
  publishedProperties: number;
  rejectedProperties: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    user, 
    userProfile, 
    loading: authLoading, 
    error: authError,
    isSupervisor, 
    isPropertyOwner 
  } = useAuth();
  
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProperties: 0,
    pendingReview: 0,
    publishedProperties: 0,
    rejectedProperties: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchMetrics = async () => {
      // Don't fetch if still authenticating or no user
      if (authLoading || !user || !userProfile) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('properties')
          .select('id, status', { count: 'exact' });

        // If user is a property owner, only fetch their properties
        if (isPropertyOwner()) {
          query = query.eq('owner_id', user.id);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (!data) {
          throw new Error('No data received from server');
        }

        const newMetrics = {
          totalProperties: data.length,
          pendingReview: data.filter(p => p.status === 'pending_review').length,
          publishedProperties: data.filter(p => p.status === 'published').length,
          rejectedProperties: data.filter(p => p.status === 'rejected').length
        };

        setMetrics(newMetrics);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user, userProfile, authLoading, isPropertyOwner]);

  // Handle loading states
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Handle auth errors
  if (authError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Authentication error: {authError}</p>
        </div>
      </div>
    );
  }

  // Handle no user or profile
  if (!user || !userProfile) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please log in to access the dashboard.</p>
      </div>
    );
  }

  // Verify role access
  if (!isPropertyOwner() && !isSupervisor()) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">You do not have access to this dashboard.</p>
      </div>
    );
  }

  const MetricCard = ({ title, value, icon: Icon, color }: { 
    title: string; 
    value: number; 
    icon: any;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`rounded-full p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {userProfile.email}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isSupervisor() ? 'Supervisor Dashboard' : 'Property Owner Dashboard'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Properties"
            value={metrics.totalProperties}
            icon={Home}
            color="bg-blue-500"
          />
          <MetricCard
            title="Pending Review"
            value={metrics.pendingReview}
            icon={Clock}
            color="bg-yellow-500"
          />
          <MetricCard
            title="Published"
            value={metrics.publishedProperties}
            icon={CheckCircle}
            color="bg-green-500"
          />
          <MetricCard
            title="Rejected"
            value={metrics.rejectedProperties}
            icon={XCircle}
            color="bg-red-500"
          />
        </div>
      )}

      {/* Role-specific content */}
      {isSupervisor() && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/properties?status=pending_review"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <ListFilter className="h-6 w-6 text-yellow-500" />
              <span className="ml-3 text-gray-900">Review Pending Properties</span>
            </a>
            <a
              href="/properties"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <Home className="h-6 w-6 text-blue-500" />
              <span className="ml-3 text-gray-900">View All Properties</span>
            </a>
          </div>
        </div>
      )}

      {isPropertyOwner() && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/properties/add"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <Home className="h-6 w-6 text-blue-500" />
              <span className="ml-3 text-gray-900">Add New Property</span>
            </a>
            <a
              href="/properties"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <ListFilter className="h-6 w-6 text-blue-500" />
              <span className="ml-3 text-gray-900">View My Properties</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}