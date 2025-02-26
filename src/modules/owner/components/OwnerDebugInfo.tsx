// src/modules/owner/components/OwnerDebugInfo.tsx
// Version: 1.0.0
// Last Modified: 26-02-2025 20:30 IST
// Purpose: Debug component for owner module

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const OwnerDebugInfo = () => {
  const { user } = useAuth();
  
  return (
    <div className="bg-blue-50 p-4 my-4 rounded-lg text-xs border border-blue-200">
      <h3 className="font-bold mb-2">Owner Module Debug Info</h3>
      <p>User ID: {user?.id || 'Not logged in'}</p>
      <p>Email: {user?.email || 'N/A'}</p>
      <p>Auth Status: {user ? 'Authenticated' : 'Not authenticated'}</p>
      <p>Last Update: {new Date().toISOString()}</p>
    </div>
  );
};