// src/modules/seeker/components/PropertyDetails/OwnerContact.tsx
// Version: 1.1.0
// Last Modified: 27-02-2025 10:30 IST
// Purpose: Owner contact information and contact form with null safety

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PhoneIcon, MailIcon, UserIcon, AlertCircleIcon } from 'lucide-react';

interface OwnerContactProps {
  ownerData?: {
    id: string;
    email: string;
    phone?: string;
  } | null;
  propertyTitle: string;
}

const OwnerContact: React.FC<OwnerContactProps> = ({ ownerData, propertyTitle }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [contactName, setContactName] = useState(user?.user_metadata?.full_name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactName || !contactEmail || !contactMessage) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Here you would integrate with your contact service
    // For now, we'll simulate a successful submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the property owner",
        variant: "default"
      });
      
      // Don't clear the form in case they want to send another message
      setIsSubmitting(false);
    }, 1000);
  };

  // Show a message if owner data is not available
  if (!ownerData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contact Property Owner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center p-4 bg-muted/50 rounded-md">
            <AlertCircleIcon className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Owner contact information is not available at the moment. Please try again later.
            </p>
          </div>
          
          {/* Still show the contact form for inquiries */}
          <form onSubmit={handleContactSubmit} className="space-y-4 mt-6">
            <h3 className="text-lg font-medium">Send a General Inquiry</h3>
            
            <div className="space-y-2">
              <label htmlFor="contact-name" className="text-sm font-medium">
                Your Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="contact-email" className="text-sm font-medium">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Your email address"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="contact-phone" className="text-sm font-medium">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Your phone number (optional)"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="contact-message" className="text-sm font-medium">
                Message <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="contact-message"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder={`I'm interested in this property: ${propertyTitle}`}
                rows={4}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Inquiry"}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              By submitting this form, you agree to our terms of service and privacy policy.
            </p>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Contact Property Owner</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Owner contact info */}
        <div className="space-y-3">
          {ownerData.email && (
            <div className="flex items-center">
              <MailIcon className="h-5 w-5 mr-2 text-muted-foreground" />
              <a href={`mailto:${ownerData.email}`} className="text-primary hover:underline">
                {ownerData.email}
              </a>
            </div>
          )}
          
          {ownerData.phone && (
            <div className="flex items-center">
              <PhoneIcon className="h-5 w-5 mr-2 text-muted-foreground" />
              <a href={`tel:${ownerData.phone}`} className="text-primary hover:underline">
                {ownerData.phone}
              </a>
            </div>
          )}
        </div>
        
        {/* Contact form */}
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <h3 className="text-lg font-medium">Send a Message</h3>
          
          <div className="space-y-2">
            <label htmlFor="contact-name" className="text-sm font-medium">
              Your Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="contact-name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Your full name"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="contact-email" className="text-sm font-medium">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Your email address"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="contact-phone" className="text-sm font-medium">
              Phone Number
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="contact-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Your phone number (optional)"
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="contact-message" className="text-sm font-medium">
              Message <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="contact-message"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder={`I'm interested in this property: ${propertyTitle}`}
              rows={4}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            By submitting this form, you agree to our terms of service and privacy policy.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default OwnerContact;