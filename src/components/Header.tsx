// src/components/Header.tsx
// Version: 5.2.0
// Last Modified: 08-06-2025 14:30 IST
// Purpose: Added "List Your Property" button to header using same functionality as profile menu link

import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  ChevronDown, 
  Heart, 
  Home, 
  Search, 
  Waves, 
  Sunset,
  LayoutGrid,
  Sparkles,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onFavoritesClick?: () => void;
}

// Check if app is running in development mode
// In Vite, development mode can be detected using import.meta.env.DEV
const isDevelopmentMode = import.meta.env.DEV;

// Logo component with fixed styling - single source of truth for logo appearance
const BrandLogo = () => (
  <Link to="/" className="flex-shrink-0 focus:outline-none focus:ring-0">
    <img 
      src="/bhumitallilogo.png" 
      alt="Bhumitalli" 
      className="logo-image" 
      style={{
        height: '89.06px', // Increased by another 10% (80.96px * 1.10)
        width: 'auto',
        objectFit: 'contain',
        maxWidth: '333.96px' // Increased by another 10% (303.6px * 1.10)
      }}
    />
  </Link>
);

export function Header({ onFavoritesClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { favoriteCount } = useFavorites();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

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

  // Function to handle List Property with a hard navigation
  const handleListPropertyClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // First, clear any stored wizard data
    const userId = localStorage.getItem('userId');
    if (userId) {
      localStorage.removeItem(`propertyWizard_${userId}_data`);
      localStorage.removeItem(`propertyWizard_${userId}_step`);
    }
    
    // Set a reset flag in localStorage
    localStorage.setItem('resetPropertyWizard', 'true');
    
    // Close dropdown if open
    setIsProfileDropdownOpen(false);
    
    // Use window.location for a hard navigation that will fully reset React state
    // Add a timestamp to force a fresh load and prevent caching
    const timestamp = new Date().getTime();
    window.location.href = `/properties/list?reset=${timestamp}`;
  };

  // Get theme icon based on current theme
  const getThemeIcon = () => {
    switch (theme) {
      case 'ocean':
        return <Waves className="h-5 w-5 text-primary" />;
      case 'sunset':
        return <Sunset className="h-5 w-5 text-primary" />;
      case 'vibrant':
        return <Sparkles className="h-5 w-5 text-primary" />;
      default:
        return <Waves className="h-5 w-5 text-primary" />;
    }
  };

  // Check if current path is in seeker module
  const isInSeekerModule = location.pathname === '/' || 
                          location.pathname === '/seeker' || 
                          location.pathname.startsWith('/seeker/');
  const isSeeker = userRole === 'seeker' || !userRole;
  const isOwner = userRole === 'owner' || userRole === 'landlord';

  // Main Header (used on all pages) - removed border-b to be added by parent container
  return (
    <header className="w-full bg-card sticky top-0 z-50 shadow-sm">
      <div className="flex h-20 items-center justify-between">
        {/* Logo - using the centralized BrandLogo component */}
        <BrandLogo />

        <div className="flex items-center space-x-4">
          {/* List Your Property Button - visible to all users */}
          <button
            onClick={handleListPropertyClick}
            className="hidden sm:flex items-center px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm relative mr-2"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            List Your Property
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-green-500 text-white shadow-sm whitespace-nowrap">
              FREE
            </span>
          </button>

          {/* Theme Switcher - Only visible in development mode */}
          {isDevelopmentMode && (
            <div className="relative" ref={themeDropdownRef}>
              <button
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/50 backdrop-blur-sm transition-all hover:bg-accent"
                aria-label="Change theme"
              >
                {getThemeIcon()}
              </button>

              {isThemeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border overflow-hidden z-[9999]">
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
                    <button
                      onClick={() => {
                        setTheme('vibrant');
                        setIsThemeDropdownOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center px-4 py-2 text-sm transition-colors",
                        theme === 'vibrant' 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Vibrant Theme
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Favorites Button (only if user is logged in) */}
          {user && onFavoritesClick && (
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
                <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-card border border-border overflow-hidden z-[9999]">
                  <div className="p-4 border-b border-border">
                    <div className="font-medium truncate">{user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {userRole ? 
                        userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                        (isInSeekerModule ? 'Seeker' : 'Owner')}
                    </div>
                  </div>
                  
                  <div className="py-2">
                    {/* Browse Properties link - points to /browse which renders FindPage */}
                    <Link 
                      to="/browse" 
                      className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Browse Properties
                    </Link>
                    {/* Use button with onClick for hard navigation */}
                    <button 
                      onClick={handleListPropertyClick}
                      className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent text-left"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      List My Property
                    </button>
                    <Link 
                      to="/properties" 
                      className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      My Properties
                    </Link>
                    
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
    </header>
  );
}

// Export the BrandLogo component as well in case it's needed elsewhere
export { BrandLogo };