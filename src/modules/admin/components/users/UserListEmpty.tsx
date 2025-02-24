// src/modules/admin/components/users/UserListEmpty.tsx
// Version: 1.1.0
// Last Modified: 24-02-2025 15:45 IST

import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UserListEmptyProps {
  searchTerm: string;
}

export const UserListEmpty: React.FC<UserListEmptyProps> = ({ searchTerm }) => (
  <div className="p-6">
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Users className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-500 mb-4 text-center">
            {searchTerm 
              ? `No users found matching "${searchTerm}". Try adjusting your search terms or filters.`
              : 'Users registered in the system will appear here.'
            }
          </p>
          {searchTerm && (
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Reset Search
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);