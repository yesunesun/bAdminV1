// src/pages/HomePage.tsx
// Version: 1.4.0
// Last Modified: 03-04-2025 16:15 IST
// Purpose: Updated to use consistent layout width from seeker module

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, SearchIcon, ShieldIcon, Settings, LogIn } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/modules/admin/hooks/useAdminAccess';

const HomePage = () => {
  const { user } = useAuth();
  const { isAdmin, isPropertyModerator } = useAdminAccess();
  const navigate = useNavigate();

  return (
    <div className="py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Bhoomitalli</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your complete real estate platform for property owners, seekers, moderators and administrators
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {/* Property Owner Module - Always directs to /login for non-users */}
        <Link 
          to={user ? "/dashboard" : "/login"} 
          className="block group"
        >
          <Card className="relative h-64 overflow-hidden transition-all duration-300 border-2 hover:border-primary hover:shadow-lg group-hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/90 to-blue-700/90 p-6 flex flex-col items-center justify-center text-white">
              <HomeIcon className="h-16 w-16 mb-4 transition-transform duration-300 group-hover:scale-110" />
              <h2 className="text-2xl font-bold text-center">Property Owner</h2>
              <p className="mt-2 text-center opacity-90">Manage your properties and listings</p>
            </div>
          </Card>
        </Link>

        {/* Property Seeker Module - Always accessible */}
        <Link to="/seeker" className="block group">
          <Card className="relative h-64 overflow-hidden transition-all duration-300 border-2 hover:border-primary hover:shadow-lg group-hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/90 to-green-700/90 p-6 flex flex-col items-center justify-center text-white">
              <SearchIcon className="h-16 w-16 mb-4 transition-transform duration-300 group-hover:scale-110" />
              <h2 className="text-2xl font-bold text-center">Property Seeker</h2>
              <p className="mt-2 text-center opacity-90">Browse and find your dream property</p>
              <div className="absolute bottom-6 left-0 right-0 text-center text-sm opacity-80">
                Browse Properties →
              </div>
            </div>
          </Card>
        </Link>

        {/* Moderator Module - Always directs to /moderator/login for non-moderators */}
        <Link 
          to={isPropertyModerator ? "/moderator/dashboard" : "/moderator/login"}
          className={`block group ${(!isPropertyModerator && user) && 'pointer-events-none opacity-60'}`}
        >
          <Card className="relative h-64 overflow-hidden transition-all duration-300 border-2 hover:border-primary hover:shadow-lg group-hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/90 to-amber-700/90 p-6 flex flex-col items-center justify-center text-white">
              <ShieldIcon className="h-16 w-16 mb-4 transition-transform duration-300 group-hover:scale-110" />
              <h2 className="text-2xl font-bold text-center">Moderator</h2>
              <p className="mt-2 text-center opacity-90">Review and moderate property listings</p>
            </div>
            {(!isPropertyModerator && user) && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-black/80 px-4 py-2 rounded-md text-white">Moderator Access Required</div>
              </div>
            )}
          </Card>
        </Link>

        {/* Admin Module - Always directs to /admin/login for non-admins */}
        {user ? (
          <Link 
            to={isAdmin ? "/admin/dashboard" : "/admin/login"}
            className={`block group ${!isAdmin && 'pointer-events-none opacity-60'}`}
          >
            <Card className="relative h-64 overflow-hidden transition-all duration-300 border-2 hover:border-primary hover:shadow-lg group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/90 to-purple-700/90 p-6 flex flex-col items-center justify-center text-white">
                <Settings className="h-16 w-16 mb-4 transition-transform duration-300 group-hover:scale-110" />
                <h2 className="text-2xl font-bold text-center">Administrator</h2>
                <p className="mt-2 text-center opacity-90">Manage users and system settings</p>
              </div>
              {!isAdmin && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="bg-black/80 px-4 py-2 rounded-md text-white">Admin Access Required</div>
                </div>
              )}
            </Card>
          </Link>
        ) : (
          <Link to="/admin/login" className="block group">
            <Card className="relative h-64 overflow-hidden transition-all duration-300 border-2 hover:border-primary hover:shadow-lg group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/90 to-indigo-700/90 p-6 flex flex-col items-center justify-center text-white">
                <LogIn className="h-16 w-16 mb-4 transition-transform duration-300 group-hover:scale-110" />
                <h2 className="text-2xl font-bold text-center">Administrator</h2>
                <p className="mt-2 text-center opacity-90">Access admin controls</p>
                <div className="absolute bottom-6 left-0 right-0 text-center text-sm opacity-80">
                  Admin Login →
                </div>
              </div>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
};

export default HomePage;