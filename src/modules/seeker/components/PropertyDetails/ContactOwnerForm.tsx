// src/modules/seeker/components/PropertyDetails/ContactOwnerForm.tsx
// Version: 1.0.1
// Last Modified: 06-04-2025 13:00 IST
// Purpose: Contact property owner form with improved validation and feedback

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CalendarIcon, Loader2 } from 'lucide-react';

interface ContactOwnerFormProps {
  propertyTitle: string;
  propertyId: string;
  ownerId: string;
  onSuccess: () => void;
}

const ContactOwnerForm: React.FC<ContactOwnerFormProps> = ({
  propertyTitle,
  propertyId,
  ownerId,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [visitDate, setVisitDate] = useState<string>('');
  const [message, setMessage] = useState(`I'm interested in this property: ${propertyTitle}`);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to contact property owner",
        variant: "destructive"
      });
      return;
    }
    
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message for the property owner",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create a visit request in property_visits table
      const { error } = await supabase
        .from('property_visits')
        .insert({
          property_id: propertyId,
          user_id: user.id,
          visit_date: visitDate ? new Date(visitDate).toISOString() : null,
          message: message,
          status: 'pending',
          created_at: new Date().toISOString()
        });
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Request sent successfully",
        description: "The property owner will contact you soon",
        variant: "default"
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error sending request",
        description: "Failed to send your request. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogTitle>Contact Property Owner</DialogTitle>
      <DialogDescription>
        Fill out this form to send a message to the property owner.
      </DialogDescription>
      
      <div className="space-y-2">
        <Label htmlFor="visitDate">When would you like to visit? (Optional)</Label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="visitDate"
            type="date"
            className="pl-10"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message" className="after:content-['*'] after:ml-0.5 after:text-destructive">Message</Label>
        <Textarea
          id="message"
          rows={5}
          placeholder="Introduce yourself and ask any questions you have about the property..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      
      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Your information is secure and will only be shared with the property owner.
      </p>
    </form>
  );
};

export default ContactOwnerForm;