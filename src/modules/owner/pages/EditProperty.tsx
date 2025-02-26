// src/modules/owner/pages/EditProperty.tsx
// Version: 2.1.1
// Last Modified: 26-02-2025 19:00 IST
// Purpose: Page for editing property listings with improved data handling

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyForm } from '../components/property/wizard/PropertyForm';
import { propertyService } from '../services/propertyService';
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Fixed import to default import
import { Card } from '@/components/ui/card';
import { Property, FormData } from '../components/property/PropertyFormTypes';

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [initialData, setInitialData] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        console.log('Fetching property with ID:', id);
        const propertyData = await propertyService.getPropertyById(id);
        
        console.log('Received property data:', propertyData);
        
        // Check if user is the owner
        if (propertyData.owner_id !== user.id) {
          setError('You do not have permission to edit this property');
          return;
        }
        
        setProperty(propertyData);
        
        // Extract initialData from property_details
        if (propertyData.property_details) {
          console.log('Setting form data from property_details');
          setInitialData(propertyData.property_details as FormData);
        } else {
          // Create form data from property if property_details not available
          console.log('Creating form data from property fields');
          const formData: FormData = {
            propertyType: '',
            listingType: 'rent',
            title: propertyData.title || '',
            bhkType: '',
            floor: '',
            totalFloors: '',
            propertyAge: '',
            facing: '',
            builtUpArea: propertyData.square_feet?.toString() || '',
            zone: '',
            locality: propertyData.city || '',
            landmark: '',
            address: propertyData.address || '',
            pinCode: propertyData.zip_code || '',
            rentalType: 'rent',
            rentAmount: propertyData.price?.toString() || '',
            securityDeposit: '',
            rentNegotiable: false,
            maintenance: '',
            availableFrom: '',
            preferredTenants: [],
            furnishing: '',
            parking: '',
            description: propertyData.description || '',
            amenities: [],
            bathrooms: propertyData.bathrooms?.toString() || '',
            balconies: '',
            hasGym: false,
            nonVegAllowed: false,
            gatedSecurity: false,
            propertyShowOption: '',
            propertyCondition: '',
            secondaryNumber: '',
            hasSimilarUnits: false,
            direction: ''
          };
          
          setInitialData(formData);
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property data');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <p className="mt-4 text-slate-600">Loading property data...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg my-8">
        <h2 className="text-lg font-semibold text-red-700">Error</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => navigate('/properties')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  if (!property || !initialData) {
    return (
      <div className="max-w-md mx-auto p-6 bg-yellow-50 border border-yellow-200 rounded-lg my-8">
        <h2 className="text-lg font-semibold text-yellow-700">No Data Available</h2>
        <p className="text-yellow-600">We couldn't find this property or the data is incomplete.</p>
        <button 
          onClick={() => navigate('/properties')}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  console.log('Rendering PropertyForm with initialData:', initialData);
  console.log('Property category:', property.property_details?.propertyType);
  console.log('Property ad type:', property.property_details?.listingType);

  return (
    <PropertyForm
      initialData={initialData}
      propertyId={id}
      mode="edit"
      status={property.status as 'draft' | 'published'}
      selectedCategory={property.property_details?.propertyType}
      selectedAdType={property.property_details?.listingType}
    />
  );
}