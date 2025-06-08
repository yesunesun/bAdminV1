// src/modules/admin/components/users/UserListError.tsx
// Version: 1.0.0
// Last Modified: 21-02-2025 10:00 IST

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UserListErrorProps {
  error: string;
}

export const UserListError: React.FC<UserListErrorProps> = ({ error }) => (
  <div className="p-6">
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <div className="text-red-600 font-medium text-lg mb-2">{error}</div>
          <p className="text-gray-600">
            Please contact your administrator if you believe this is an error.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);