// src/modules/seeker/components/PropertyDetails/OwnerContact.tsx
// Version: 2.0.0
// Last Modified: 01-03-2025 15:30 IST
// Purpose: Enhanced contact component with improved form UX and visual design

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PhoneIcon, 
  MailIcon, 
  UserIcon, 
  AlertCircleIcon, 
  MessageSquareIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from 'lucide-react';
// Remove separator import as it's not available

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
  const [messageSent, setMessageSent] = useState(false);
  
  // Required field validation
  const isFormValid = contactName.trim() && contactEmail.trim() && contactMessage.trim();

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
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
      
      setMessageSent(true);
      setIsSubmitting(false);
    }, 1500);
  };

  const resetForm = () => {
    setMessageSent(false);
    setContactMessage('');
  };

  // Show a success message if the message was sent
  if (messageSent) {
    return (
      <Card className="border-primary/20 bg-gradient-to-b from-background to-primary/5">
        <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircleIcon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
          <p className="text-muted-foreground mb-6">
            Your message has been sent to the property owner. They will contact you soon.
          </p>
          <Button onClick={resetForm} className="w-full">
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show a message if owner data is not available
  if (!ownerData) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center">
            <MessageSquareIcon className="h-5 w-5 mr-2 text-primary" />
            Contact Property Owner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center p-4 bg-muted/50 rounded-md">
            <AlertCircleIcon className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Owner contact information is not available at the moment. Please try again later.
            </p>
          </div>
          
          {/* Still show the contact form for inquiries */}
          <form onSubmit={handleContactSubmit} className="space-y-4 mt-6">
            <h3 className="text-lg font-medium">Send a General Inquiry</h3>
            
            <div className="space-y-2">
              <label htmlFor="contact-name" className="text-sm font-medium">
                Your Name <span className="text-destructive">*</span>
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
                Email Address <span className="text-destructive">*</span>
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
                Message <span className="text-destructive">*</span>
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
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Sending...
                </>
              ) : "Send Inquiry"}
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              <p>Your information is secure and will only be shared with the owner</p>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="pb-2 border-b border-border/30">
        <CardTitle className="text-xl flex items-center">
          <MessageSquareIcon className="h-5 w-5 mr-2 text-primary" />
          Contact Property Owner
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Owner contact info with styled container */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border/50">
          {ownerData.email && (
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <MailIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <a href={`mailto:${ownerData.email}`} className="text-primary hover:underline font-medium">
                  {ownerData.email}
                </a>
              </div>
            </div>
          )}
          
          {ownerData.phone && (
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <PhoneIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <a href={`tel:${ownerData.phone}`} className="text-primary hover:underline font-medium">
                  {ownerData.phone}
                </a>
              </div>
            </div>
          )}
        </div>
        
        {/* Custom separator with text */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-2 text-xs text-muted-foreground">OR SEND A MESSAGE</span>
          </div>
        </div>
        
        {/* Contact form */}
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="contact-name" className="text-sm font-medium">
              Your Name <span className="text-destructive">*</span>
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
              Email Address <span className="text-destructive">*</span>
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
              Message <span className="text-destructive">*</span>
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
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                Sending...
              </>
            ) : "Send Message"}
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            <p>Your information is secure and will only be shared with the owner</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OwnerContact;