// src/modules/admin/pages/AdminDashboard.tsx
// Version: 3.0.0
// Last Modified: 18-07-2025 
// Updated to use comprehensive dashboard with real data

import React from 'react';
import AdminDashboard from '../components/dashboard/AdminDashboard';

export default function AdminDashboardPage() {
  console.log('AdminDashboard: Rendering'); // Debug log

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Dashboard */}
      <AdminDashboard />

    </div>
  );
}