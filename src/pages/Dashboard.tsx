import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Building2, 
  Eye, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  IndianRupee,
  Plus 
} from 'lucide-react';

interface Metrics {
  totalProperties: number;
  publishedProperties: number;
  draftProperties: number;
  averagePrice: number;
  totalViews: number;
  recentActivity: {
    type: 'created' | 'published' | 'updated';
    propertyTitle: string;
    date: string;
  }[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

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
          totalViews: 0, // This would come from analytics in a real app
          recentActivity: properties
            .slice(0, 5)
            .map(p => ({
              type: p.status === 'published' ? 'published' : 'created',
              propertyTitle: p.title,
              date: new Date(p.created_at).toLocaleDateString()
            }))
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/properties/add"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Properties */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Properties
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics.totalProperties}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Published Properties */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Published Properties
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics.publishedProperties}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                      <span className="sr-only">Increased by</span>
                      Active
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Draft Properties */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Draft Properties
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics.draftProperties}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-amber-600">
                      <ArrowDownRight className="self-center flex-shrink-0 h-4 w-4 text-amber-500" />
                      <span className="sr-only">Decreased by</span>
                      Pending
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Average Price */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IndianRupee className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Price
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      ₹{Math.round(metrics.averagePrice).toLocaleString('en-IN')}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {metrics.recentActivity.map((activity, index) => (
              <li key={index} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`h-2.5 w-2.5 rounded-full mr-2 ${
                      activity.type === 'published' ? 'bg-green-500' : 'bg-amber-500'
                    }`}></span>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.propertyTitle}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {activity.date}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {activity.type === 'published' ? 'Published' : 'Created'}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}