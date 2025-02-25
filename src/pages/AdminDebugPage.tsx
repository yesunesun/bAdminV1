// src/pages/AdminDebugPage.tsx
// Version: 1.0.0
// Last Modified: 25-02-2025 23:50 IST
// Purpose: Debug page for admin user invitation and profile creation testing

import React from 'react';
import AdminDebugTools from '@/components/admin/AdminDebugTools';
import { useAdminAccess } from '@/modules/admin/hooks/useAdminAccess';
import { Navigate } from 'react-router-dom';

const AdminDebugPage: React.FC = () => {
  const { isAdmin, isLoading } = useAdminAccess();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Debug Tools</h1>
      <p className="mb-6 text-gray-600">
        Use these tools to test and debug the admin invitation and profile creation process.
      </p>
      
      <AdminDebugTools />
    </div>
  );
};

export default AdminDebugPage;