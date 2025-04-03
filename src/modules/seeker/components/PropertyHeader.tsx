// src/modules/seeker/components/PropertyHeader.tsx
// Version: 2.0.0
// Last Modified: 03-04-2025 13:30 IST
// Purpose: Enhanced and standardized header for seeker module with theme support

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
  Menu, 
  ChevronDown,
  Search,
  Home,
  LayoutDashboard,
  List,
  Settings,
  Waves,
  Sunset,
  PaintBucket
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

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ onFavoritesClick }) => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/bhumitallilogo.png" alt="BhoomiTalli" className="h-8 w-auto" />
            <span className="font-bold text-xl text-primary hidden sm:inline-block">BhoomiTalli</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/seeker/browse" className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            location.pathname === '/seeker/browse' ? "text-primary" : "text-muted-foreground"
          )}>
            Browse Properties
          </Link>
          {user && (
            <Link to="/seeker/favorites" className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === '/seeker/favorites' ? "text-primary" : "text-muted-foreground"
            )}>
              Favorites
            </Link>
          )}
          <Link to="/properties/list" className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            location.pathname === '/properties/list' ? "text-primary" : "text-muted-foreground"
          )}>
            List Property
          </Link>
        </nav>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Dropdown */}
          <div className="relative" ref={themeDropdownRef}>
            <button
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              className="flex items-center px-3 py-2 rounded-md hover:bg-accent transition-colors"
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

          {/* Favorites button - only if handler is provided */}
          {onFavoritesClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onFavoritesClick}
              className="relative"
              aria-label="Favorites"
            >
              <Heart className="h-5 w-5" />
              {user && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  0
                </span>
              )}
            </Button>
          )}
          
          {/* Authentication */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/properties">
                    <List className="h-4 w-4 mr-2" />
                    My Properties
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/seeker/favorites">
                    <Heart className="h-4 w-4 mr-2" />
                    Saved Properties
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Mode Switcher */}
                <DropdownMenuItem asChild>
                  <Link to="/properties/list">
                    <Home className="h-4 w-4 mr-2" />
                    Switch to Owner Mode
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1">
                  <LogIn className="h-4 w-4" />
                  <span>Log In</span>
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
          
          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 md:hidden">
              <DropdownMenuItem asChild>
                <Link to="/seeker/browse">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Properties
                </Link>
              </DropdownMenuItem>
              {user && (
                <DropdownMenuItem asChild>
                  <Link to="/seeker/favorites">
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link to="/properties/list">
                  <Home className="h-4 w-4 mr-2" />
                  List Property
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Log In
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/register">
                      <User className="h-4 w-4 mr-2" />
                      Register
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default PropertyHeader;