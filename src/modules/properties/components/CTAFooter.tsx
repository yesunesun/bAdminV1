// src/modules/properties/components/CTAFooter.tsx
// Version: 1.0.0
// Last Modified: 02-04-2025 15:10 IST
// Purpose: Moved from PropertyMapHome to properties module

import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTAFooter: React.FC = () => {
  return (
    <footer className="bg-card border-t py-4">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Ready to find your perfect property?</h3>
          <p className="text-sm text-muted-foreground">Browse our extensive collection of properties across India</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link to="/properties/list">
            <Button variant="outline">
              List Your Property
            </Button>
          </Link>
          
          <Link to="/seeker">
            <Button>
              Browse All Properties
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default CTAFooter;