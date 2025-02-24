// src/modules/admin/components/users/UserTableActions.tsx
// Version: 1.2.0
// Last Modified: 21-02-2025 20:45 IST

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

interface UserTableActionsProps {
  userId: string;
  userEmail: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
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
  
  const isDevelopment = import.meta.env.MODE === 'development';

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(userId);
      setIsDeleteDialogOpen(false);
      toast({
        title: "User Deleted",
        description: `User ${userEmail} has been successfully deleted.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
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
          {isDevelopment && (
            <DropdownMenuItem 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="mr-2 size-4" />
              <span>Hard Delete User</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Hard Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the user {userEmail}? This action cannot be undone and will remove all associated data including:
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li>User profile and authentication data</li>
                <li>All properties and property images</li>
                <li>Admin access and roles</li>
                <li>Sessions and security settings</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
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