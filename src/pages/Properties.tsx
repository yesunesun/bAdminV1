// src/pages/Properties.tsx
// Version: 1.6.2
// Last Modified: 2025-02-03T10:30:00+05:30 (IST)

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { PropertyList } from "@/components/property/PropertyList";
import { useNavigate } from "react-router-dom";

export default function Properties() {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle data fetching
  useEffect(() => {
    let isSubscribed = true;

    const fetchProperties = async () => {
      try {
        // If still loading auth or no user/profile, don't fetch yet
        if (authLoading || !user?.id || !userProfile) {
          return;
        }

        setLoading(true);
        setError(null);

        let query = supabase
          .from("properties")
          .select(`
            id,
            title,
            status,
            created_at,
            owner_id,
            price,
            address,
            city,
            state,
            property_details,
            profiles!owner_id (
              email,
              phone
            )
          `)
          .order('created_at', { ascending: false });

        if (userProfile.role === "property_owner") {
          query = query.eq("owner_id", user.id);
        }

        const { data: propertiesData, error: fetchError } = await query;

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (isSubscribed) {
          const safeProperties = (propertiesData || []).map(property => ({
            ...property,
            property_details: property.property_details || {}
          }));
          
          setProperties(safeProperties);
        }
      } catch (err: any) {
        if (isSubscribed) {
          console.error('Error fetching properties:', err);
          setError(err.message || 'Failed to load properties');
          setProperties([]);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchProperties();

    return () => {
      isSubscribed = false;
    };
  }, [authLoading, user?.id, userProfile]);

  // Handle authentication state
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // Show loading state while auth is initializing or data is loading
  if (authLoading || (loading && !properties.length)) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Don't render anything while redirecting to login
  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {userProfile.role === "property_owner" ? "My Properties" : "All Properties"}
        </h1>
        
        {userProfile.role === "property_owner" && (
          <button
            onClick={() => navigate('/properties/add')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add Property
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <PropertyList 
        properties={properties} 
        loading={loading}
        onDelete={(id) => {/* Implement delete handler */}}
        onTogglePublish={(id, status) => {/* Implement status toggle handler */}}
        isUpdating={null}
        showOwnerInfo={userProfile.role === 'supervisor'}
      />
    </div>
  );
}