// src/modules/seeker/components/PropertyHeader.tsx
// Version: 4.0.0
// Last Modified: 07-04-2025 11:30 IST
// Purpose: Fixed header alignment to match main header container structure

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useFavorites } from '@/contexts/FavoritesContext';
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
  Sunset,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PropertyHeaderProps {
  onFavoritesClick?: () => void;
}

// Consistent logo component to match main header
const BrandLogo = () => (
  <Link to="/" className="flex-shrink-0">
    <img 
      src="/bhumitallilogo.png" 
      alt="Bhumitalli" 
      className="logo-image" 
      style={{
        height: '64px',
        width: 'auto',
        objectFit: 'contain',
        maxWidth: '240px'
      }}
    />
  </Link>
);

// Check if app is running in development mode
const isDevelopmentMode = import.meta.env.DEV;

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ onFavoritesClick }) => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { favoriteCount } = useFavorites();
  const location = useLocation();
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  
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

  return (
    <header className="w-full bg-card sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - using the centralized BrandLogo component */}
          <BrandLogo />

          <div className="flex items-center space-x-4">
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

            {/* Favorites Button */}
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

            {/* User Profile */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 p-2 rounded-full bg-accent/50 hover:bg-accent transition-all">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform", 
                      isThemeDropdownOpen && "transform rotate-180"
                    )} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" sideOffset={4}>
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
                    <Link to="/properties/list" className="flex items-center">
                      <Home className="h-4 w-4 mr-2" />
                      List Property
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/properties" className="flex items-center">
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      My Properties
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
};

export default PropertyHeader;
export { BrandLogo };