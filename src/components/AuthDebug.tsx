// src/components/AuthDebug.tsx

import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export function AuthDebug() {
  const { user, userProfile, loading } = useAuth();

  console.log('AuthDebug Component:', {
    user: user ? {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata
    } : null,
    profile: userProfile,
    loading
  });

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black bg-opacity-75 text-white rounded-lg text-xs max-w-md overflow-auto">
      <pre>
        {JSON.stringify({
          authenticated: !!user,
          userId: user?.id,
          userEmail: user?.email,
          hasProfile: !!userProfile,
          userRole: userProfile?.role,
          loading
        }, null, 2)}
      </pre>
    </div>
  );
}