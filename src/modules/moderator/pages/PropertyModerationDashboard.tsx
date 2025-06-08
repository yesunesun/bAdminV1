// src/modules/moderator/pages/PropertyModerationDashboard.tsx
// Version: 1.7.0
// Last Modified: 26-02-2025 21:45 IST

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PropertyApprovalList } from '../components/PropertyApprovalList';
import { Property } from '@/components/property/PropertyFormTypes';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/modules/admin/hooks/useAdminAccess';
import { AlertCircle, CheckCircle, Clock, Activity, MapPin, User } from 'lucide-react';

export default function PropertyModerationDashboard() {
  const { user } = useAuth();
  const { isPropertyModerator, loading: roleLoading } = useAdminAccess();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    recent: 0,
    locations: 0,
    owners: 0
  });

  useEffect(() => {
    if (roleLoading) return;
    
    if (!isPropertyModerator) {
      setError('You do not have permission to access this page');
      setLoading(false);
      return;
    }
    
    fetchProperties();
  }, [user, isPropertyModerator, roleLoading]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      // Query the view directly
      const { data, error: fetchError } = await supabase
        .from('property_with_owner_emails')
        .select('*');

      if (fetchError) {
        console.error('Error with view query, falling back to standard query:', fetchError);
        
        // Fallback to standard query if view fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('properties')
          .select(`
            *,
            property_images (
              id,
              url
            )
          `)
          .order('created_at', { ascending: false });
          
        if (fallbackError) throw fallbackError;
        
        // Transform the fallback data
        const formattedProperties = fallbackData.map(item => ({
          ...item,
          images: item.property_images,
          owner_email: item.owner_id
        })) as Property[];
        
        setProperties(formattedProperties);
        
        // Calculate stats with fallback data
        calculateStats(formattedProperties);
        
        return;
      }

      // Transform the data to match the Property type
      const formattedProperties = data.map(item => ({
        ...item,
        images: item.property_images || [],
        owner_email: item.owner_email || item.owner_id
      })) as Property[];

      setProperties(formattedProperties);
      
      // Calculate stats
      calculateStats(formattedProperties);
      
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to calculate statistics
  const calculateStats = (propertyData: Property[]) => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const uniqueLocations = new Set(propertyData.map(p => p.city).filter(Boolean));
    const uniqueOwners = new Set(propertyData.map(p => p.owner_id));
    
    setStats({
      total: propertyData.length,
      pending: propertyData.filter(p => p.status === 'draft').length,
      approved: propertyData.filter(p => p.status === 'published').length,
      recent: propertyData.filter(p => {
        const createdAt = new Date(p.created_at);
        return createdAt >= twentyFourHoursAgo;
      }).length,
      locations: uniqueLocations.size,
      owners: uniqueOwners.size
    });
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      
      const { error: updateError } = await supabase
        .from('properties')
        .update({ 
          status: 'published',
          tags: ['public'],
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;
      
      // Update local state
      setProperties(properties.map(property => 
        property.id === id 
          ? { ...property, status: 'published', tags: ['public'] }
          : property
      ));
      
      // Update stats
      setStats({
        ...stats,
        pending: stats.pending - 1,
        approved: stats.approved + 1
      });
      
    } catch (err) {
      console.error('Error approving property:', err);
      alert('Failed to approve property. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      setProcessingId(id);
      
      const property = properties.find(p => p.id === id);
      if (!property) throw new Error('Property not found');
      
      // Update property with rejection status and reason
      const { error: updateError } = await supabase
        .from('properties')
        .update({ 
          status: 'rejected',
          property_details: {
            ...property.property_details,
            rejectionReason: reason,
            rejectedAt: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;
      
      // Update local state
      setProperties(properties.map(p => 
        p.id === id 
          ? { 
              ...p, 
              status: 'rejected', 
              property_details: {
                ...p.property_details,
                rejectionReason: reason,
                rejectedAt: new Date().toISOString()
              }
            }
          : p
      ));
      
      // Update stats
      setStats({
        ...stats,
        pending: stats.pending - 1
      });
      
    } catch (err) {
      console.error('Error rejecting property:', err);
      alert('Failed to reject property. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Error
        </h3>
        <p className="mt-2 text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Property Moderation Dashboard</h1>
        <button
          onClick={fetchProperties}
          disabled={loading}
          className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <svg className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="mb-1 text-xs font-medium text-gray-500">Total</p>
              <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Clock className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="mb-1 text-xs font-medium text-gray-500">Pending</p>
              <p className="text-xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="mb-1 text-xs font-medium text-gray-500">Approved</p>
              <p className="text-xl font-semibold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Activity className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="mb-1 text-xs font-medium text-gray-500">Last 24h</p>
              <p className="text-xl font-semibold text-gray-900">{stats.recent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="mb-1 text-xs font-medium text-gray-500">Locations</p>
              <p className="text-xl font-semibold text-gray-900">{stats.locations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pink-100 text-pink-600">
              <User className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="mb-1 text-xs font-medium text-gray-500">Owners</p>
              <p className="text-xl font-semibold text-gray-900">{stats.owners}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Properties</h2>
        <PropertyApprovalList
          properties={properties}
          loading={loading}
          onApprove={handleApprove}
          onReject={handleReject}
          isProcessing={processingId}
        />
      </div>
    </div>
  );
}