// src/modules/seeker/components/PropertyDetails/PropertyTitleEditor.tsx
// Version: 1.0.0
// Last Modified: 21-05-2025 18:30 IST
// Purpose: Inline title editor for property details page that updates only flow.title

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Edit2, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyTitleEditorProps {
  propertyId: string;
  title: string;
  ownerId: string;
  onTitleUpdated: (newTitle: string) => void;
}

const PropertyTitleEditor: React.FC<PropertyTitleEditorProps> = ({ 
  propertyId, 
  title, 
  ownerId,
  onTitleUpdated 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check if current user is the owner of the property
  const isOwner = user?.id === ownerId;
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  const startEditing = () => {
    setNewTitle(title);
    setIsEditing(true);
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setNewTitle(title);
  };
  
  const saveTitle = async () => {
    if (newTitle.trim() === title) {
      setIsEditing(false);
      return;
    }
    
    if (newTitle.trim() === '') {
      toast({
        title: "Title cannot be empty",
        description: "Please enter a valid title for your property",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, fetch the current property data
      const { data: propertyData, error: fetchError } = await supabase
        .from('properties_v2')
        .select('property_details')
        .eq('id', propertyId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (!propertyData || !propertyData.property_details) {
        throw new Error('Property data not found');
      }
      
      // Create a deep copy of the property_details to avoid mutations
      const updatedDetails = JSON.parse(JSON.stringify(propertyData.property_details));
      
      // Ensure flow object exists and update only flow.title
      if (!updatedDetails.flow) {
        updatedDetails.flow = { title: newTitle };
      } else {
        updatedDetails.flow.title = newTitle;
      }
      
      // Do NOT update root level title - only flow.title should be updated
      
      // Update meta.updated_at timestamp if it exists
      if (updatedDetails.meta) {
        updatedDetails.meta.updated_at = new Date().toISOString();
      }
      
      // Save the updated property details to the database
      const { error: updateError } = await supabase
        .from('properties_v2')
        .update({
          property_details: updatedDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId);
      
      if (updateError) throw updateError;
      
      // Update local title
      onTitleUpdated(newTitle);
      
      toast({
        title: "Title updated",
        description: "Property title has been updated successfully",
        variant: "default"
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating property title:', error);
      toast({
        title: "Failed to update title",
        description: "There was an error updating the property title. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle keyboard shortcuts (Enter to save, Escape to cancel)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };
  
  return (
    <div className="relative">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="py-1 text-2xl sm:text-3xl font-bold"
            placeholder="Enter property title"
            disabled={isLoading}
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={saveTitle}
              disabled={isLoading}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={cancelEditing}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
          {isOwner && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={startEditing}
              title="Edit title"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyTitleEditor;