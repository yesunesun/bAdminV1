// src/components/Header.tsx
// Version: 3.0.0
// Last Modified: 03-04-2025 18:30 IST
// Purpose: Modernized header with simplified design, larger logo, and menu items under profile dropdown

import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Settings, 
  ChevronDown, 
  Heart, 
  Home, 
  Search, 
  LayoutDashboard, 
  List, 
  Waves, 
  Sunset 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onFavoritesClick?: () => void;
}

export function Header({ onFavoritesClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!error) setUserRole(data?.role || null);
    };

    fetchUserRole();
  }, [user]);

  // Fetch favorites count
  useEffect(() => {
    const fetchFavoritesCount = async () => {
      if (!user) return;
      const { count, error } = await supabase
        .from('property_likes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (!error && count !== null) setFavoriteCount(count);
    };

    if (user) {
      fetchFavoritesCount();
      
      // Subscribe to changes in property_likes
      const subscription = supabase
        .channel('property_likes_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'property_likes',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchFavoritesCount();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen || isThemeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen, isThemeDropdownOpen]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signOut();
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Check if current path is in seeker module
  const isInSeekerModule = location.pathname === '/' || 
                          location.pathname === '/seeker' || 
                          location.pathname.startsWith('/seeker/');
  const isSeeker = userRole === 'seeker' || !userRole;
  const isOwner = userRole === 'owner' || userRole === 'landlord';

  // For PropertyHeader, we need to use the simpler version for Seeker module
  if (isInSeekerModule && location.pathname !== '/') {
    return (
      <header className="w-full bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo - Slightly larger */}
            <Link to="/" className="flex-shrink-0">
              <img src="/bhumitallilogo.png" alt="Bhumitalli" className="h-10 w-auto" />
            </Link>

            <div className="flex items-center space-x-4">
              {/* Theme Switcher */}
              <div className="relative" ref={themeDropdownRef}>
                <button
                  onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/50 backdrop-blur-sm transition-all hover:bg-accent"
                  aria-label="Change theme"
                >
                  {theme === 'ocean' ? (
                    <Waves className="h-4 w-4 text-primary" />
                  ) : (
                    <Sunset className="h-4 w-4 text-primary" />
                  )}
                </button>

                {isThemeDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border overflow-hidden z-50">
                    <div className="py-1">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Select Theme
                      </div>
                      <button
                        onClick={() => {
                          setTheme('ocean');
                          setIsThemeDropdownOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center px-3 py-2 text-sm transition-colors",
                          theme === 'ocean' 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "text-foreground hover:bg-accent"
                        )}
                      >
                        <Waves className="h-4 w-4 mr-2" />
                        Ocean Theme
                      </button>
                      <button
                        onClick={() => {
                          setTheme('sunset');
                          setIsThemeDropdownOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center px-3 py-2 text-sm transition-colors",
                          theme === 'sunset' 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "text-foreground hover:bg-accent"
                        )}
                      >
                        <Sunset className="h-4 w-4 mr-2" />
                        Sunset Theme
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Favorites Button (only if user is logged in) */}
              {user && (
                <button
                  onClick={onFavoritesClick}
                  className="relative flex items-center justify-center w-8 h-8 rounded-full bg-accent/50 backdrop-blur-sm transition-all hover:bg-accent"
                  aria-label="Favorites"
                >
                  <Heart className="h-4 w-4 text-primary" />
                  {favoriteCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {favoriteCount > 99 ? '99+' : favoriteCount}
                    </span>
                  )}
                </button>
              )}

              {/* Profile or Auth Links */}
              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-1 p-1 rounded-full bg-accent/50 hover:bg-accent transition-all"
                    aria-label="Profile Menu"
                  >
                    <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className={cn(
                      "h-3 w-3 text-muted-foreground transition-transform", 
                      isProfileDropdownOpen && "transform rotate-180"
                    )} />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-card border border-border overflow-hidden z-50">
                      <div className="p-3 border-b border-border">
                        <div className="font-medium truncate text-sm">{user.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {userRole ? 
                            userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                            'Seeker'}
                        </div>
                      </div>
                      
                      <div className="py-1">
                        {/* Menu items moved here from navbar */}
                        <Link 
                          to="/" 
                          className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-accent"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Home className="h-4 w-4 mr-2" />
                          Home
                        </Link>
                        <Link 
                          to="/seeker" 
                          className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-accent"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Browse Properties
                        </Link>
                        <Link 
                          to="/seeker/favorites" 
                          className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-accent"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Favorites
                        </Link>
                        <Link 
                          to="/properties/list" 
                          className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-accent"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Home className="h-4 w-4 mr-2" />
                          List Property
                        </Link>
                        
                        <div className="h-px bg-border mx-2 my-1" />
                        
                        <button 
                          onClick={handleSignOut}
                          className="flex w-full items-center px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link 
                    to="/login" 
                    className="px-3 py-1.5 text-xs font-medium rounded-md text-foreground hover:text-primary hover:bg-accent transition-colors"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Main Header (used on homepage and non-seeker pages)
  return (
    <header className="w-full bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - Slightly larger */}
          <Link to="/" className="flex-shrink-0">
            <img src="/bhumitallilogo.png" alt="Bhumitalli" className="h-12 w-auto transition-transform hover:scale-105" />
          </Link>

          {user ? (
            <>
              {/* Main Navigation - Only shown on homepage now */}
              {location.pathname === '/' && (
                <div className="hidden md:flex flex-1 ml-12 space-x-8">
                  <Link
                    to="/"
                    className={cn(
                      "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      location.pathname === '/' 
                        ? "text-primary bg-primary/10" 
                        : "text-foreground hover:text-primary hover:bg-accent"
                    )}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                  <Link
                    to="/seeker"
                    className={cn(
                      "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      location.pathname.startsWith('/seeker') && location.pathname !== '/seeker/favorites'
                        ? "text-primary bg-primary/10" 
                        : "text-foreground hover:text-primary hover:bg-accent"
                    )}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Link>
                  <Link
                    to="/seeker/favorites"
                    className={cn(
                      "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      location.pathname === '/seeker/favorites'
                        ? "text-primary bg-primary/10" 
                        : "text-foreground hover:text-primary hover:bg-accent"
                    )}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </Link>
                  <Link
                    to="/properties/list"
                    className={cn(
                      "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      location.pathname === '/properties/list'
                        ? "text-primary bg-primary/10" 
                        : "text-foreground hover:text-primary hover:bg-accent"
                    )}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    List Property
                  </Link>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Show navigation for non-logged in users on homepage */}
              {location.pathname === '/' && (
                <div className="hidden md:flex flex-1 ml-12 space-x-8">
                  <Link
                    to="/seeker"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:text-primary hover:bg-accent transition-colors"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Link>
                </div>
              )}
            </>
          )}

          <div className="flex items-center space-x-4">
            {/* Theme Switcher */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/50 backdrop-blur-sm transition-all hover:bg-accent"
                aria-label="Change theme"
              >
                {theme === 'ocean' ? (
                  <Waves className="h-5 w-5 text-primary" />
                ) : (
                  <Sunset className="h-5 w-5 text-primary" />
                )}
              </button>

              {isThemeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border overflow-hidden z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Select Theme
                    </div>
                    <button
                      onClick={() => {
                        setTheme('ocean');
                        setIsThemeDropdownOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center px-4 py-2 text-sm transition-colors",
                        theme === 'ocean' 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <Waves className="h-4 w-4 mr-2" />
                      Ocean Theme
                    </button>
                    <button
                      onClick={() => {
                        setTheme('sunset');
                        setIsThemeDropdownOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center px-4 py-2 text-sm transition-colors",
                        theme === 'sunset' 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <Sunset className="h-4 w-4 mr-2" />
                      Sunset Theme
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Favorites Button (only if user is logged in) */}
            {user && (
              <button
                onClick={onFavoritesClick}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-accent/50 backdrop-blur-sm transition-all hover:bg-accent"
                aria-label="Favorites"
              >
                <Heart className="h-5 w-5 text-primary" />
                {favoriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {favoriteCount > 99 ? '99+' : favoriteCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile or Auth Links */}
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full bg-accent/50 hover:bg-accent transition-all"
                  aria-label="Profile Menu"
                >
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform", 
                    isProfileDropdownOpen && "transform rotate-180"
                  )} />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-card border border-border overflow-hidden z-50">
                    <div className="p-4 border-b border-border">
                      <div className="font-medium truncate">{user.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {userRole ? 
                          userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                          (isInSeekerModule ? 'Seeker' : 'Owner')}
                      </div>
                    </div>
                    
                    <div className="py-2">
                      {/* Menu items placed here */}
                      {location.pathname !== '/' && (
                        <>
                          <Link 
                            to="/" 
                            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Home className="h-4 w-4 mr-2" />
                            Home
                          </Link>
                          <Link 
                            to="/seeker" 
                            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Browse Properties
                          </Link>
                          <Link 
                            to="/seeker/favorites" 
                            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Favorites
                          </Link>
                          <Link 
                            to="/properties/list" 
                            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Home className="h-4 w-4 mr-2" />
                            List Property
                          </Link>
                        </>
                      )}
                      
                      <div className="px-4 py-2 text-xs uppercase font-semibold text-muted-foreground mt-2">
                        Account
                      </div>
                      
                      <div className="py-1">
                        <button className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </button>
                        <button className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </button>
                        
                        {/* Mode Switcher */}
                        {isSeeker && (
                          <Link 
                            to="/properties/list" 
                            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Home className="h-4 w-4 mr-2" />
                            Switch to Owner Mode
                          </Link>
                        )}
                        {isOwner && (
                          <Link 
                            to="/" 
                            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Switch to Seeker Mode
                          </Link>
                        )}
                      </div>

                      <div className="h-px bg-border mx-2 my-1" />
                      <button 
                        onClick={handleSignOut}
                        className="flex w-full items-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium rounded-md text-foreground hover:text-primary hover:bg-accent transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}