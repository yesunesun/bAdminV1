// src/modules/admin/pages/AdminLogin/components/SuccessMessage.tsx
// Version: 1.0.0
// Last Modified: 24-02-2025 16:30 IST

import React from 'react';

export const SuccessMessage = ({ message }) => (
  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
    <p className="text-sm text-green-700">{message}</p>
  </div>
);