// Version: 1.0.0
// Last Modified: 20-02-2025 20:00 IST

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UsersSearchFiltersProps {
  searchTerm: string;
  selectedRole: string;
  selectedStatus: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleChange: (role: string) => void;
  onStatusChange: (status: string) => void;
}

export const USER_ROLES = ['all', 'user', 'agent', 'owner'];
export const USER_STATUS = ['all', 'active', 'inactive', 'pending'];

export const UsersSearchFilters: React.FC<UsersSearchFiltersProps> = ({
  searchTerm,
  selectedRole,
  selectedStatus,
  onSearchChange,
  onRoleChange,
  onStatusChange
}) => (
  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Search users..."
        className="pl-10"
        value={searchTerm}
        onChange={onSearchChange}
      />
    </div>

    <Select value={selectedRole} onValueChange={onRoleChange}>
      <SelectTrigger className="w-full sm:w-32">
        <SelectValue placeholder="Role" />
      </SelectTrigger>
      <SelectContent>
        {USER_ROLES.map(role => (
          <SelectItem key={role} value={role}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Select value={selectedStatus} onValueChange={onStatusChange}>
      <SelectTrigger className="w-full sm:w-32">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {USER_STATUS.map(status => (
          <SelectItem key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);