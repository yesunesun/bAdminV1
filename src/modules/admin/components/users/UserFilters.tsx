// src/modules/admin/components/users/UserFilters.tsx
// Version: 1.0.0
// Last Modified: 21-02-2025 10:00 IST

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { USER_ROLES, USER_STATUS } from '../../utils/constants';

interface UserFiltersProps {
  selectedRole: string;
  selectedStatus: string;
  onRoleChange: (role: string) => void;
  onStatusChange: (status: string) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  selectedRole,
  selectedStatus,
  onRoleChange,
  onStatusChange,
}) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="sm" className="ml-auto">
        <Filter className="mr-2 h-4 w-4" />
        Filters
      </Button>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Filter Users</SheetTitle>
      </SheetHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <Select value={selectedRole} onValueChange={onRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {USER_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {USER_STATUS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </SheetContent>
  </Sheet>
);