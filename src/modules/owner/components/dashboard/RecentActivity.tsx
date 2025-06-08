// src/modules/owner/components/dashboard/RecentActivity.tsx
// Version: 2.0.0
// Last Modified: 26-02-2025 16:00 IST
// Purpose: Recent activity component for owner dashboard

import React from 'react';

interface ActivityItem {
  type: 'created' | 'published' | 'updated';
  propertyTitle: string;
  date: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {activities.map((activity, index) => (
            <li key={index} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`h-2.5 w-2.5 rounded-full mr-2 ${
                    activity.type === 'published' ? 'bg-green-500' : 'bg-amber-500'
                  }`} />
                  <p className="text-sm font-medium text-gray-900">
                    {activity.propertyTitle}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {activity.date}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <p className="flex items-center text-sm text-gray-500">
                  {activity.type === 'published' ? 'Published' : 'Created'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}