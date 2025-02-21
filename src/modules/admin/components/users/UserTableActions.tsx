// src/modules/admin/components/users/UserTableActions.tsx
// Version: 1.0.0
// Last Modified: 21-02-2025 10:00 IST

import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, Edit, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserTableActionsProps {
  userId: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const UserTableActions: React.FC<UserTableActionsProps> = ({
  userId,
  onView,
  onEdit,
  onDelete,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <span className="sr-only">Open menu</span>
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onView(userId)}>
        <Eye className="mr-2 h-4 w-4" />
        View details
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onEdit(userId)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit user
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => onDelete(userId)}
        className="text-red-600"
      >
        <Trash className="mr-2 h-4 w-4" />
        Delete user
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);