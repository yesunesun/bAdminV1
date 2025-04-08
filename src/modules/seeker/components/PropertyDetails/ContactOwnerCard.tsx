// src/modules/seeker/components/PropertyDetails/ContactOwnerCard.tsx
// Version: 1.0.0
// Last Modified: 08-04-2025 15:45 IST
// Purpose: Contact owner card component

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ContactOwnerForm from './ContactOwnerForm';

interface ContactOwnerCardProps {
  propertyTitle: string;
  propertyId: string;
  ownerId: string;
  ownerInfo?: {
    email?: string;
    phone?: string;
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
    <Card className="border-border/40 shadow-md">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Contact Property Owner</h3>
        
        {user ? (
          <>
            {ownerInfo ? (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Listed by:</p>
                <p className="font-medium">{ownerInfo.email || "Owner"}</p>
                {ownerInfo.phone && (
                  <p className="text-primary font-medium mt-1">{ownerInfo.phone}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center text-muted-foreground mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>Owner information not available</span>
              </div>
            )}
            
            <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Contact Owner</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <ContactOwnerForm 
                  propertyTitle={propertyTitle}
                  propertyId={propertyId}
                  ownerId={ownerId}
                  onSuccess={() => setContactDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center text-muted-foreground">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>Please sign in to contact the owner</span>
            </div>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)}
            >
              Sign In
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactOwnerCard;