// File: src/pages/Properties.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { PropertyList } from '@/components/property/PropertyList';
import { Property } from '@/components/property/types';
import { Clock, AlertCircle, Filter } from 'lucide-react';

export default function Properties() {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading, error: authError, isSupervisor } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending_review' | 'rejected' | 'published'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user || !userProfile) return;

      try {
        setError(null);
        console.log("🔍 Fetching properties for user:", user.id, "Role:", userProfile.role);

        let query = supabase
          .from('properties')
          .select(`
            id, title, status, created_at, owner_id,
            profiles!owner_id ( email, phone ),
            property_details ( rentAmount )
          `)
          .order('created_at', { ascending: false });

        if (userProfile.role === 'property_owner') {
          query = query.eq('owner_id', user.id);
        }

        const { data, error: fetchError } = await query;
        console.log("✅ Supabase Query Result:", data);
        console.log("⚠️ Supabase Error (if any):", fetchError);

        if (fetchError) throw fetchError;

        // Ensure property_details exists to prevent undefined errors
        const safeProperties = data.map((property) => ({
          ...property,
          property_details: property.property_details || {}
        }));

        setProperties(safeProperties || []);
      } catch (error) {
        console.error("❌ Error fetching properties:", error);
        setError("Failed to load properties. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user, userProfile, filter, isSupervisor]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">
        {isSupervisor() ? "All Properties" : "My Properties"}
      </h1>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties yet</h3>
          <p className="mt-1 text-sm text-gray-500">Try adding a new property.</p>
        </div>
      ) : (
        <PropertyList properties={properties} />
      )}
    </div>
  );
}
