// src/modules/seeker/components/PropertyHeader.tsx
// Version: 1.0.0
// Last Modified: 03-04-2025 11:50 IST
// Purpose: Migrated from properties module to seeker module

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  User, 
  LogIn, 
  LogOut, 
  Menu, 
  ChevronDown 
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
  onFavoritesClick: () => void;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ onFavoritesClick }) => {
  const { user, signOut } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/bhumitallilogo.png" alt="BhoomiTalli" className="h-8 w-auto" />
            <span className="font-bold text-xl text-primary hidden sm:inline-block">BhoomiTalli</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/seeker" className="text-muted-foreground hover:text-foreground transition-colors">
            Browse Properties
          </Link>
          <Link to="/properties/list" className="text-muted-foreground hover:text-foreground transition-colors">
            List Property
          </Link>
          <Link to="/home" className="text-muted-foreground hover:text-foreground transition-colors">
            About Us
          </Link>
        </nav>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Favorites button */}
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
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/properties">My Properties</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onFavoritesClick}>
                  Saved Properties
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
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
                <Link to="/seeker">Browse Properties</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/properties/list">List Property</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/home">About Us</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default PropertyHeader;