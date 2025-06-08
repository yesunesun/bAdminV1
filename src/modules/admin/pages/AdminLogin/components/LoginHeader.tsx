// src/modules/admin/pages/AdminLogin/components/LoginHeader.tsx
// Version: 1.1.0
// Last Modified: 24-02-2025 19:30 IST
// Purpose: Login header with support for password setup flow

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { LOGIN_METHODS } from '../constants';

export const LoginHeader = ({ loginMethod, onToggleMethod }) => {
  const isDevMode = import.meta.env.DEV;
  
  // Display different header based on login method
  const getHeaderContent = () => {
    if (loginMethod === 'setup') {
      return {
        title: 'Welcome to Admin Portal',
        subtitle: 'Set up your password to complete your account creation'
      };
    } else if (loginMethod === LOGIN_METHODS.TOKEN) {
      return {
        title: 'Admin Portal',
        subtitle: 'Sign in with your one-time login token'
      };
    } else {
      return {
        title: 'Admin Portal',
        subtitle: 'Sign in to access admin dashboard'
      };
    }
  };
  
  const headerContent = getHeaderContent();
  
  return (
    <div className="text-center">
      <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-indigo-100">
        <Shield className="h-7 w-7 text-indigo-600" />
      </div>
      <h2 className="mt-6 text-3xl font-bold text-gray-900">
        {headerContent.title}
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        {headerContent.subtitle}
      </p>
      
      {loginMethod !== 'setup' && (
        <div className="mt-4">
          <button 
            type="button"
            onClick={onToggleMethod} 
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            {loginMethod === LOGIN_METHODS.TOKEN 
              ? 'Use password login instead' 
              : 'Use token login instead'}
          </button>
        </div>
      )}
      
      {loginMethod === LOGIN_METHODS.PASSWORD && isDevMode && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500">Development Mode Options:</p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/admin/register" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Admin Registration
            </Link>
            <span className="text-gray-300">|</span>
            <Link 
              to="/super-admin/register" 
              className="text-sm font-medium text-purple-600 hover:text-purple-500"
            >
              Super Admin Registration
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};