// src/modules/admin/components/users/UserListLoading.tsx
// Version: 1.0.0
// Last Modified: 21-02-2025 10:00 IST

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const UserListLoading: React.FC = () => (
  <div className="p-6">
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-500">Loading users...</p>
        </div>
      </CardContent>
    </Card>
  </div>
);