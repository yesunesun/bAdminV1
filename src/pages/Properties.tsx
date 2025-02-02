// src/pages/Properties.tsx
// Version: 1.5.8
// Last Modified: 2025-02-02T22:30:00+05:30 (IST)

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { PropertyList } from "@/components/property/PropertyList";
import { useNavigate } from "react-router-dom";

// Define TypeScript interfaces for our data structures
interface PropertyProfile {
  email: string;
  phone: string;
}

interface Property {
  id: string;
  title: string;
  status: string;
  created_at: string;
  owner_id: string;
  profiles: PropertyProfile;
  property_details: Record<string, any>;
}

export default function Properties() {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug log for auth state
  // useEffect(() => {
  //   console.log('Auth State:', {
  //     authenticated: !!user,
  //     userId: user?.id,
  //     userEmail: userProfile?.email,
  //     hasProfile: !!userProfile,
  //     userRole: userProfile?.role,
  //     loading: authLoading
  //   });
  // }, [user, userProfile, authLoading]);

  // Authentication check effect
  useEffect(() => {
    if (!authLoading && !user) {
      // console.log('No authenticated user, redirecting to login');
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // Data fetching effect
  useEffect(() => {
    let isSubscribed = true;

    const fetchProperties = async () => {
      if (!user?.id || !userProfile) {
        console.log('Skipping fetch - missing user data:', {
          hasUser: !!user,
          hasProfile: !!userProfile
        });
        return;
      }

      try {
        console.log('Starting properties fetch:', {
          userId: user.id,
          userRole: userProfile.role,
          timestamp: new Date().toISOString()
        });

        setLoading(true);
        setError(null);

        // Construct the query
        let query = supabase
          .from("properties")
          .select(`
            id,
            title,
            status,
            created_at,
            owner_id,
            property_details,
            profiles!owner_id (
              email,
              phone
            )
          `)
          .order('created_at', { ascending: false });

        // Add role-based filtering
        if (userProfile.role === "property_owner") {
          console.log('Applying owner filter:', user.id);
          query = query.eq("owner_id", user.id);
        }

        // Execute the query
        console.log('Executing Supabase query...');
        const { data: propertiesData, error: fetchError } = await query;

        // Log the response
        console.log('Query response:', {
          success: !fetchError,
          dataReceived: !!propertiesData,
          count: propertiesData?.length,
          error: fetchError?.message,
          timestamp: new Date().toISOString()
        });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (isSubscribed) {
          const safeProperties = (propertiesData || []).map(property => ({
            ...property,
            property_details: property.property_details || {}
          }));

          console.log('Setting properties:', {
            count: safeProperties.length,
            firstItemId: safeProperties[0]?.id
          });

          setProperties(safeProperties);
        }
      } catch (err: any) {
        console.error('Properties fetch error:', {
          message: err.message,
          timestamp: new Date().toISOString()
        });
        
        if (isSubscribed) {
          setError(err.message || 'Failed to load properties');
          setProperties([]); // Reset properties on error
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
          console.log('Fetch complete, final state:', {
            propertiesCount: properties.length,
            hasError: !!error,
            timestamp: new Date().toISOString()
          });
        }
      }
    };

    fetchProperties();

    return () => {
      isSubscribed = false;
      console.log('Cleanup: cancelling property fetch');
    };
  }, [user?.id, userProfile?.role]);

  // Handle loading state
  if (authLoading) {
    console.log('Rendering loading state');
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Handle unauthorized state
  if (!user || !userProfile) {
    console.log('Rendering unauthorized state');
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
            onClick={() => {
              console.log('Navigating to add property');
              navigate('/properties/add');
            }}
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
      />
    </div>
  );
}