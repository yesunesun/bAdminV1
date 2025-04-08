// src/modules/seeker/components/PropertyDetails/VisitRequestDialog.tsx
// Version: 1.0.0
// Last Modified: 08-04-2025 15:55 IST
// Purpose: Visit request dialog component

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { submitVisitRequest } from '../../services/seekerService';

interface VisitRequestDialogProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VisitRequestDialog: React.FC<VisitRequestDialogProps> = ({
  propertyId,
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitMessage, setVisitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to schedule a visit",
        variant: "destructive"
      });
      return;
    }

    if (!visitDate) {
      toast({
        title: "Date Required",
        description: "Please select a preferred date for your visit",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Format datetime by combining date and time
    const visitDateTime = visitTime 
      ? new Date(`${visitDate}T${visitTime}`)
      : new Date(visitDate);
    
    try {
      await submitVisitRequest(
        propertyId, 
        user.id, 
        visitDateTime, 
        visitMessage
      );
      
      toast({
        title: "Visit Request Submitted",
        description: "Your visit request has been sent to the property owner",
        variant: "default"
      });
      
      // Reset form and close dialog
      onOpenChange(false);
      setVisitDate('');
      setVisitTime('');
      setVisitMessage('');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Unable to submit your visit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule a Visit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label 
                htmlFor="visit-date" 
                className="text-sm font-medium flex items-center"
              >
                Preferred Date <span className="text-destructive ml-1">*</span>
              </label>
              <Input
                id="visit-date"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label 
                htmlFor="visit-time" 
                className="text-sm font-medium"
              >
                Preferred Time
              </label>
              <Input
                id="visit-time"
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="visit-message" 
              className="text-sm font-medium"
            >
              Message to Owner (Optional)
            </label>
            <Textarea
              id="visit-message"
              placeholder="Any specific details or questions about your visit"
              value={visitMessage}
              onChange={(e) => setVisitMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !visitDate}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VisitRequestDialog;