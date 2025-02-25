// src/modules/admin/components/users/InviteUserModal.tsx
// Version: 5.2.0
// Last Modified: 26-02-2025 01:30 IST
// Purpose: Handle admin user invitations with correct user and profile creation

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { ADMIN_ROLES, ADMIN_ROLE_LABELS } from '../../utils/constants';
import { useAdminAccess } from '../../hooks/useAdminAccess';

interface InviteUserModalProps {
  onSuccess?: () => void;
}

export function InviteUserModal({ onSuccess }: InviteUserModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAdminAccess();

  const validateInputs = () => {
    if (!email.trim()) {
      throw new Error('Email is required');
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Please enter a valid email address');
    }
    if (!role) {
      throw new Error('Role selection is required');
    }
    if (!Object.values(ADMIN_ROLES).includes(role as any)) {
      throw new Error('Invalid role selected');
    }
  };

  // Create secure setup token
  const generateSetupToken = (email: string, roleId: string) => {
    // Create a secure token with necessary data
    const timestamp = Date.now();
    // Add some randomness for security
    const randomComponent = Math.random().toString(36).substring(2, 10);
    
    const tokenData = {
      email,
      role_id: roleId,
      timestamp,
      expires: timestamp + (24 * 60 * 60 * 1000), // 24 hours expiry
      nonce: randomComponent
    };
    
    // Base64 encode the token data
    return btoa(JSON.stringify(tokenData));
  };

  // Create profile for user (new function)
  const createUserProfile = async (userId: string, userEmail: string, userRole: string) => {
    try {
      console.log('Creating profile for new user:', userEmail);
      
      // Call admin_create_profile RPC function
      const { error: rpcError } = await supabase.rpc('admin_create_profile', {
        user_id: userId,
        user_email: userEmail,
        user_role: userRole
      });
      
      if (rpcError) {
        console.error('Failed to create profile via RPC:', rpcError);
        return false;
      }
      
      console.log('Profile created successfully');
      return true;
    } catch (error) {
      console.error('Error creating profile:', error);
      return false;
    }
  };

  // Get user ID for email (new function)
  const getUserIdByEmail = async (userEmail: string) => {
    try {
      // First try to get all users
      const { data, error } = await supabase.rpc('get_all_auth_users');
      
      if (error) {
        console.error('Failed to get users via RPC:', error);
        return null;
      }
      
      // Find user with matching email
      if (Array.isArray(data)) {
        const user = data.find((u: any) => u.email === userEmail);
        if (user && user.id) {
          return user.id;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Verify admin access
      if (!isAdmin) {
        throw new Error('You do not have permission to invite users');
      }

      // Validate inputs
      validateInputs();

      // Step 1: Get role ID
      const { data: roleData, error: roleError } = await supabase
        .from('admin_roles')
        .select('id, role_type')
        .eq('role_type', role)
        .single();

      if (roleError || !roleData) {
        throw new Error('Failed to fetch role information');
      }

      const cleanEmail = email.trim().toLowerCase();
      console.log('Processing invitation for:', cleanEmail);

      // Step 2: Generate secure setup token
      const setupToken = generateSetupToken(cleanEmail, roleData.id);
      const setupUrl = `${window.location.origin}/admin/setup?email=${encodeURIComponent(cleanEmail)}&setupToken=${encodeURIComponent(setupToken)}`;
      
      console.log('Setup URL generated:', setupUrl);

      // Step 3: Send magic link email
      // Using passwordless sign-in to send the email
      const { data: authData, error: magicLinkError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          // Override the email template with our own setup link
          emailRedirectTo: setupUrl,
          // Add metadata for tracking
          data: {
            invitation_type: 'admin',
            role: role,
            role_id: roleData.id
          }
        }
      });

      if (magicLinkError) {
        throw new Error(`Failed to send invitation email: ${magicLinkError.message}`);
      }

      // Step 4 (new): Create profile for the user
      // Wait a moment for user to be created in auth.users
      setTimeout(async () => {
        // Get user ID from email
        const userId = await getUserIdByEmail(cleanEmail);
        
        if (userId) {
          console.log('Found user ID for profile creation:', userId);
          // Create profile using the RPC function
          const profileCreated = await createUserProfile(userId, cleanEmail, roleData.role_type);
          
          if (profileCreated) {
            console.log('Profile created successfully for invited user');
          } else {
            console.error('Failed to create profile for invited user');
          }
        } else {
          console.error('Could not find user ID for invited user');
        }
      }, 2000); // Wait 2 seconds for user creation to complete

      // For development, show the setup URL directly
      if (import.meta.env.MODE === 'development') {
        toast({
          title: 'Invitation sent successfully',
          description: (
            <div>
              <p>In development mode. Setup link would normally be emailed.</p>
              <a 
                href={setupUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 underline mt-2 inline-block"
              >
                Test setup page directly
              </a>
            </div>
          ),
          duration: 10000,
        });
      } else {
        toast({
          title: 'Invitation sent successfully',
          description: `An invitation email has been sent to ${cleanEmail}`,
          duration: 5000,
        });
      }

      // Reset form and close modal
      setEmail('');
      setRole('');
      setOpen(false);
      onSuccess?.();

    } catch (error: any) {
      console.error('Invitation error:', error);
      toast({
        title: 'Failed to send invitation',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Invite User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Send an invitation email to add a new team member.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleInvite} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              aria-describedby="email-description"
            />
            <p id="email-description" className="text-sm text-gray-500">
              The user will receive a setup link via email to create their account.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
              aria-describedby="role-description"
            >
              <option value="">Select a role</option>
              <option value={ADMIN_ROLES.PROPERTY_MODERATOR}>
                {ADMIN_ROLE_LABELS[ADMIN_ROLES.PROPERTY_MODERATOR]}
              </option>
              <option value={ADMIN_ROLES.ADMIN}>
                {ADMIN_ROLE_LABELS[ADMIN_ROLES.ADMIN]}
              </option>
            </select>
            <p id="role-description" className="text-sm text-gray-500">
              Choose the role and permissions for this user.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}