// src/modules/admin/pages/AdminDashboard.tsx
// Version: 2.2.0
// Last Modified: 26-02-2025 01:15 IST

import React, { useState } from 'react';
import { Building2, Users, FileText, Settings, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import UsersList from '../components/UsersList';
import AdminDebugTools from '@/components/admin/AdminDebugTools';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  console.log('AdminDashboard: Rendering'); // Debug log
  const [showDebugTools, setShowDebugTools] = useState(false);

  const stats = [
    {
      title: 'Total Properties',
      value: '156',
      icon: Building2,
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Users',
      value: '2,345',
      icon: Users,
      change: '+5.4%',
      changeType: 'positive'
    },
    {
      title: 'Pending Approvals',
      value: '23',
      icon: FileText,
      change: '-3',
      changeType: 'neutral'
    },
    {
      title: 'System Health',
      value: '99.9%',
      icon: Settings,
      change: 'Optimal',
      changeType: 'positive'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <Button
            variant="outline"
            onClick={() => setShowDebugTools(!showDebugTools)}
            className="flex items-center gap-2"
          >
            <Wrench className="h-4 w-4" />
            {showDebugTools ? 'Hide Debug Tools' : 'Show Debug Tools'}
          </Button>
        </div>

        {/* Debug Tools Section - Toggleable */}
        {showDebugTools && (
          <div className="mt-6 px-4 sm:px-0">
            <AdminDebugTools />
          </div>
        )}

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </div>
                    <div className={`
                      p-3 rounded-lg 
                      ${stat.changeType === 'positive' ? 'bg-green-100' : 'bg-gray-100'}
                    `}>
                      <Icon className={`
                        h-6 w-6 
                        ${stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-600'}
                      `} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className={`
                      text-sm font-medium
                      ${stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-600'}
                    `}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">from last month</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Users List */}
        <div className="mt-8">
          <UsersList />
        </div>
      </main>
    </div>
  );
}