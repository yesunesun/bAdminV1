// src/modules/properties/components/LoginPrompt.tsx
// Version: 1.0.0
// Last Modified: 02-04-2025 16:40 IST
// Purpose: Modal that prompts user to login or register when trying to favorite properties

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, LogIn, UserPlus } from 'lucide-react';

interface LoginPromptProps {
  open: boolean;
  onClose: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Sign in to save properties</DialogTitle>
          <DialogDescription className="text-center">
            Create an account or sign in to save your favorite properties and get personalized recommendations.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <Link to="/login" onClick={onClose}>
            <Button className="w-full flex items-center justify-center gap-2" variant="outline">
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Button>
          </Link>
          
          <Link to="/register" onClick={onClose}>
            <Button className="w-full flex items-center justify-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Create Account</span>
            </Button>
          </Link>
        </div>
        
        <DialogFooter className="justify-center sm:justify-center">
          <Button variant="ghost" onClick={onClose}>
            Continue Browsing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPrompt;