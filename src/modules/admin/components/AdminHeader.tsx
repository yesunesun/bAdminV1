// src/modules/admin/components/AdminHeader.tsx
// Version: 1.4.0
// Last Modified: 29-02-2025 10:15 IST
// Purpose: Fixed Map View navigation with direct window location change

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, ChevronDown, Map } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function AdminHeader() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Error boundary state
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('Current location pathname:', location.pathname);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error : new Error('Failed to sign out'));
    }
  };

  // Handle map view click using window.location for a hard navigation
  const handleMapViewClick = () => {
    // Using window.location for a hard navigation to ensure it works
    window.location.href = '/admin/property-map';
  };

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="border-b border-gray-200">
      {/* Main Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/admin/dashboard" className="flex-shrink-0">
              <img src="/bhumitallilogo.png" alt="Bhumitalli" className="h-8 w-auto" />
            </Link>

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-700">{user?.email}</span>
                <ChevronDown className={cn(
                  "h-4 w-4 text-gray-400 transition-transform",
                  isDropdownOpen && "transform rotate-180"
                )} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4 mr-2 inline-block" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center space-x-8">
            <Link
              to="/admin/dashboard"
              className={cn(
                "inline-flex items-center px-1 py-1 text-sm font-medium border-b-2 transition-colors",
                location.pathname === '/admin/dashboard'
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Link>

            <Link
              to="/admin/users"
              className={cn(
                "inline-flex items-center px-1 py-1 text-sm font-medium border-b-2 transition-colors",
                location.pathname === '/admin/users'
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </Link>

            {/* Using basic button with window.location.href for most direct approach */}
            <button
              onClick={handleMapViewClick}
              type="button"
              className={cn(
                "inline-flex items-center px-1 py-1 text-sm font-medium border-b-2 transition-colors",
                location.pathname === '/admin/property-map'
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Map className="h-4 w-4 mr-2" />
              Map View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}