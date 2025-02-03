// src/pages/Dashboard.tsx
// Version: 1.5.5
// Last Modified: 2025-02-02T22:30:00+05:30 (IST)

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Home, ListFilter, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardMetrics {
  totalProperties: number;
  pendingReview: number;
  publishedProperties: number;
  rejectedProperties: number;
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color }) => (
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProperties: 0,
    pendingReview: 0,
    publishedProperties: 0,
    rejectedProperties: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug log for auth state
  useEffect(() => {
    console.log('Dashboard Auth State:', {
      authenticated: !!user,
      userId: user?.id,
      userEmail: userProfile?.email,
      hasProfile: !!userProfile,
      userRole: userProfile?.role,
      loading: authLoading,
      timestamp: new Date().toISOString()
    });
  }, [user, userProfile, authLoading]);

  // Authentication check effect
// In Dashboard.tsx, modify the authentication check:
useEffect(() => {
  if (!authLoading && !user && !userProfile) {
    navigate('/login', { replace: true });
  }
}, [authLoading, user, userProfile, navigate]);

  // Data fetching effect
  useEffect(() => {
    let isSubscribed = true;

    const fetchMetrics = async () => {
      if (!user?.id || !userProfile) {
        console.warn('⚠️ Skipping metrics fetch - missing user data');
        return;
      }
    
      try {
        console.log('Starting metrics fetch:', { userId: user.id, userRole: userProfile.role });
    
        setLoading(true);
        setError(null);
    
        // Validate table access before making a request
        const { error: tableCheckError } = await supabase.from('properties').select('id').limit(1);
        if (tableCheckError) {
          console.error('❌ Database access error:', tableCheckError);
          setError('Database access failed');
          return;
        }
    
        let query = supabase.from('properties').select('id, status', { count: 'exact' });
    
        if (userProfile.role === 'property_owner') {
          console.log('Applying owner filter:', user.id);
          query = query.eq('owner_id', user.id);
        }
    
        console.log('Executing metrics query...');
        const { data, error: fetchError } = await query;
    
        if (fetchError) {
          throw new Error(fetchError.message);
        }
    
        if (!data) {
          throw new Error('No data received from server');
        }
    
        const newMetrics = {
          totalProperties: data.length,
          pendingReview: data.filter(p => p.status === 'pending_review').length,
          publishedProperties: data.filter(p => p.status === 'published').length,
          rejectedProperties: data.filter(p => p.status === 'rejected').length
        };
    
        console.log('Setting new metrics:', newMetrics);
        setMetrics(newMetrics);
      } catch (err: any) {
        console.error('❌ Metrics fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    

    fetchMetrics();

    return () => {
      isSubscribed = false;
      console.log('Cleanup: cancelling metrics fetch');
    };
  }, [user?.id, userProfile?.role]);

  if (authLoading) {
    console.log('Rendering loading state');
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    console.log('Rendering unauthorized state');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {userProfile.email}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {userProfile.role === 'supervisor' ? 'Supervisor Dashboard' : 'Property Owner Dashboard'}
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

      {userProfile.role === "supervisor" && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                console.log('Navigating to pending review properties');
                navigate('/properties?status=pending_review');
              }}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <ListFilter className="h-6 w-6 text-yellow-500" />
              <span className="ml-3 text-gray-900">Review Pending Properties</span>
            </button>
            <button
              onClick={() => {
                console.log('Navigating to all properties');
                navigate('/properties');
              }}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <Home className="h-6 w-6 text-blue-500" />
              <span className="ml-3 text-gray-900">View All Properties</span>
            </button>
          </div>
        </div>
      )}

      {userProfile.role === "property_owner" && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                console.log('Navigating to add property');
                navigate('/properties/add');
              }}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <Home className="h-6 w-6 text-blue-500" />
              <span className="ml-3 text-gray-900">Add New Property</span>
            </button>
            <button
              onClick={() => {
                console.log('Navigating to my properties');
                navigate('/properties');
              }}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <ListFilter className="h-6 w-6 text-blue-500" />
              <span className="ml-3 text-gray-900">View My Properties</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};