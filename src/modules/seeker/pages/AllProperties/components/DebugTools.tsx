// src/modules/seeker/pages/AllProperties/components/DebugTools.tsx
// Version: 1.0.0
// Last Modified: 05-04-2025 22:45 IST
// Purpose: Debug tools component for testing Google Maps API

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface DebugToolsProps {
  googleMapsLoaded: boolean;
}

const DebugTools: React.FC<DebugToolsProps> = ({ googleMapsLoaded }) => {
  const [debugTesting, setDebugTesting] = useState<boolean>(false);
  const [debugResult, setDebugResult] = useState<string | null>(null);
  const [debugAddress, setDebugAddress] = useState<string>("Lake View, 1-4-200/83/c, Eshwaripuri Colony, Lake View Residency, Sainikpuri, Hyderabad, Secunderabad, Telangana");
  
  const { toast } = useToast();

  // Debug function to test geocoding with a specific address
  const testGeocoding = () => {
    if (!debugAddress.trim()) {
      toast({
        title: "Empty Address",
        description: "Please enter an address to test geocoding.",
        variant: "destructive"
      });
      return;
    }
    
    setDebugTesting(true);
    setDebugResult(null);
    
    console.log("Testing geocoding for address:", debugAddress);
    console.log("Google Maps loaded status:", googleMapsLoaded);
    console.log("Google object available:", typeof window.google !== 'undefined');
    
    if (!googleMapsLoaded || typeof window.google === 'undefined') {
      setDebugResult("Error: Google Maps API not loaded properly. Check console for details.");
      setDebugTesting(false);
      return;
    }
    
    try {
      // Create a new Geocoder instance
      const geocoder = new window.google.maps.Geocoder();
      
      // Use the geocoder to get coordinates
      geocoder.geocode({ address: debugAddress }, (results: any, status: any) => {
        console.log("Geocoding results:", results);
        console.log("Geocoding status:", status);
        
        if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          const resultText = `SUCCESS: Address geocoded to coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setDebugResult(resultText);
          console.log(resultText);
          
          toast({
            title: "Geocoding Test Successful",
            description: `Found coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          });
        } else {
          const errorText = `ERROR: Geocoding failed with status: ${status}`;
          setDebugResult(errorText);
          console.error(errorText);
          
          toast({
            title: "Geocoding Test Failed",
            description: `Status: ${status}`,
            variant: "destructive"
          });
        }
        
        setDebugTesting(false);
      });
    } catch (error) {
      const errorMsg = `ERROR: Exception during geocoding: ${error}`;
      console.error(errorMsg);
      setDebugResult(errorMsg);
      setDebugTesting(false);
      
      toast({
        title: "Geocoding Test Exception",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mb-6 border-2 border-blue-500 dark:border-blue-400">
      <CardContent className="p-4">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">Debug Tools</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            API Status: {googleMapsLoaded ? 
              <span className="text-green-500 font-medium">Loaded ✓</span> : 
              <span className="text-red-500 font-medium">Not Loaded ✗</span>
            }
          </p>
          
          <div className="mb-4">
            <Label htmlFor="debugAddress" className="block mb-2 font-medium">Test Address</Label>
            <div className="flex gap-4">
              <Input
                id="debugAddress"
                value={debugAddress}
                onChange={(e) => setDebugAddress(e.target.value)}
                placeholder="Enter address to test"
                className="flex-1"
              />
              <Button
                onClick={testGeocoding}
                disabled={debugTesting || !googleMapsLoaded || !debugAddress.trim()}
                className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
              >
                {debugTesting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Testing...
                  </>
                ) : (
                  "Test Geocoding"
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter any address to test Google Maps Geocoding</p>
          </div>
        </div>
        
        {debugResult && (
          <div className={`mt-4 p-3 rounded ${debugResult.startsWith('SUCCESS') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
            {debugResult}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugTools;