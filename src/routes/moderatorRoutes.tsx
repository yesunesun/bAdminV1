// src/routes/moderatorRoutes.tsx
// Version: 1.1.0
// Last Modified: 25-02-2025 19:30 IST

import PropertyModerationDashboard from '@/modules/moderator/pages/PropertyModerationDashboard';
import ModeratorLogin from '@/modules/moderator/pages/ModeratorLogin';
import { ModeratorLayout } from '@/modules/moderator/components/ModeratorLayout';

export const moderatorRoutes = [
  {
    path: '/moderator/login',
    element: <ModeratorLogin />,
    publicOnly: true
  },
  {
    path: '/moderator/dashboard',
    element: (
      <ModeratorLayout>
        <PropertyModerationDashboard />
      </ModeratorLayout>
    ),
    requiresAuth: true,
    moderatorOnly: true
  }
];