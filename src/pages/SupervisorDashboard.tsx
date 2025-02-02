// src/pages/SupervisorDashboard.tsx
// Version: 1.0.1
// Last Modified: 2025-02-02T16:00:00+05:30 (IST)

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Clock, CheckCircle2, XCircle, Eye } from 'lucide-react';

interface PendingProperty {
  id: string;
  title: string;
  owner_id: string;
  created_at: string;
  status: string;
  owner_email?: string;
}

export default function SupervisorDashboard() {
  const { user, userProfile, loading: authLoading, isSupervisor } = useAuth();
  const navigate = useNavigate();
  const [pendingProperties, setPendingProperties] = useState<PendingProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingProperties = async () => {
      // Wait until authentication state is ready.
      if (authLoading) return;
      if (!user || !userProfile || !isSupervisor()) {
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            owner_id,
            created_at,
            status,
            profiles!owner_id (
              email
            )
          `)
          .eq('status', 'pending_review')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setPendingProperties(data.map((property: any) => ({
          ...property,
          owner_email: property.profiles?.email
        })));
      } catch (error) {
        console.error('Error fetching pending properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingProperties();
  }, [user, userProfile, authLoading, isSupervisor, navigate]);

  const handleAction = async (propertyId: string, action: 'approve' | 'reject') => {
    try {
      const updates = {
        status: action === 'approve' ? 'published' : 'rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', propertyId);

      if (error) throw error;

      // Remove the updated property from local state.
      setPendingProperties(prev =>
        prev.filter(property => property.id !== propertyId)
      );
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  if (!isSupervisor()) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You do not have supervisor privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage property listings awaiting review
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : pendingProperties.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Pending Reviews</h3>
          <p className="mt-1 text-sm text-gray-500">
            All properties have been reviewed. Check back later for new submissions.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingProperties.map((property) => (
                <tr key={property.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {property.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{property.owner_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(property.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => navigate(`/properties/${property.id}`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleAction(property.id, 'approve')}
                      className="text-green-600 hover:text-green-900"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleAction(property.id, 'reject')}
                      className="text-red-600 hover:text-red-900"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
