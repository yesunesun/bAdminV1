import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Users, FileText, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminDashboard() {
  const { user } = useAuth();

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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome back,</span>
              <span className="text-sm font-medium text-gray-900">{user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      {
                        action: 'Property Listed',
                        user: 'john.doe@example.com',
                        time: '5 minutes ago',
                        status: 'Pending Review'
                      },
                      {
                        action: 'User Registration',
                        user: 'jane.smith@example.com',
                        time: '1 hour ago',
                        status: 'Completed'
                      },
                      {
                        action: 'Property Updated',
                        user: 'mike.brown@example.com',
                        time: '2 hours ago',
                        status: 'Completed'
                      }
                    ].map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`
                            px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${item.status === 'Completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'}
                          `}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}