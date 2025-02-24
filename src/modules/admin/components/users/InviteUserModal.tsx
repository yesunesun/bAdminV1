// src/modules/admin/components/users/InviteUserModal.tsx
// Version: 1.9.1
// Last Modified: 21-02-2025 22:30 IST
// Purpose: Handle admin user invitations with reliable user creation

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
import { supabase, adminSupabase } from '@/lib/supabase';
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
        .select('id')
        .eq('role_type', role)
        .single();

      if (roleError || !roleData) {
        throw new Error('Failed to fetch role information');
      }

      // Step 2: Send magic link invite
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`,
          data: {
            role: role,
            is_admin: true,
            role_id: roleData.id
          }
        }
      });

      if (signInError) {
        throw new Error('Failed to send invitation email');
      }

      // Create profile entry after successful invite
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .insert([{
          email: email.trim(),
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (userError) {
        console.error('Profile creation error:', userError);
        // Don't throw here as the invite is already sent
      }

      // Create admin_user entry
      if (userData?.id) {
        const { error: adminError } = await supabase
          .from('admin_users')
          .insert([{
            user_id: userData.id,
            role_id: roleData.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (adminError) {
          console.error('Admin user creation error:', adminError);
          // Don't throw as the invite is already sent
        }
      }

      toast({
        title: 'Invitation sent successfully',
        description: 'A magic link has been sent to the provided email address.',
        duration: 5000,
      });

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
              The user will receive a magic link to set up their account.
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
              {isLoading ? 'Sending Invite...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}