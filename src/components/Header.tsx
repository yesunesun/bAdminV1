// src/components/Header.tsx
// Version: 1.2.0
// Last Modified: 2025-02-01T19:30:00+05:30 (IST)

import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, LayoutDashboard, List, LogOut, User, ClipboardCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user, signOut, userProfile } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isSupervisor = userProfile?.role === 'supervisor';
  const isAdmin = userProfile?.role === 'super_admin';

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <img 
                src="/bhumitallilogo.png" 
                alt="Bhumitalli" 
                className="h-16 w-auto"
              />
            </Link>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {(isSupervisor || isAdmin) ? (
                  <>
                    <Link 
                      to="/supervisor/dashboard" 
                      className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-indigo-600"
                    >
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      Review Queue
                    </Link>
                    <Link 
                      to="/properties" 
                      className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-indigo-600"
                    >
                      <List className="h-4 w-4 mr-2" />
                      All Properties
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-indigo-600"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <Link 
                      to="/properties" 
                      className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-indigo-600"
                    >
                      <List className="h-4 w-4 mr-2" />
                      My Properties
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <Link 
                    to="/admin/supervisors" 
                    className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-indigo-600"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Manage Supervisors
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  <span className="flex flex-col items-end">
                    <span>{user.email}</span>
                    {userProfile?.role && (
                      <span className="text-xs text-gray-500 capitalize">
                        {userProfile.role.replace('_', ' ')}
                      </span>
                    )}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}