//src/components/Header.tsx
// Version: 1.2.0
// Last Modified: 07-02-2025 16:45 IST

import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, List, User, Settings, ChevronDown, Sunset, Waves, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isDropdownOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, isMobileMenuOpen]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const NavLink = ({ to, icon: Icon, children, onClick }: { 
    to: string; 
    icon: React.ElementType; 
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <Link 
      to={to} 
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
        location.pathname === to ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-accent"
      )}
    >
      <Icon className="h-4 w-4 mr-2" />
      {children}
    </Link>
  );

  const UserMenu = ({ className }: { className?: string }) => (
    <div className={cn("py-1", className)}>
      <button className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent">
        <User className="h-4 w-4 mr-2" />
        Profile
      </button>
      <button className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent">
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </button>
      <button 
        onClick={() => setTheme(theme === 'ocean' ? 'sunset' : 'ocean')}
        className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
      >
        {theme === 'ocean' ? (
          <>
            <Waves className="h-4 w-4 mr-2" />
            Ocean Theme
          </>
        ) : (
          <>
            <Sunset className="h-4 w-4 mr-2" />
            Sunset Theme
          </>
        )}
      </button>
      <div className="h-px bg-border" />
      <button 
        onClick={handleSignOut}
        className="flex w-full items-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </button>
    </div>
  );

  return (
    <header className="w-full bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex-shrink-0">
            <img src="/bhumitallilogo.png" alt="Bhumitalli" className="h-16 w-auto" />
          </Link>

          {user && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex flex-1 ml-12 space-x-8">
                <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                <NavLink to="/properties" icon={List}>Properties</NavLink>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-accent"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Desktop User Menu */}
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center">
                    <div className="flex flex-col items-start mr-2">
                      <span className="text-sm font-medium text-foreground">{user.email}</span>
                      {userRole && (
                        <span className="text-xs text-muted-foreground">
                          {userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform", 
                      isDropdownOpen && "transform rotate-180"
                    )} />
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card border border-border overflow-hidden z-50">
                    <UserMenu />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {user && isMobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden fixed inset-x-0 top-20 bg-card border-b border-border shadow-lg z-50"
          >
            <div className="p-4 space-y-4">
              <div className="flex flex-col space-y-2">
                <NavLink 
                  to="/dashboard" 
                  icon={LayoutDashboard} 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
                <NavLink 
                  to="/properties" 
                  icon={List} 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Properties
                </NavLink>
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="flex items-center space-x-3 px-4 py-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{user.email}</span>
                    {userRole && (
                      <span className="text-xs text-muted-foreground">
                        {userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    )}
                  </div>
                </div>
                <UserMenu className="mt-2" />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}