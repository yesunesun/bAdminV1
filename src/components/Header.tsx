// src/components/Header.tsx
// Version: 1.4.0
// Last Modified: 06-02-2025 18:00 IST
// Updates: Added user role display under email

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, List } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function Header() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserRole(data?.role || null);
      } catch (err) {
        console.error('Error fetching user role:', err);
      }
    };

    fetchUserRole();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="w-full overflow-x-hidden">
      <nav className="relative bg-white border-b border-gray-200">
        <div className="w-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center">
              {/* Logo Section */}
              <div className="w-[240px] flex-shrink-0">
                <Link to="/" className="flex items-center">
                  <img 
                    src="/bhumitallilogo.png" 
                    alt="Bhumitalli" 
                    className="h-16 w-auto"
                  />
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-1">
                {user && (
                  <div className="flex space-x-8 ml-12">
                    <Link 
                      to="/dashboard" 
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        isActivePath('/dashboard')
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                      }`}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <Link 
                      to="/properties" 
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        isActivePath('/properties')
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                      }`}
                    >
                      <List className="h-4 w-4 mr-2" />
                      Properties
                    </Link>
                  </div>
                )}
              </div>

              {/* Profile and Sign Out Section */}
              {user && (
                <div className="flex items-center space-x-8">
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-gray-700">
                      {user.email}
                    </div>
                    {userRole && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}