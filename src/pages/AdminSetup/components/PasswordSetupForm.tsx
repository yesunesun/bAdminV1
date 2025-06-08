// src/pages/AdminSetup/components/PasswordSetupForm.tsx
// Version: 1.0.0
// Last Modified: 25-02-2025 16:30 IST
// Purpose: Display password setup form

import React from 'react';

interface PasswordSetupFormProps {
  email: string;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  error: string | null;
  processingSetup: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

const PasswordSetupForm: React.FC<PasswordSetupFormProps> = ({
  email,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  processingSetup,
  handleSubmit
}) => {
  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4">Complete Your Setup</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            className="w-full p-2 border rounded bg-gray-50"
            readOnly
            disabled
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your password"
            required
            minLength={8}
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 8 characters long with uppercase, lowercase, and numbers
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Confirm your password"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={processingSetup}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {processingSetup ? 'Setting up...' : 'Complete Setup'}
        </button>
      </form>
    </div>
  );
};

export default PasswordSetupForm;