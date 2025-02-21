// src/modules/admin/components/users/InviteUserModal.tsx
// Version: 1.8.0
// Last Modified: 21-02-2025 22:00 IST
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
import { adminSupabase } from '@/lib/supabase';
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
      const { data: roleData, error: roleError } = await adminSupabase
        .from('admin_roles')
        .select('id')
        .eq('role_type', role)
        .single();

      if (roleError || !roleData) {
        throw new Error('Failed to fetch role information');
      }

      // Step 2: Generate a random password (will be changed by user)
      const tempPassword = Math.random().toString(36).slice(-12) + 
                         Math.random().toString(36).slice(-12);

      // Step 3: Create user with admin client
      const { data, error: createError } = await adminSupabase.auth.admin.createUser({
        email: email.trim(),
        password: tempPassword,
        email_confirm: false,
        user_metadata: {
          role: role,
          is_admin: true
        }
      });

      if (createError || !data.user) {
        throw new Error(createError?.message || 'Failed to create user');
      }

      // Step 4: Create admin user entry
      const { error: adminError } = await adminSupabase
        .from('admin_users')
        .insert([{
          user_id: data.user.id,
          role_id: roleData.id,
          is_active: true
        }]);

      if (adminError) {
        // Rollback user creation if admin user entry fails
        await adminSupabase.auth.admin.deleteUser(data.user.id);
        throw new Error('Failed to create admin user entry');
      }

      // Step 5: Generate invitation link with proper type
      const { error: resetError } = await adminSupabase.auth.admin.inviteUserByEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?type=invite`,
        data: { role }
      });

      if (resetError) {
        throw new Error('Failed to send invitation email');
      }

      toast({
        title: 'User invited successfully',
        description: 'An invitation email has been sent with setup instructions.',
        duration: 5000,
      });

      setEmail('');
      setRole('');
      setOpen(false);
      onSuccess?.();

    } catch (error: any) {
      console.error('Invitation error:', error);
      toast({
        title: 'Failed to invite user',
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
              The user will receive setup instructions at this email.
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