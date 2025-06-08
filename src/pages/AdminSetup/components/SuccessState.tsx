// src/pages/AdminSetup/components/SuccessState.tsx
// Version: 1.0.0
// Last Modified: 25-02-2025 16:30 IST
// Purpose: Display success state after setup

import React from 'react';

const SuccessState: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-xl font-bold mb-2">Setup Complete</h1>
        <p className="text-gray-600 mb-4">Your account has been set up successfully!</p>
        <p className="text-gray-600">You will be redirected to the login page.</p>
      </div>
    </div>
  );
};

export default SuccessState;