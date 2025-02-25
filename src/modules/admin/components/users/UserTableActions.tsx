// src/modules/admin/components/users/UserTableActions.tsx
// Version: 1.11.0
// Last Modified: 25-02-2025 15:30 IST

import React, { useState } from 'react';
import { MoreVertical, Eye, Edit, Trash, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { adminSupabase } from '@/lib/supabase';

interface UserTableActionsProps {
  userId: string;
  userEmail: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  hasProfile?: boolean;
}

export const UserTableActions: React.FC<UserTableActionsProps> = ({
  userId,
  userEmail,
  onView,
  onEdit,
  onDelete,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    if (!isDeleting) {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      console.log('Starting delete process for user:', userId);
      
      // Try using adminSupabase client for delete operation
      const { data, error } = await adminSupabase.rpc('delete_user_completely', {
        user_id_param: userId
      });
      
      if (error) {
        console.error('Delete error via adminSupabase:', error);
        
        if (error.code === '42501') { // Permission denied error
          toast({
            title: "Permission Error",
            description: "You don't have sufficient permissions to delete users. Please contact a system administrator.",
            variant: "destructive",
          });
          setIsDeleteDialogOpen(false);
          setIsDeleting(false);
          return;
        }
        
        // For other errors, try the regular delete path
        await onDelete(userId);
      }
      
      // Close dialog and show success message
      setIsDeleteDialogOpen(false);
      toast({
        title: "User Deleted",
        description: `User ${userEmail} has been successfully deleted.`,
        variant: "default",
      });
      
      // Refresh the page after successful deletion
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Error",
        description: `Failed to delete user. Please try again later.`,
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer">
          <div className="flex items-center justify-center size-8">
            <MoreVertical className="size-4 text-gray-500" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(userId)}>
            <Eye className="mr-2 size-4" />
            <span>View details</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(userId)}>
            <Edit className="mr-2 size-4" />
            <span>Edit user</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDeleteClick}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="mr-2 size-4" />
            <span>Delete User</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this user?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              <p>You are about to delete user: <span className="font-semibold">{userEmail}</span></p>
              <p className="mt-2">This action cannot be undone and will remove:</p>
            </div>
            
            <div className="grid gap-2 text-sm">
              <div className="flex gap-2">
                <div>•</div>
                <div>User profile and authentication data</div>
              </div>
              <div className="flex gap-2">
                <div>•</div>
                <div>All properties and property images</div>
              </div>
              <div className="flex gap-2">
                <div>•</div>
                <div>Admin access and roles</div>
              </div>
              <div className="flex gap-2">
                <div>•</div>
                <div>Sessions and security settings</div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={handleDeleteDialogClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash className="size-4" />
                  <span>Delete User</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};