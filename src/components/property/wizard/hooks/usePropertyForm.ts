// src/components/property/wizard/hooks/usePropertyForm.ts
// Version: 1.3.0
// Last Modified: 2025-02-01T18:30:00+05:30 (IST)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { TEST_DATA } from '../test-data';
import { FormData } from '../types';

interface UsePropertyFormProps {
  initialData?: FormData;
  propertyId?: string;
  mode?: 'create' | 'edit';
  status?: 'draft' | 'published' | 'pending_review' | 'rejected';
}

export function usePropertyForm({ 
  initialData, 
  propertyId,
  mode = 'create',
  status: initialStatus = 'draft'
}: UsePropertyFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(null);
  const [status, setStatus] = useState(initialStatus);

  const form = useForm<FormData>({
    defaultValues: initialData || {},
  });

  const handleAutoFill = () => {
    form.reset(TEST_DATA);
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSaveAsDraft = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      const formData = form.getValues();
      const propertyData = {
        ...formData,
        owner_id: user.id,
        status: 'draft',
        updated_at: new Date().toISOString(),
      };

      if (mode === 'create') {
        propertyData.created_at = new Date().toISOString();
        const { data, error } = await supabase
          .from('properties')
          .insert([propertyData])
          .select()
          .single();

        if (error) throw error;
        setSavedPropertyId(data.id);
        setStatus('draft');
      } else if (propertyId) {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', propertyId);

        if (error) throw error;
        setStatus('draft');
      }

      handleNextStep();
    } catch (err) {
      console.error('Error saving property:', err);
      setError('Failed to save property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndPublish = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      const formData = form.getValues();
      const propertyData = {
        ...formData,
        owner_id: user.id,
        status: 'pending_review', // Changed from 'published' to 'pending_review'
        updated_at: new Date().toISOString(),
      };

      if (mode === 'create') {
        propertyData.created_at = new Date().toISOString();
        const { data, error } = await supabase
          .from('properties')
          .insert([propertyData])
          .select()
          .single();

        if (error) throw error;
        setSavedPropertyId(data.id);
        setStatus('pending_review');
      } else if (propertyId) {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', propertyId);

        if (error) throw error;
        setStatus('pending_review');
      }

      handleNextStep();
    } catch (err) {
      console.error('Error publishing property:', err);
      setError('Failed to publish property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!propertyId || !user) return;
    setSaving(true);
    setError(null);

    try {
      const formData = form.getValues();
      const { error } = await supabase
        .from('properties')
        .update({
          ...formData,
          status: status === 'rejected' ? 'pending_review' : status, // If rejected, set to pending_review
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId);

      if (error) throw error;
      if (status === 'rejected') {
        setStatus('pending_review');
      }
      navigate('/properties');
    } catch (err) {
      console.error('Error updating property:', err);
      setError('Failed to update property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUploadComplete = () => {
    navigate('/properties');
  };

  return {
    form,
    currentStep,
    error,
    saving,
    savedPropertyId,
    user,
    status,
    handleAutoFill,
    handleNextStep,
    handlePreviousStep,
    handleSaveAsDraft,
    handleSaveAndPublish,
    handleUpdate,
    handleImageUploadComplete,
    setCurrentStep,
  };
}