// src/modules/admin/pages/AdminLogin/components/TokenLoginForm.tsx
// Version: 1.0.0
// Last Modified: 24-02-2025 16:30 IST

import React, { useState, useEffect } from 'react';
import { KeyRound, Mail } from 'lucide-react';
import { SubmitButton } from './SubmitButton';

export const TokenLoginForm = ({ 
  initialEmail = '', 
  initialToken = '', 
  onVerify, 
  setError, 
  isLoading 
}) => {
  const [tokenData, setTokenData] = useState({ 
    email: initialEmail, 
    token: initialToken 
  });
  
  const handleInputChange = (e) => {
    setTokenData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tokenData.email || !tokenData.token) {
      setError('Email and token are required');
      return;
    }
    
    await onVerify(tokenData.email, tokenData.token);
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1 relative">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
              value={tokenData.email}
              onChange={handleInputChange}
              placeholder="admin@example.com"
            />
            <Mail className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700">
            One-time Login Token
          </label>
          <div className="mt-1 relative">
            <input
              id="token"
              name="token"
              type="text"
              required
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
              value={tokenData.token}
              onChange={handleInputChange}
              placeholder="Enter the token from your email"
            />
            <KeyRound className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter the token received in your invitation email
          </p>
        </div>
      </div>

      <SubmitButton isLoading={isLoading} text="Sign in with Token" loadingText="Verifying..." />
    </form>
  );
};