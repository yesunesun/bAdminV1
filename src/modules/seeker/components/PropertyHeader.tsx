// src/modules/seeker/components/PropertyHeader.tsx
// Version: 3.2.0
// Last Modified: 04-04-2025 18:00 IST
// Purpose: Fixed real-time subscription for favorites count updates

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  User, 
  LogIn, 
  LogOut, 
  ChevronDown,
  Search,
  Home,
  LayoutDashboard,
  List,
  Settings,
  Waves,
  Sunset
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';

interface PropertyHeaderProps {
  onFavoritesClick?: () => void;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ onFavoritesClick }) => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  
  // Fetch favorites count when user is logged in
  useEffect(() => {
    const fetchFavoriteCount = async () => {
      if (!user) {
        setFavoriteCount(0);
        return;
      }
      
      try {
        console.log("Fetching favorite count for user:", user.id);
        const { count, error } = await supabase
          .from('property_likes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching favorite count:', error);
          return;
        }
        
        console.log("Current favorite count:", count);
        if (count !== null) {
          setFavoriteCount(count);
        }
      } catch (error) {
        console.error('Error fetching favorite count:', error);
      }
    };
    
    fetchFavoriteCount();
    
    // Set up real-time subscription only if user is logged in
    if (user) {
      console.log("Setting up property_likes subscription for user:", user.id);
      
      // Subscribe to changes in property_likes
      const channel = supabase.channel('property_likes_changes_property_header')
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'property_likes',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('INSERT detected in property_likes:', payload);
            setFavoriteCount(prevCount => prevCount + 1);
          }
        )
        .on('postgres_changes', 
          {
            event: 'DELETE',
            schema: 'public',
            table: 'property_likes',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('DELETE detected in property_likes:', payload);
            setFavoriteCount(prevCount => Math.max(0, prevCount - 1));
          }
        );
      
      // Subscribe to the channel
      channel.subscribe((status) => {
        console.log(`Subscription status for property_likes_changes_property_header: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to property_likes changes');
        }
      });
      
      // Clean up subscription when component unmounts
      return () => {
        console.log('Cleaning up property_likes subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  
  // Close theme dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };

    if (isThemeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isThemeDropdownOpen]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Theme selection option component
  const ThemeOption = ({ value, label, icon: Icon, onClick }: {
    value: 'ocean' | 'sunset';
    label: string;
    icon: React.ElementType;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center px-4 py-2 text-sm transition-colors",
        theme === value 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-foreground hover:bg-accent"
      )}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - Significantly larger */}
          <Link to="/" className="flex-shrink-0">
            <img src="/bhumitallilogo.png" alt="BhoomiTalli" className="h-14 w-auto transition-transform hover:scale-105" />
          </Link>

          <div className="flex items-center space-x-3">
            {/* Theme Switcher */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-accent/50 backdrop-blur-sm transition-all hover:bg-accent"
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
                    <ThemeOption 
                      value="ocean" 
                      label="Ocean Theme" 
                      icon={Waves} 
                      onClick={() => {
                        setTheme('ocean');
                        setIsThemeDropdownOpen(false);
                      }}
                    />
                    <ThemeOption 
                      value="sunset" 
                      label="Sunset Theme" 
                      icon={Sunset} 
                      onClick={() => {
                        setTheme('sunset');
                        setIsThemeDropdownOpen(false);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Favorites Button */}
            {user && onFavoritesClick && (
              <button
                onClick={onFavoritesClick}
                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-accent/50 backdrop-blur-sm transition-all hover:bg-accent"
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

            {/* User Profile */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center p-1.5 rounded-full bg-accent/50 hover:bg-accent transition-all gap-1.5 min-w-[42px]">
                    <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="h-4 w-4 mr-0.5 transition-transform duration-200 data-[state=open]:-rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1" sideOffset={4}>
                  <DropdownMenuLabel className="font-normal">
                    <div className="font-medium truncate">{user.email}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Seeker Account
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Main Navigation */}
                  <DropdownMenuItem asChild>
                    <Link to="/" className="flex items-center">
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/seeker" className="flex items-center">
                      <Search className="h-4 w-4 mr-2" />
                      Browse Properties
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/seeker/favorites" className="flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/properties/list" className="flex items-center">
                      <Home className="h-4 w-4 mr-2" />
                      List Property
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* User Account */}
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/properties" className="flex items-center">
                      <List className="h-4 w-4 mr-2" />
                      My Properties
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Sign Out */}
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="px-3 py-1.5 text-sm font-medium rounded-md text-foreground hover:text-primary hover:bg-accent transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
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
};

export default PropertyHeader;