// src/components/Footer.tsx
// Version: 1.1.0
// Last Modified: 07-04-2025 12:15 IST
// Purpose: Redesigned footer to be more compact while maintaining functionality

import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Compact Layout with 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Company Info - More compact */}
          <div className="flex items-center md:items-start">
            <Link to="/" className="flex-shrink-0 mr-4">
              <img src="/bhumitallilogo.png" alt="Bhoomitalli" className="h-10 w-auto" />
            </Link>
            <div>
              <p className="text-xs text-muted-foreground">
                Connecting property owners and seekers across India
              </p>
              <div className="flex space-x-3 mt-1">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links - Horizontal layout on mobile, vertical on desktop */}
          <div className="flex flex-col">
            <h3 className="text-xs font-medium text-foreground mb-2">Quick Links</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/seeker" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Browse Properties
              </Link>
              <Link to="/properties/list" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                List Property
              </Link>
              <Link to="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Login / Register
              </Link>
            </div>
          </div>

          {/* Contact Info - Condensed layout */}
          <div className="flex flex-col">
            <h3 className="text-xs font-medium text-foreground mb-2">Contact Us</h3>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center">
                <Phone className="h-3 w-3 text-primary mr-1 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="h-3 w-3 text-primary mr-1 flex-shrink-0" />
                <a href="mailto:info@bhoomitalli.com" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  info@bhoomitalli.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright section */}
        <div className="border-t border-border mt-3 pt-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Bhoomitalli Real Estate
            </p>
            <div className="flex space-x-3 text-xs text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;