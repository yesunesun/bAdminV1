// src/components/admin/users/InviteUserModal.tsx
// Version: 1.0.0
// Last Modified: 21-02-2025 15:45 IST

import React, { useState } from 'react';
import { adminSupabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generatePassword, sendInviteEmail } from '../utils/adminHelpers';

interface InviteUserModalProps {
  onSuccess?: () => void;
}

export default function InviteUserModal({ onSuccess }: InviteUserModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Generate a secure temporary password
      const tempPassword = generatePassword();

      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          is_invited: true,
          requires_password_change: true
        }
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error('Failed to create user');

      // Get the role ID
      const { data: roleData, error: roleError } = await adminSupabase
        .from('admin_roles')
        .select('id')
        .eq('role_type', role)
        .single();

      if (roleError) throw roleError;

      // Create admin user entry
      const { error: adminError } = await adminSupabase
        .from('admin_users')
        .insert([{
          user_id: authData.user.id,
          role_id: roleData.id
        }]);

      if (adminError) throw adminError;

      // Send invitation email
      await sendInviteEmail(email, tempPassword);

      // Reset form and close modal
      setEmail('');
      setRole('');
      setOpen(false);
      onSuccess?.();
      
    } catch (err: any) {
      setError(err.message || 'Failed to invite user');
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
        </DialogHeader>
        
        <form onSubmit={handleInvite} className="space-y-4 mt-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="property_moderator">Property Moderator</SelectItem>
              </SelectContent>
            </Select>
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