// src/pages/HomePage.tsx
// Version: 2.0.0
// Last Modified: 04-04-2025 10:30 IST
// Purpose: Modernized layout with improved spacing, animations, and theme consistency

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
    <div className="section-padding">
      <div className="container-xl">
        {/* Hero Section with enhanced visual hierarchy */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Welcome to Bhoomitalli
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your complete real estate platform for property owners, seekers, moderators and administrators
          </p>
        </div>

        {/* Role Cards with improved styling and interactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Property Owner Module */}
          <Link 
            to={user ? "/dashboard" : "/login"} 
            className="block group"
          >
            <Card className="relative h-72 overflow-hidden rounded-xl transition-all duration-300 border-2 hover:border-primary shadow-md hover:shadow-xl group-hover:translate-y-[-8px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/90 to-blue-700/90 p-6 flex flex-col items-center justify-center text-white">
                <div className="p-4 rounded-full bg-white/10 mb-6">
                  <HomeIcon className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">Property Owner</h2>
                <p className="mt-2 text-center opacity-90">Manage your properties and listings</p>
                <div className="absolute bottom-6 left-0 right-0 text-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {user ? "Go to Dashboard →" : "Login to Access →"}
                </div>
              </div>
            </Card>
          </Link>

          {/* Property Seeker Module */}
          <Link to="/seeker" className="block group">
            <Card className="relative h-72 overflow-hidden rounded-xl transition-all duration-300 border-2 hover:border-primary shadow-md hover:shadow-xl group-hover:translate-y-[-8px]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/90 to-green-700/90 p-6 flex flex-col items-center justify-center text-white">
                <div className="p-4 rounded-full bg-white/10 mb-6">
                  <SearchIcon className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">Property Seeker</h2>
                <p className="mt-2 text-center opacity-90">Browse and find your dream property</p>
                <div className="absolute bottom-6 left-0 right-0 text-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Browse Properties →
                </div>
              </div>
            </Card>
          </Link>

          {/* Moderator Module */}
          <Link 
            to={isPropertyModerator ? "/moderator/dashboard" : "/moderator/login"}
            className={`block group ${(!isPropertyModerator && user) && 'pointer-events-none'}`}
          >
            <Card className={`relative h-72 overflow-hidden rounded-xl transition-all duration-300 border-2 hover:border-primary shadow-md hover:shadow-xl group-hover:translate-y-[-8px] ${(!isPropertyModerator && user) && 'opacity-75'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/90 to-amber-700/90 p-6 flex flex-col items-center justify-center text-white">
                <div className="p-4 rounded-full bg-white/10 mb-6">
                  <ShieldIcon className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">Moderator</h2>
                <p className="mt-2 text-center opacity-90">Review and moderate property listings</p>
                {(!isPropertyModerator && user) && (
                  <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center">
                    <div className="bg-black/80 px-6 py-3 rounded-lg text-white font-medium">
                      Moderator Access Required
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Link>

          {/* Admin Module */}
          {user ? (
            <Link 
              to={isAdmin ? "/admin/dashboard" : "/admin/login"}
              className={`block group ${!isAdmin && 'pointer-events-none'}`}
            >
              <Card className={`relative h-72 overflow-hidden rounded-xl transition-all duration-300 border-2 hover:border-primary shadow-md hover:shadow-xl group-hover:translate-y-[-8px] ${!isAdmin && 'opacity-75'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/90 to-purple-700/90 p-6 flex flex-col items-center justify-center text-white">
                  <div className="p-4 rounded-full bg-white/10 mb-6">
                    <Settings className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-2">Administrator</h2>
                  <p className="mt-2 text-center opacity-90">Manage users and system settings</p>
                  {!isAdmin && (
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center">
                      <div className="bg-black/80 px-6 py-3 rounded-lg text-white font-medium">
                        Admin Access Required
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ) : (
            <Link to="/admin/login" className="block group">
              <Card className="relative h-72 overflow-hidden rounded-xl transition-all duration-300 border-2 hover:border-primary shadow-md hover:shadow-xl group-hover:translate-y-[-8px]">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/90 to-indigo-700/90 p-6 flex flex-col items-center justify-center text-white">
                  <div className="p-4 rounded-full bg-white/10 mb-6">
                    <LogIn className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-2">Administrator</h2>
                  <p className="mt-2 text-center opacity-90">Access admin controls</p>
                  <div className="absolute bottom-6 left-0 right-0 text-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Admin Login →
                  </div>
                </div>
              </Card>
            </Link>
          )}
        </div>
        
        {/* Optional Feature Section - Uncomment if needed */}
        {/*
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-8">Our Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-card rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Easy Property Listing</h3>
              <p className="text-muted-foreground">List your properties with a simple and intuitive interface.</p>
            </div>
            <div className="p-6 bg-card rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Advanced Search</h3>
              <p className="text-muted-foreground">Find properties that match your exact requirements.</p>
            </div>
            <div className="p-6 bg-card rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Secure Connections</h3>
              <p className="text-muted-foreground">Connect with property owners through our secure messaging system.</p>
            </div>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default HomePage;