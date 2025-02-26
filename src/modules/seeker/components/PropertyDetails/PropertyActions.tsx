// src/modules/seeker/components/PropertyDetails/PropertyActions.tsx
// Version: 1.0.0
// Last Modified: 26-02-2025 15:40 IST
// Purpose: Action buttons for property details page

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { submitVisitRequest, reportProperty } from '../../services/seekerService';
import { 
  HeartIcon, 
  CalendarIcon, 
  FlagIcon, 
  Share2Icon, 
  PrinterIcon 
} from 'lucide-react';

interface PropertyActionsProps {
  propertyId: string;
  isLiked: boolean;
  onToggleLike: () => Promise<{ success: boolean, message?: string }>;
}

const PropertyActions: React.FC<PropertyActionsProps> = ({ 
  propertyId, 
  isLiked, 
  onToggleLike 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Visit request modal state
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitMessage, setVisitMessage] = useState('');
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);
  
  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Handle like button click
  const handleLikeClick = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like properties",
        variant: "destructive"
      });
      return;
    }

    const { success, message } = await onToggleLike();
    
    if (!success && message) {
      toast({
        title: "Action Failed",
        description: message,
        variant: "destructive"
      });
    }
  };

  // Handle visit request submission
  const handleVisitRequest = async () => {
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

    setIsSubmittingVisit(true);
    
    try {
      await submitVisitRequest(
        propertyId, 
        user.id, 
        new Date(visitDate), 
        visitMessage
      );
      
      toast({
        title: "Visit Request Submitted",
        description: "Your visit request has been sent to the property owner",
        variant: "default"
      });
      
      setVisitModalOpen(false);
      setVisitDate('');
      setVisitMessage('');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Unable to submit your visit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingVisit(false);
    }
  };

  // Handle report submission
  const handleReportSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to report this property",
        variant: "destructive"
      });
      return;
    }

    if (!reportReason) {
      toast({
        title: "Reason Required",
        description: "Please select a reason for your report",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingReport(true);
    
    try {
      await reportProperty(
        propertyId, 
        user.id, 
        reportReason, 
        reportDescription
      );
      
      toast({
        title: "Report Submitted",
        description: "Thank you for your feedback. We will review this property.",
        variant: "default"
      });
      
      setReportModalOpen(false);
      setReportReason('');
      setReportDescription('');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Unable to submit your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Share property
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this property',
        url: window.location.href
      })
      .catch(() => {
        // Fallback if share fails
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Property link copied to clipboard",
          variant: "default"
        });
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Property link copied to clipboard",
        variant: "default"
      });
    }
  };

  // Print property details
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={isLiked ? "default" : "outline"}
          onClick={handleLikeClick}
          className={isLiked ? "bg-primary text-primary-foreground" : ""}
        >
          <HeartIcon className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
          {isLiked ? "Liked" : "Like"}
        </Button>

        <Button 
          variant="outline" 
          onClick={() => setVisitModalOpen(true)}
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Schedule Visit
        </Button>

        <Button 
          variant="ghost" 
          onClick={() => setReportModalOpen(true)}
        >
          <FlagIcon className="h-4 w-4 mr-2" />
          Report
        </Button>

        <Button 
          variant="ghost" 
          onClick={handleShare}
        >
          <Share2Icon className="h-4 w-4 mr-2" />
          Share
        </Button>

        <Button 
          variant="ghost" 
          onClick={handlePrint}
        >
          <PrinterIcon className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Visit Request Modal */}
      <Dialog open={visitModalOpen} onOpenChange={setVisitModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a Visit</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label 
                htmlFor="visit-date" 
                className="text-sm font-medium"
              >
                Preferred Visit Date
              </label>
              <Input
                id="visit-date"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
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
              onClick={() => setVisitModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVisitRequest} 
              disabled={isSubmittingVisit || !visitDate}
            >
              {isSubmittingVisit ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Property</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label 
                htmlFor="report-reason" 
                className="text-sm font-medium"
              >
                Reason for Report
              </label>
              <select
                id="report-reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="">Select a reason</option>
                <option value="inaccurate">Inaccurate Information</option>
                <option value="fraudulent">Fraudulent Listing</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="unavailable">Property Not Available</option>
                <option value="duplicate">Duplicate Listing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="report-description" 
                className="text-sm font-medium"
              >
                Additional Details
              </label>
              <Textarea
                id="report-description"
                placeholder="Please provide more details about your report"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReportSubmit} 
              disabled={isSubmittingReport || !reportReason}
            >
              {isSubmittingReport ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyActions;