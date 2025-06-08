// src/modules/seeker/components/PropertyCardLoginDialog.tsx
// Version: 1.0.0
// Last Modified: 10-05-2025 12:00 IST

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface PropertyCardLoginDialogProps {
  isOpen: boolean;
  onClose: (isOpen: boolean) => void;
  onLogin: () => void;
  onCancel: () => void;
}

const PropertyCardLoginDialog: React.FC<PropertyCardLoginDialogProps> = ({
  isOpen,
  onClose,
  onLogin,
  onCancel
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Sign in to add favorites</DialogTitle>
          <DialogDescription className="mt-2">
            Create an account or sign in to save properties to your favorites list.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-sm text-muted-foreground">
            Sign in to keep track of your favorite properties and get updates on price changes.
          </p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="sm:w-auto w-full rounded-full"
          >
            Not now
          </Button>
          <Button 
            type="button" 
            onClick={onLogin}
            className="sm:w-auto w-full rounded-full"
          >
            Sign in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyCardLoginDialog;