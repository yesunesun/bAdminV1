// src/modules/seeker/services/visitService.ts
// Version: 1.0.0
// Last Modified: 09-05-2025 13:30 IST
// Purpose: Handle property visit requests and reporting

import { supabase } from '@/lib/supabase';

// Submit visit request for a property
export const submitVisitRequest = async (
  propertyId: string,
  userId: string,
  visitDate: Date,
  message?: string
) => {
  try {
    const { data, error } = await supabase
      .from('property_visits')
      .insert({
        property_id: propertyId,
        user_id: userId,
        visit_date: visitDate.toISOString(),
        message: message || null,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error submitting visit request:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error submitting visit request:', error);
    throw error;
  }
};

// Report property
export const reportProperty = async (
  propertyId: string,
  userId: string,
  reason: string,
  description?: string
) => {
  try {
    // Insert the report into a property_visits table or a general reports table
    const { data, error } = await supabase
      .from('property_visits')
      .insert({
        property_id: propertyId,
        user_id: userId,
        status: 'reported',
        message: `Reason: ${reason}${description ? ` - Details: ${description}` : ''}`,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error reporting property:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error reporting property:', error);
    throw error;
  }
};