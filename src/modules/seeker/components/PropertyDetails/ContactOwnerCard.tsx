// src/modules/seeker/components/PropertyDetails/ContactOwnerCard.tsx
// Version: 2.0.0
// Last Modified: 27-01-2025 11:00 IST
// Purpose: Enhanced contact owner card with design system, Indian formatting, and improved UX

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  User,
  Shield,
  LogIn
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ContactOwnerForm from './ContactOwnerForm';
import { 
  spacing, 
  typography, 
  colors,
  animations,
  cn 
} from '@/lib/utils';
import { formatIndianPhone } from '@/lib/utils';

interface ContactOwnerCardProps {
  propertyTitle: string;
  propertyId: string;
  ownerId: string;
  ownerInfo?: {
    email?: string;
    phone?: string;
    name?: string;
  } | null;
}

const ContactOwnerCard: React.FC<ContactOwnerCardProps> = ({
  propertyTitle,
  propertyId,
  ownerId,
  ownerInfo
}) => {
  const { user } = useAuth();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  
  return (
    <Card className={cn(
      "border-border/50 shadow-lg bg-gradient-to-br from-card via-card to-card/95",
      animations.hoverLift
    )}>
      <CardContent className={spacing.cardPadding}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <h3 className={typography.h3}>Contact Property Owner</h3>
        </div>
        
        {user ? (
          <div className={spacing.contentY}>
            {/* Owner Information Section */}
            {ownerInfo ? (
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className={typography.fieldLabel}>Listed by:</span>
                </div>
                
                <div className={spacing.contentYSmall}>
                  {/* Owner Name/Email */}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-foreground">
                      {ownerInfo.name || ownerInfo.email || "Property Owner"}
                    </span>
                  </div>
                  
                  {/* Owner Phone */}
                  {ownerInfo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-primary">
                        {formatIndianPhone(ownerInfo.phone)}
                      </span>
                    </div>
                  )}
                  
                  {/* Verification Badge */}
                  <div className="flex items-center gap-2 mt-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                      Verified Owner
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Owner information not available
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    You can still send a message through our contact form
                  </p>
                </div>
              </div>
            )}
            
            {/* Contact Actions */}
            <div className="grid grid-cols-1 gap-3">
              {/* Primary Contact Button */}
              <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className={cn(
                      "w-full h-12 font-semibold text-base",
                      animations.hoverScale
                    )}
                    size="lg"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Send Message to Owner
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <ContactOwnerForm 
                    propertyTitle={propertyTitle}
                    propertyId={propertyId}
                    ownerId={ownerId}
                    onSuccess={() => setContactDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
              
              {/* Direct Call Button (if phone available) */}
              {ownerInfo?.phone && (
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full h-11 font-medium",
                    animations.hoverScale
                  )}
                  onClick={() => window.open(`tel:${ownerInfo.phone}`, '_self')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call {formatIndianPhone(ownerInfo.phone)}
                </Button>
              )}
            </div>
            
            {/* Trust & Safety Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-800">
                    Safe & Secure Communication
                  </p>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    Your contact details are protected. Messages are sent through our secure platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Not Logged In State */
          <div className={spacing.contentY}>
            <div className="text-center p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border border-border/50">
              <LogIn className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h4 className={cn(typography.h4, "mb-2")}>Sign in to Contact Owner</h4>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Create a free account to message property owners, save favorites, and get personalized recommendations.
              </p>
              
              <div className="space-y-3">
                <Button 
                  className={cn(
                    "w-full h-11 font-semibold",
                    animations.hoverScale
                  )}
                  onClick={() => {
                    const currentPath = encodeURIComponent(window.location.pathname);
                    window.location.href = `/login?redirect=${currentPath}`;
                  }}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In to Contact
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Don't have an account?{' '}
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs font-medium text-primary"
                    onClick={() => {
                      const currentPath = encodeURIComponent(window.location.pathname);
                      window.location.href = `/register?redirect=${currentPath}`;
                    }}
                  >
                    Sign up for free
                  </Button>
                </p>
              </div>
            </div>
            
            {/* Benefits of Signing Up */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-green-800 mb-2">
                Benefits of Creating an Account:
              </h5>
              <ul className="text-xs text-green-700 space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                  Contact property owners directly
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                  Save favorite properties
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                  Get personalized recommendations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                  Schedule property visits
                </li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactOwnerCard;