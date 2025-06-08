// src/components/Footer.tsx
// Version: 1.2.0
// Last Modified: 08-06-2025 16:45 IST
// Purpose: Updated footer to use configuration from home-config.yml

import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { useHomeConfig } from '@/config/hooks/useHomeConfig';

const Footer: React.FC = () => {
  const { config, loading, error } = useHomeConfig();

  // Show minimal footer while loading
  if (loading) {
    return (
      <footer className="w-full bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="text-center">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
            <p className="text-xs text-muted-foreground ml-2 inline">Loading...</p>
          </div>
        </div>
      </footer>
    );
  }

  // Use fallback values if config fails to load
  const companyName = config?.company?.name || 'Bhoomitalli';
  const tagline = config?.company?.tagline || 'Connecting property owners and seekers across India';
  const copyrightYear = config?.company?.copyright_year || new Date().getFullYear();
  const phone = config?.contact?.phone || '+91 98765 43210';
  const email = config?.contact?.email || 'info@bhoomitalli.com';

  return (
    <footer className="w-full bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Compact Layout with 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Company Info - More compact */}
          <div className="flex items-center md:items-start">
            <Link to="/" className="flex-shrink-0 mr-4">
              <img src="/bhumitallilogo.png" alt={companyName} className="h-10 w-auto" />
            </Link>
            <div>
              <p className="text-xs text-muted-foreground">
                {tagline}
              </p>
              
              {/* Social Media Links from Config */}
              {config?.ui_features?.show_social_links && (
                <div className="flex space-x-3 mt-1">
                  {config.social_media.facebook.enabled && (
                    <a 
                      href={config.social_media.facebook.url} 
                      className="text-muted-foreground hover:text-primary transition-colors" 
                      aria-label="Facebook"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  )}
                  {config.social_media.twitter.enabled && (
                    <a 
                      href={config.social_media.twitter.url} 
                      className="text-muted-foreground hover:text-primary transition-colors" 
                      aria-label="Twitter"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                  {config.social_media.instagram.enabled && (
                    <a 
                      href={config.social_media.instagram.url} 
                      className="text-muted-foreground hover:text-primary transition-colors" 
                      aria-label="Instagram"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {config.social_media.linkedin.enabled && (
                    <a 
                      href={config.social_media.linkedin.url} 
                      className="text-muted-foreground hover:text-primary transition-colors" 
                      aria-label="LinkedIn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Links - From Config */}
          <div className="flex flex-col">
            <h3 className="text-xs font-medium text-foreground mb-2">Quick Links</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {config?.footer_links?.quick_links?.filter(link => link.enabled).map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              )) || (
                // Fallback links if config is not available
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Contact Info - From Config */}
          <div className="flex flex-col">
            <h3 className="text-xs font-medium text-foreground mb-2">Contact Us</h3>
            <div className="flex flex-col space-y-1">
              {config?.ui_features?.show_phone_in_footer && (
                <div className="flex items-center">
                  <Phone className="h-3 w-3 text-primary mr-1 flex-shrink-0" />
                  <a href={`tel:${phone}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    {phone}
                  </a>
                </div>
              )}
              {config?.ui_features?.show_email_in_footer && (
                <div className="flex items-center">
                  <Mail className="h-3 w-3 text-primary mr-1 flex-shrink-0" />
                  <a href={`mailto:${email}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    {email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Copyright section */}
        <div className="border-t border-border mt-3 pt-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <p className="text-xs text-muted-foreground">
              © {copyrightYear} {companyName}
            </p>
            <div className="flex space-x-3 text-xs text-muted-foreground">
              {config?.footer_links?.legal_links?.filter(link => link.enabled).map((link) => (
                <a 
                  key={link.path}
                  href={link.path} 
                  className="hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              )) || (
                // Fallback legal links
                <>
                  <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                  <a href="#" className="hover:text-primary transition-colors">Terms</a>
                  <a href="#" className="hover:text-primary transition-colors">Sitemap</a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Error Indicator (Dev Mode Only) */}
        {import.meta.env.DEV && error && (
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-center">
            <p className="text-xs text-destructive">Footer Config Error: {error}</p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;

// End of file