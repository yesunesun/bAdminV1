// src/modules/owner/pages/EditProperty.tsx
// Version: 3.4.0
// Last Modified: 07-03-2025 00:15 IST
// Purpose: Added flatPlotNo field handling

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyForm } from '../components/property/wizard/PropertyForm';
import { propertyService } from '../services/propertyService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/card';
import { Property, FormData } from '../components/property/PropertyFormTypes';

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [initialData, setInitialData] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formDataReady, setFormDataReady] = useState(false);
  
  // Get current step from URL query parameter
  const stepParam = searchParams.get('step');

  // Force navigation to details tab if no step is specified
  useEffect(() => {
    if (id && !stepParam && !loading && property) {
      console.log('No step specified in edit mode, redirecting to details tab');
      navigate(`/properties/${id}/edit?step=details`, { replace: true });
    }
  }, [id, stepParam, navigate, loading, property]);

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
          
          // Check for the flatPlotNo field
          if (propertyData.property_details.flatPlotNo !== undefined) {
            console.log('flatPlotNo field found in property_details:', propertyData.property_details.flatPlotNo);
          } else {
            console.log('flatPlotNo field not found in property_details - will initialize with empty string');
          }
          
          // Ensure all required fields exist
          const formData = {
            propertyType: propertyData.property_details.propertyType || '',
            listingType: propertyData.property_details.listingType || 'rent',
            title: propertyData.title || '',
            bhkType: propertyData.property_details.bhkType || '',
            floor: propertyData.property_details.floor || '',
            totalFloors: propertyData.property_details.totalFloors || '',
            propertyAge: propertyData.property_details.propertyAge || '',
            facing: propertyData.property_details.facing || '',
            builtUpArea: propertyData.property_details.builtUpArea || propertyData.square_feet?.toString() || '',
            builtUpAreaUnit: propertyData.property_details.builtUpAreaUnit || 'sqft',
            possessionDate: propertyData.property_details.possessionDate || '',
            zone: propertyData.property_details.zone || '',
            locality: propertyData.property_details.locality || propertyData.city || '',
            landmark: propertyData.property_details.landmark || '',
            address: propertyData.property_details.address || propertyData.address || '',
            flatPlotNo: propertyData.property_details.flatPlotNo || '', // Explicitly include flatPlotNo field
            pinCode: propertyData.property_details.pinCode || propertyData.zip_code || '',
            rentalType: propertyData.property_details.rentalType || 'rent',
            rentAmount: propertyData.property_details.rentAmount || propertyData.price?.toString() || '',
            securityDeposit: propertyData.property_details.securityDeposit || '',
            rentNegotiable: propertyData.property_details.rentNegotiable || false,
            maintenance: propertyData.property_details.maintenance || '',
            availableFrom: propertyData.property_details.availableFrom || '',
            preferredTenants: propertyData.property_details.preferredTenants || [],
            furnishing: propertyData.property_details.furnishing || '',
            parking: propertyData.property_details.parking || '',
            description: propertyData.property_details.description || propertyData.description || '',
            amenities: propertyData.property_details.amenities || [],
            bathrooms: propertyData.property_details.bathrooms || propertyData.bathrooms?.toString() || '',
            balconies: propertyData.property_details.balconies || '',
            hasGym: propertyData.property_details.hasGym || false,
            nonVegAllowed: propertyData.property_details.nonVegAllowed || false,
            gatedSecurity: propertyData.property_details.gatedSecurity || false,
            propertyShowOption: propertyData.property_details.propertyShowOption || '',
            propertyCondition: propertyData.property_details.propertyCondition || '',
            secondaryNumber: propertyData.property_details.secondaryNumber || '',
            hasSimilarUnits: propertyData.property_details.hasSimilarUnits || false,
            direction: propertyData.property_details.direction || ''
          };
          
          // Log the populated form data for debugging
          console.log('Populated form data for edit:', {
            propertyType: formData.propertyType,
            bhkType: formData.bhkType,
            address: formData.address,
            flatPlotNo: formData.flatPlotNo, // Log flatPlotNo field for debugging
            pinCode: formData.pinCode
          });
          
          // Store in local storage as a direct workaround
          if (user?.id) {
            const storageKey = `propertyWizard_${user.id}_${id}_data`;
            localStorage.setItem(storageKey, JSON.stringify(formData));
            console.log('Saved form data to localStorage for direct access');
            
            // Always set step to 1 (details) in localStorage
            localStorage.setItem(`propertyWizard_${user.id}_${id}_step`, '1');
            console.log('Reset step to 1 (details) in localStorage');
          }
          
          setInitialData(formData as FormData);
          // Mark form data as ready
          setFormDataReady(true);
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
            builtUpAreaUnit: 'sqft', // Default to 'sqft' for new properties
            possessionDate: '',
            zone: '',
            locality: propertyData.city || '',
            landmark: '',
            address: propertyData.address || '',
            flatPlotNo: '', // Initialize empty flatPlotNo field
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
          
          // Store in local storage as a direct workaround
          if (user?.id) {
            const storageKey = `propertyWizard_${user.id}_${id}_data`;
            localStorage.setItem(storageKey, JSON.stringify(formData));
            console.log('Saved form data to localStorage for direct access');
            
            // Always set step to 1 (details) in localStorage
            localStorage.setItem(`propertyWizard_${user.id}_${id}_step`, '1');
            console.log('Reset step to 1 (details) in localStorage');
          }
          
          setInitialData(formData);
          // Mark form data as ready
          setFormDataReady(true);
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property data');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, user, navigate]);

  // Log step parameter when it changes
  useEffect(() => {
    console.log('Current step from URL query parameter:', stepParam);
  }, [stepParam]);

  // Force inputs to have values when they appear on screen
  useEffect(() => {
    if (formDataReady && initialData) {
      // We need to force edit mode forms to show their values
      // This is a direct fix that doesn't depend on react-hook-form
      setTimeout(() => {
        console.log('Attempting direct DOM manipulation to fill form values');
        
        // Try to find form inputs and set values directly
        // For select inputs (dropdown values)
        document.querySelectorAll('select').forEach(select => {
          const name = select.name || select.id;
          if (name && initialData[name as keyof FormData] !== undefined) {
            try {
              select.value = String(initialData[name as keyof FormData] || '');
            } catch (e) {
              console.error('Error setting select value:', e);
            }
          }
        });
        
        // For text/number inputs
        document.querySelectorAll('input').forEach(input => {
          const name = input.name || input.id;
          if (name && initialData[name as keyof FormData] !== undefined) {
            try {
              // Handle checkbox inputs differently
              if (input.type === 'checkbox') {
                (input as HTMLInputElement).checked = Boolean(initialData[name as keyof FormData]);
              } else {
                input.value = String(initialData[name as keyof FormData] || '');
              }
              
              // Special handling for flatPlotNo
              if (name === 'flatPlotNo') {
                console.log('Setting flatPlotNo input value to:', initialData.flatPlotNo || '');
                input.value = initialData.flatPlotNo || '';
              }
            } catch (e) {
              console.error('Error setting input value:', e);
            }
          }
        });
        
        // For textarea inputs
        document.querySelectorAll('textarea').forEach(textarea => {
          const name = textarea.name || textarea.id;
          if (name && initialData[name as keyof FormData] !== undefined) {
            try {
              textarea.value = String(initialData[name as keyof FormData] || '');
            } catch (e) {
              console.error('Error setting textarea value:', e);
            }
          }
        });
        
        console.log('Direct DOM manipulation finished');
      }, 1000); // Allow time for the form to render
    }
  }, [formDataReady, initialData]);

  // Additional effect specifically for flatPlotNo
  useEffect(() => {
    if (formDataReady && initialData && initialData.flatPlotNo !== undefined) {
      // Add additional timeout to ensure flatPlotNo is set after initial render
      setTimeout(() => {
        const flatPlotInput = document.querySelector('input[name="flatPlotNo"]');
        if (flatPlotInput) {
          console.log('Found flatPlotNo input, setting value to:', initialData.flatPlotNo);
          flatPlotInput.value = initialData.flatPlotNo || '';
        } else {
          console.warn('flatPlotNo input not found in the DOM');
        }
      }, 1500);
    }
  }, [formDataReady, initialData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner message="Loading property data..." />
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
  console.log('Property category:', initialData.propertyType);
  console.log('Property ad type:', initialData.listingType);
  console.log('Current step from URL:', stepParam);

  return (
    <>
      {/* Debug form values button */}
      {process.env.NODE_ENV === 'development' && (
        <div className="max-w-5xl mx-auto mb-4 p-2 bg-yellow-100 rounded-lg">
          <button
            onClick={() => {
              // Reload form values from localStorage as a workaround
              if (user?.id) {
                const storageKey = `propertyWizard_${user.id}_${id}_data`;
                const savedData = localStorage.getItem(storageKey);
                if (savedData) {
                  try {
                    const formData = JSON.parse(savedData);
                    console.log('Retrieved form data from localStorage:', formData);
                    
                    // Attempt to manually update inputs
                    document.querySelectorAll('select, input, textarea').forEach(elem => {
                      const name = elem.name || elem.id;
                      if (name && formData[name] !== undefined) {
                        if (elem instanceof HTMLSelectElement) {
                          elem.value = String(formData[name] || '');
                        } else if (elem instanceof HTMLInputElement) {
                          if (elem.type === 'checkbox') {
                            elem.checked = Boolean(formData[name]);
                          } else {
                            elem.value = String(formData[name] || '');
                          }
                        } else if (elem instanceof HTMLTextAreaElement) {
                          elem.value = String(formData[name] || '');
                        }
                        
                        // Special handling for flatPlotNo
                        if (name === 'flatPlotNo') {
                          console.log('Setting flatPlotNo input value to:', formData.flatPlotNo || '');
                          elem.value = formData.flatPlotNo || '';
                        }
                      }
                    });
                    
                    console.log('Manual input value update completed');
                  } catch (e) {
                    console.error('Error parsing form data from localStorage:', e);
                  }
                }
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Reload Form Values
          </button>
          
          {/* Add debug button for flatPlotNo field specifically */}
          <button
            onClick={() => {
              const flatPlotInput = document.querySelector('input[name="flatPlotNo"]');
              if (flatPlotInput) {
                console.log('Current flatPlotNo input value:', flatPlotInput.value);
                console.log('initialData.flatPlotNo value:', initialData.flatPlotNo);
                
                // Force the value
                flatPlotInput.value = initialData.flatPlotNo || '';
                console.log('Force-set flatPlotNo input value to:', initialData.flatPlotNo || '');
                
                // Create a change event to ensure React catches the change
                const event = new Event('input', { bubbles: true });
                flatPlotInput.dispatchEvent(event);
              } else {
                console.warn('flatPlotNo input not found in the DOM');
              }
            }}
            className="ml-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Debug Flat/Plot No
          </button>
        </div>
      )}
      
      <PropertyForm
        initialData={initialData}
        propertyId={id}
        mode="edit"
        status={property.status as 'draft' | 'published'}
        selectedCategory={initialData.propertyType}
        selectedAdType={initialData.listingType}
        currentStep={stepParam || "details"} // Default to details if no step is specified
      />
    </>
  );
}