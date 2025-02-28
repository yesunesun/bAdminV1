// src/modules/seeker/components/PropertyDetails/PropertyActions.tsx
// Version: 2.0.0
// Last Modified: 01-03-2025 14:45 IST
// Purpose: Enhanced action buttons with responsive support and visual improvements

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
  PrinterIcon,
  PhoneIcon,
  MessageSquareIcon
} from 'lucide-react';

interface PropertyActionsProps {
  propertyId: string;
  isLiked: boolean;
  onToggleLike: () => Promise<{ success: boolean, message?: string }>;
  layout?: 'horizontal' | 'vertical' | 'compact';
}

const PropertyActions: React.FC<PropertyActionsProps> = ({ 
  propertyId, 
  isLiked, 
  onToggleLike,
  layout = 'horizontal'
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Visit request modal state
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
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
    } else if (success) {
      toast({
        title: isLiked ? "Property Removed from Favorites" : "Property Added to Favorites",
        description: isLiked ? "This property has been removed from your favorites" : "This property has been added to your favorites",
        variant: "default"
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
      
      setVisitModalOpen(false);
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

  // Horizontal layout for desktop view
  if (layout === 'horizontal') {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isLiked ? "default" : "outline"}
            onClick={handleLikeClick}
            className={isLiked ? "bg-primary text-primary-foreground" : ""}
            size="sm"
          >
            <HeartIcon className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
            {isLiked ? "Saved" : "Save"}
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setVisitModalOpen(true)}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Schedule Visit
          </Button>

          <Button 
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2Icon className="h-4 w-4 mr-2" />
            Share
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setReportModalOpen(true)}
          >
            <FlagIcon className="h-4 w-4 mr-2" />
            Report
          </Button>
        </div>

        {/* Modals */}
        {renderModals()}
      </>
    );
  }

  // Vertical layout for mobile view
  if (layout === 'vertical') {
    return (
      <>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={isLiked ? "default" : "outline"}
              onClick={handleLikeClick}
              className={`${isLiked ? "bg-primary text-primary-foreground" : ""} flex justify-center`}
            >
              <HeartIcon className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
              {isLiked ? "Saved" : "Save"}
            </Button>

            <Button 
              variant="outline" 
              onClick={() => setVisitModalOpen(true)}
              className="flex justify-center"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule Visit
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex justify-center"
            >
              <Share2Icon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline ml-1">Share</span>
            </Button>

            <Button 
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex justify-center"
            >
              <PrinterIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline ml-1">Print</span>
            </Button>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setReportModalOpen(true)}
              className="flex justify-center"
            >
              <FlagIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline ml-1">Report</span>
            </Button>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-3">
            <Button 
              variant="default"
              className="bg-primary text-primary-foreground flex justify-center"
            >
              <PhoneIcon className="h-4 w-4 mr-2" />
              Call Owner
            </Button>

            <Button 
              variant="secondary"
              className="flex justify-center"
            >
              <MessageSquareIcon className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </div>

        {/* Modals */}
        {renderModals()}
      </>
    );
  }

  // Compact layout for inline use
  if (layout === 'compact') {
    return (
      <>
        <div className="flex items-center gap-1">
          <Button
            variant={isLiked ? "default" : "ghost"}
            size="icon"
            onClick={handleLikeClick}
            className={`rounded-full h-9 w-9 ${isLiked ? "bg-primary text-primary-foreground" : ""}`}
          >
            <HeartIcon className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          </Button>

          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setVisitModalOpen(true)}
            className="rounded-full h-9 w-9"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="rounded-full h-9 w-9"
          >
            <Share2Icon className="h-4 w-4" />
          </Button>
        </div>

        {/* Modals */}
        {renderModals()}
      </>
    );
  }

  // Render the visit and report modals
  function renderModals() {
    return (
      <>
        {/* Visit Request Modal */}
        <Dialog open={visitModalOpen} onOpenChange={setVisitModalOpen}>
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
                  className="text-sm font-medium flex items-center"
                >
                  Reason for Report <span className="text-destructive ml-1">*</span>
                </label>
                <select
                  id="report-reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
  }

  // Default fallback to horizontal layout
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={isLiked ? "default" : "outline"}
          onClick={handleLikeClick}
          className={isLiked ? "bg-primary text-primary-foreground" : ""}
        >
          <HeartIcon className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
          {isLiked ? "Saved" : "Save"}
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

      {/* Modals */}
      {renderModals()}
    </>
  );
};

export default PropertyActions;