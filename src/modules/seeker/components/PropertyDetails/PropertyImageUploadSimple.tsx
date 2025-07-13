// Simplified PropertyImageUpload for debugging 500 error
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, ImageIcon, Upload } from 'lucide-react';
import { PropertyDetails } from '../../hooks/usePropertyDetails';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface PropertyImageUploadSimpleProps {
  property: PropertyDetails;
  onImageUploaded: () => void;
}

export function PropertyImageUploadSimple({ 
  property, 
  onImageUploaded
}: PropertyImageUploadSimpleProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Check permissions
  const isOwner = user?.id === property.owner_id;
  const isAdmin = user?.user_metadata?.is_admin || user?.user_metadata?.role === 'admin';
  const canUpload = isOwner || isAdmin;

  // Check authorization
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user || !property) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // User is authorized if they are the property owner
      const isOwner = property.owner_id === user.id;
      
      // Check if admin
      let isAdmin = false;
      try {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        isAdmin = !!adminData;
      } catch (err) {
        console.error('[PropertyImageUploadSimple] Error checking admin status:', err);
      }
      
      setIsAuthorized(isOwner || isAdmin);
      setIsLoading(false);
    };

    checkAuthorization();
  }, [user, property]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground">
        <span className="animate-pulse">Loading...</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Don't show anything if not authorized
  }

  const testImageOptimizationService = async () => {
    try {
      setError('');
      toast({
        title: "Testing Image Optimization Service",
        description: "Checking if the service can be imported and initialized...",
        variant: "default"
      });

      // Test 1: Import the service
      const { imageOptimizationService } = await import('@/services/imageOptimizationService');
      console.log('✅ imageOptimizationService imported successfully');

      // Test 2: Try to get property optimizations (should not throw error)
      const optimizations = await imageOptimizationService.getPropertyOptimizations(property.id);
      console.log('✅ getPropertyOptimizations works, found:', optimizations.length, 'records');

      toast({
        title: "Service Test Passed",
        description: `Image optimization service is working. Found ${optimizations.length} existing optimization records.`,
        variant: "default"
      });

    } catch (error) {
      console.error('❌ Service test failed:', error);
      setError(`Service test failed: ${error.message}`);
      toast({
        title: "Service Test Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="my-6">
      <div className="flex items-center justify-between p-5 border rounded-lg">
        <div>
          <h3 className="text-lg font-medium">Property Media (Debug Mode)</h3>
          <p className="text-muted-foreground text-sm">
            Testing image optimization functionality
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={testImageOptimizationService}
            variant="outline"
          >
            Test Service
          </Button>
          <Button 
            onClick={() => setUploadDialogOpen(true)}
            className="flex items-center"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Debug Upload
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 font-medium">Error Details:</div>
          <div className="text-red-700 text-sm mt-1">{error}</div>
        </div>
      )}

      {/* Minimal Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Debug Image Upload</DialogTitle>
            <DialogDescription>
              This is a simplified version for debugging the 500 error
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium mb-2">Property Info</h4>
              <div className="text-sm space-y-1">
                <div>Property ID: {property.id}</div>
                <div>Owner ID: {property.owner_id}</div>
                <div>User ID: {user?.id}</div>
                <div>Is Owner: {isOwner ? 'Yes' : 'No'}</div>
                <div>Is Admin: {isAdmin ? 'Yes' : 'No'}</div>
                <div>Can Upload: {canUpload ? 'Yes' : 'No'}</div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium mb-2">Next Steps</h4>
              <div className="text-sm space-y-1">
                <div>1. Click "Test Service" to verify image optimization service</div>
                <div>2. Check browser console for detailed error messages</div>
                <div>3. If service test passes, the 500 error is likely in the UI</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setUploadDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PropertyImageUploadSimple;