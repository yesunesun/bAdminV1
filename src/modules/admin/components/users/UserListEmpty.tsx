// src/modules/admin/components/users/UserListEmpty.tsx
// Version: 1.0.0
// Last Modified: 21-02-2025 10:00 IST

import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UserListEmptyProps {
  searchTerm: string;
}

export const UserListEmpty: React.FC<UserListEmptyProps> = ({ searchTerm }) => (
  <div className="p-6">
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Users className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms or filters' : 'No users have been registered yet'}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);