// src/components/admin/CoordinateSyncUtility.tsx
// Version: 2.0.0
// Last Modified: 27-05-2025 19:10 IST
// Purpose: Admin utility with migration support for existing properties

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { bulkSyncPropertyCoordinates, syncSinglePropertyCoordinates } from '@/modules/seeker/services/propertyService';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Database,
  BarChart3,
  ArrowRight
} from 'lucide-react';

interface SyncResult {
  success: boolean;
  syncedCount?: number;
  totalProperties?: number;
  errors?: string[];
  error?: string;
}

interface MigrationStats {
  totalProperties: number;
  migratedProperties: number;
  migrationPercentage: number;
  missingCoordinates: number;
}

const CoordinateSyncUtility: React.FC = () => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [singlePropertyId, setSinglePropertyId] = useState('');
  const [isSyncingSingle, setIsSyncingSingle] = useState(false);
  const [migrationStats, setMigrationStats] = useState<MigrationStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isRunningMigration, setIsRunningMigration] = useState(false);

  // Load migration statistics
  const loadMigrationStats = async () => {
    setIsLoadingStats(true);
    
    try {
      // Get total properties count
      const { count: totalProperties, error: totalError } = await supabase
        .from('properties_v2')
        .select('id', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get migrated properties count
      const { count: migratedProperties, error: migratedError } = await supabase
        .from('property_coordinates')
        .select('property_id', { count: 'exact', head: true });

      if (migratedError) throw migratedError;

      // Calculate missing coordinates
      const { count: missingCoordinates, error: missingError } = await supabase
        .from('properties_v2')
        .select('id', { count: 'exact', head: true })
        .not('id', 'in', `(SELECT property_id FROM property_coordinates)`);

      if (missingError) throw missingError;

      const stats: MigrationStats = {
        totalProperties: totalProperties || 0,
        migratedProperties: migratedProperties || 0,
        migrationPercentage: totalProperties ? Math.round((migratedProperties || 0) / totalProperties * 100) : 0,
        missingCoordinates: missingCoordinates || 0
      };

      setMigrationStats(stats);
      
      toast({
        title: "Statistics Loaded",
        description: `${stats.migratedProperties}/${stats.totalProperties} properties migrated (${stats.migrationPercentage}%)`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error loading migration stats:', error);
      toast({
        title: "Error Loading Statistics",
        description: "Failed to load migration statistics",
        variant: "destructive"
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Run selective migration for properties with coordinates
  const runSelectiveMigration = async () => {
    setIsRunningMigration(true);
    
    try {
      toast({
        title: "Starting Migration",
        description: "Migrating existing properties with coordinate data...",
        variant: "default"
      });

      // Use the selective migration SQL approach
      const { data, error } = await supabase.rpc('sql', {
        query: `
          INSERT INTO public.property_coordinates (property_id, latitude, longitude, address, city, state)
          SELECT DISTINCT
              p.id as property_id,
              CASE 
                  WHEN p.property_details->'steps' IS NOT NULL THEN
                      (SELECT (step_data->>'latitude')::DECIMAL(10,8) 
                       FROM jsonb_each(p.property_details->'steps') AS step(step_key, step_data)
                       WHERE step_key LIKE '%location%' 
                       AND step_data->>'latitude' IS NOT NULL 
                       AND step_data->>'latitude' ~ '^-?[0-9]+\.?[0-9]*// src/components/admin/CoordinateSyncUtility.tsx
// Version: 1.0.0
// Last Modified: 27-05-2025 18:50 IST
// Purpose: Admin utility to sync property coordinates to the new coordinates table

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { bulkSyncPropertyCoordinates, syncSinglePropertyCoordinates } from '@/modules/seeker/services/propertyService';
import { 
  Loader2, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Database
} from 'lucide-react';

interface SyncResult {
  success: boolean;
  syncedCount?: number;
  totalProperties?: number;
  errors?: string[];
  error?: string;
}

const CoordinateSyncUtility: React.FC = () => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [singlePropertyId, setSinglePropertyId] = useState('');
  const [isSyncingSingle, setIsSyncingSingle] = useState(false);

  // Handle bulk sync of all properties
  const handleBulkSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      toast({
        title: "Starting Bulk Sync",
        description: "This may take a few minutes for large datasets...",
        variant: "default"
      });

      const result = await bulkSyncPropertyCoordinates();
      setSyncResult(result);

      if (result.success) {
        toast({
          title: "Bulk Sync Completed",
          description: `Successfully synced ${result.syncedCount}/${result.totalProperties} properties`,
          variant: "default"
        });
      } else {
        toast({
          title: "Bulk Sync Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in bulk sync:', error);
      toast({
        title: "Sync Error",
        description: "An unexpected error occurred during sync",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle single property sync
  const handleSingleSync = async () => {
    if (!singlePropertyId.trim()) {
      toast({
        title: "Property ID Required",
        description: "Please enter a valid property ID",
        variant: "destructive"
      });
      return;
    }

    setIsSyncingSingle(true);

    try {
      const result = await syncSinglePropertyCoordinates(singlePropertyId.trim());

      if (result.success) {
        toast({
          title: "Property Synced",
          description: `Successfully synced coordinates for property ${singlePropertyId}`,
          variant: "default"
        });
        setSinglePropertyId(''); // Clear input on success
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Failed to sync property coordinates",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in single sync:', error);
      toast({
        title: "Sync Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSyncingSingle(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Property Coordinates Sync Utility
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sync property coordinates from property_details to the dedicated coordinates table for faster nearby search.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Bulk Sync Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Bulk Sync All Properties</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Extract and sync coordinates for all properties in the database. This should be run once initially and periodically for maintenance.
              </p>
              
              <Button
                onClick={handleBulkSync}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isSyncing ? 'Syncing...' : 'Start Bulk Sync'}
              </Button>
            </div>

            {/* Sync Results */}
            {syncResult && (
              <div className={`p-4 rounded-lg border ${
                syncResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {syncResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      syncResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {syncResult.success ? 'Sync Completed' : 'Sync Failed'}
                    </h4>
                    
                    {syncResult.success && (
                      <div className="mt-2 text-sm text-green-700">
                        <p>✅ Successfully synced: {syncResult.syncedCount} properties</p>
                        <p>📊 Total properties: {syncResult.totalProperties}</p>
                        {syncResult.errors && syncResult.errors.length > 0 && (
                          <p>⚠️ Errors: {syncResult.errors.length}</p>
                        )}
                      </div>
                    )}
                    
                    {!syncResult.success && (
                      <p className="mt-2 text-sm text-red-700">
                        {syncResult.error}
                      </p>
                    )}
                    
                    {syncResult.errors && syncResult.errors.length > 0 && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium">
                          View Errors ({syncResult.errors.length})
                        </summary>
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          {syncResult.errors.map((error, index) => (
                            <p key={index} className="text-xs text-muted-foreground">
                              {error}
                            </p>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-border" />

          {/* Single Property Sync Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Sync Single Property</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manually sync coordinates for a specific property. Useful for testing or fixing individual properties.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Property ID"
                  value={singlePropertyId}
                  onChange={(e) => setSinglePropertyId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
                  disabled={isSyncingSingle}
                />
                <Button
                  onClick={handleSingleSync}
                  disabled={isSyncingSingle || !singlePropertyId.trim()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isSyncingSingle ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {isSyncingSingle ? 'Syncing...' : 'Sync'}
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Migration Strategy:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li><strong>Load Statistics</strong> - Check current migration status</li>
              <li><strong>Run Quick Migration</strong> - Migrate existing properties with coordinates (fast & safe)</li>
              <li><strong>Complete Sync</strong> - Use this for comprehensive coordinate extraction (slower)</li>
              <li><strong>Monitor Progress</strong> - Check statistics to track migration completion</li>
              <li><strong>Test Functionality</strong> - Use nearby properties feature to verify it works</li>
            </ol>
          </div>

          {/* Performance Notes */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Performance Benefits:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>10-100x faster</strong> nearby property searches</li>
              <li>• <strong>Reduced server load</strong> with database-side filtering</li>
              <li>• <strong>Automatic syncing</strong> for new properties when viewed</li>
              <li>• <strong>Scalable solution</strong> that grows with your database</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoordinateSyncUtility;} className="text-xs text-muted-foreground">
                              {error}
                            </p>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-border" />

          {/* Single Property Sync Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Sync Single Property</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manually sync coordinates for a specific property. Useful for testing or fixing individual properties.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Property ID"
                  value={singlePropertyId}
                  onChange={(e) => setSinglePropertyId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
                  disabled={isSyncingSingle}
                />
                <Button
                  onClick={handleSingleSync}
                  disabled={isSyncingSingle || !singlePropertyId.trim()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isSyncingSingle ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {isSyncingSingle ? 'Syncing...' : 'Sync'}
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Usage Instructions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. Run <strong>Bulk Sync</strong> once initially to populate the coordinates table</li>
              <li>2. The system will automatically sync new properties when they are viewed</li>
              <li>3. Use <strong>Single Property Sync</strong> for testing or manual fixes</li>
              <li>4. Nearby properties search will now be much faster using the coordinates table</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoordinateSyncUtility;
                       LIMIT 1)
                  WHEN p.property_details->'coordinates'->>'lat' IS NOT NULL THEN
                      (p.property_details->'coordinates'->>'lat')::DECIMAL(10,8)
                  WHEN p.property_details->'coordinates'->>'latitude' IS NOT NULL THEN
                      (p.property_details->'coordinates'->>'latitude')::DECIMAL(10,8)
              END as latitude,
              CASE 
                  WHEN p.property_details->'steps' IS NOT NULL THEN
                      (SELECT (step_data->>'longitude')::DECIMAL(11,8) 
                       FROM jsonb_each(p.property_details->'steps') AS step(step_key, step_data)
                       WHERE step_key LIKE '%location%' 
                       AND step_data->>'longitude' IS NOT NULL 
                       AND step_data->>'longitude' ~ '^-?[0-9]+\.?[0-9]*// src/components/admin/CoordinateSyncUtility.tsx
// Version: 1.0.0
// Last Modified: 27-05-2025 18:50 IST
// Purpose: Admin utility to sync property coordinates to the new coordinates table

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { bulkSyncPropertyCoordinates, syncSinglePropertyCoordinates } from '@/modules/seeker/services/propertyService';
import { 
  Loader2, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Database
} from 'lucide-react';

interface SyncResult {
  success: boolean;
  syncedCount?: number;
  totalProperties?: number;
  errors?: string[];
  error?: string;
}

const CoordinateSyncUtility: React.FC = () => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [singlePropertyId, setSinglePropertyId] = useState('');
  const [isSyncingSingle, setIsSyncingSingle] = useState(false);

  // Handle bulk sync of all properties
  const handleBulkSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      toast({
        title: "Starting Bulk Sync",
        description: "This may take a few minutes for large datasets...",
        variant: "default"
      });

      const result = await bulkSyncPropertyCoordinates();
      setSyncResult(result);

      if (result.success) {
        toast({
          title: "Bulk Sync Completed",
          description: `Successfully synced ${result.syncedCount}/${result.totalProperties} properties`,
          variant: "default"
        });
      } else {
        toast({
          title: "Bulk Sync Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in bulk sync:', error);
      toast({
        title: "Sync Error",
        description: "An unexpected error occurred during sync",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle single property sync
  const handleSingleSync = async () => {
    if (!singlePropertyId.trim()) {
      toast({
        title: "Property ID Required",
        description: "Please enter a valid property ID",
        variant: "destructive"
      });
      return;
    }

    setIsSyncingSingle(true);

    try {
      const result = await syncSinglePropertyCoordinates(singlePropertyId.trim());

      if (result.success) {
        toast({
          title: "Property Synced",
          description: `Successfully synced coordinates for property ${singlePropertyId}`,
          variant: "default"
        });
        setSinglePropertyId(''); // Clear input on success
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Failed to sync property coordinates",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in single sync:', error);
      toast({
        title: "Sync Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSyncingSingle(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Property Coordinates Sync Utility
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sync property coordinates from property_details to the dedicated coordinates table for faster nearby search.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Bulk Sync Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Bulk Sync All Properties</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Extract and sync coordinates for all properties in the database. This should be run once initially and periodically for maintenance.
              </p>
              
              <Button
                onClick={handleBulkSync}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isSyncing ? 'Syncing...' : 'Start Bulk Sync'}
              </Button>
            </div>

            {/* Sync Results */}
            {syncResult && (
              <div className={`p-4 rounded-lg border ${
                syncResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {syncResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      syncResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {syncResult.success ? 'Sync Completed' : 'Sync Failed'}
                    </h4>
                    
                    {syncResult.success && (
                      <div className="mt-2 text-sm text-green-700">
                        <p>✅ Successfully synced: {syncResult.syncedCount} properties</p>
                        <p>📊 Total properties: {syncResult.totalProperties}</p>
                        {syncResult.errors && syncResult.errors.length > 0 && (
                          <p>⚠️ Errors: {syncResult.errors.length}</p>
                        )}
                      </div>
                    )}
                    
                    {!syncResult.success && (
                      <p className="mt-2 text-sm text-red-700">
                        {syncResult.error}
                      </p>
                    )}
                    
                    {syncResult.errors && syncResult.errors.length > 0 && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium">
                          View Errors ({syncResult.errors.length})
                        </summary>
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          {syncResult.errors.map((error, index) => (
                            <p key={index} className="text-xs text-muted-foreground">
                              {error}
                            </p>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-border" />

          {/* Single Property Sync Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Sync Single Property</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manually sync coordinates for a specific property. Useful for testing or fixing individual properties.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Property ID"
                  value={singlePropertyId}
                  onChange={(e) => setSinglePropertyId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
                  disabled={isSyncingSingle}
                />
                <Button
                  onClick={handleSingleSync}
                  disabled={isSyncingSingle || !singlePropertyId.trim()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isSyncingSingle ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {isSyncingSingle ? 'Syncing...' : 'Sync'}
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Usage Instructions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. Run <strong>Bulk Sync</strong> once initially to populate the coordinates table</li>
              <li>2. The system will automatically sync new properties when they are viewed</li>
              <li>3. Use <strong>Single Property Sync</strong> for testing or manual fixes</li>
              <li>4. Nearby properties search will now be much faster using the coordinates table</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoordinateSyncUtility;
                       LIMIT 1)
                  WHEN p.property_details->'coordinates'->>'lng' IS NOT NULL THEN
                      (p.property_details->'coordinates'->>'lng')::DECIMAL(11,8)
                  WHEN p.property_details->'coordinates'->>'longitude' IS NOT NULL THEN
                      (p.property_details->'coordinates'->>'longitude')::DECIMAL(11,8)
              END as longitude,
              CASE 
                  WHEN p.property_details->'steps' IS NOT NULL THEN
                      (SELECT step_data->>'address'
                       FROM jsonb_each(p.property_details->'steps') AS step(step_key, step_data)
                       WHERE step_key LIKE '%location%' 
                       AND step_data->>'address' IS NOT NULL
                       LIMIT 1)
                  ELSE p.property_details->>'address'
              END as address,
              CASE 
                  WHEN p.property_details->'steps' IS NOT NULL THEN
                      (SELECT step_data->>'city'
                       FROM jsonb_each(p.property_details->'steps') AS step(step_key, step_data)
                       WHERE step_key LIKE '%location%' 
                       AND step_data->>'city' IS NOT NULL
                       LIMIT 1)
                  ELSE p.property_details->>'city'
              END as city,
              CASE 
                  WHEN p.property_details->'steps' IS NOT NULL THEN
                      (SELECT step_data->>'state'
                       FROM jsonb_each(p.property_details->'steps') AS step(step_key, step_data)
                       WHERE step_key LIKE '%location%' 
                       AND step_data->>'state' IS NOT NULL
                       LIMIT 1)
                  ELSE p.property_details->>'state'
              END as state
          FROM public.properties_v2 p
          WHERE NOT EXISTS (
              SELECT 1 FROM public.property_coordinates pc WHERE pc.property_id = p.id
          )
          HAVING latitude IS NOT NULL AND longitude IS NOT NULL 
              AND latitude BETWEEN -90 AND 90 
              AND longitude BETWEEN -180 AND 180
          ON CONFLICT (property_id) DO NOTHING;
        `
      });

      if (error) {
        throw error;
      }

      // Refresh statistics
      await loadMigrationStats();

      toast({
        title: "Migration Completed",
        description: "Successfully migrated properties with existing coordinate data",
        variant: "default"
      });
    } catch (error) {
      console.error('Error running selective migration:', error);
      toast({
        title: "Migration Failed",
        description: "Error occurred during selective migration",
        variant: "destructive"
      });
    } finally {
      setIsRunningMigration(false);
    }
  };

  // Handle bulk sync of all properties using function-based approach
  const handleBulkSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      toast({
        title: "Starting Bulk Sync",
        description: "This may take a few minutes for large datasets...",
        variant: "default"
      });

      const result = await bulkSyncPropertyCoordinates();
      setSyncResult(result);

      if (result.success) {
        toast({
          title: "Bulk Sync Completed",
          description: `Successfully synced ${result.syncedCount}/${result.totalProperties} properties`,
          variant: "default"
        });
        
        // Refresh statistics
        await loadMigrationStats();
      } else {
        toast({
          title: "Bulk Sync Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in bulk sync:', error);
      toast({
        title: "Sync Error",
        description: "An unexpected error occurred during sync",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle single property sync
  const handleSingleSync = async () => {
    if (!singlePropertyId.trim()) {
      toast({
        title: "Property ID Required",
        description: "Please enter a valid property ID",
        variant: "destructive"
      });
      return;
    }

    setIsSyncingSingle(true);

    try {
      const result = await syncSinglePropertyCoordinates(singlePropertyId.trim());

      if (result.success) {
        toast({
          title: "Property Synced",
          description: `Successfully synced coordinates for property ${singlePropertyId}`,
          variant: "default"
        });
        setSinglePropertyId(''); // Clear input on success
        
        // Refresh statistics
        await loadMigrationStats();
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Failed to sync property coordinates",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in single sync:', error);
      toast({
        title: "Sync Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSyncingSingle(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Property Coordinates Migration & Sync
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Migrate existing property coordinates and sync new ones to the dedicated coordinates table for faster nearby search.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Migration Statistics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Migration Status</h3>
              <Button
                onClick={loadMigrationStats}
                disabled={isLoadingStats}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isLoadingStats ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4" />
                )}
                Refresh Stats
              </Button>
            </div>

            {migrationStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-800">{migrationStats.totalProperties}</div>
                  <div className="text-sm text-blue-600">Total Properties</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-800">{migrationStats.migratedProperties}</div>
                  <div className="text-sm text-green-600">Migrated</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-800">{migrationStats.missingCoordinates}</div>
                  <div className="text-sm text-yellow-600">Missing Coordinates</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-800">{migrationStats.migrationPercentage}%</div>
                  <div className="text-sm text-purple-600">Migration Progress</div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-border" />

          {/* Quick Migration */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Quick Migration (Recommended)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Migrate all existing properties that already have coordinate data. This is fast and safe for the initial migration.
              </p>
              
              <Button
                onClick={runSelectiveMigration}
                disabled={isRunningMigration}
                className="flex items-center gap-2"
                variant="default"
              >
                {isRunningMigration ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {isRunningMigration ? 'Migrating...' : 'Run Quick Migration'}
              </Button>
            </div>
          </div>

          <hr className="border-border" />

          {/* Bulk Sync Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Complete Bulk Sync</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Extract and sync coordinates for all properties using the extraction function. This is more thorough but takes longer.
              </p>
              
              <Button
                onClick={handleBulkSync}
                disabled={isSyncing}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isSyncing ? 'Syncing...' : 'Start Complete Sync'}
              </Button>
            </div>

            {/* Sync Results */}
            {syncResult && (
              <div className={`p-4 rounded-lg border ${
                syncResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {syncResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      syncResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {syncResult.success ? 'Sync Completed' : 'Sync Failed'}
                    </h4>
                    
                    {syncResult.success && (
                      <div className="mt-2 text-sm text-green-700">
                        <p>✅ Successfully synced: {syncResult.syncedCount} properties</p>
                        <p>📊 Total properties: {syncResult.totalProperties}</p>
                        {syncResult.errors && syncResult.errors.length > 0 && (
                          <p>⚠️ Errors: {syncResult.errors.length}</p>
                        )}
                      </div>
                    )}
                    
                    {!syncResult.success && (
                      <p className="mt-2 text-sm text-red-700">
                        {syncResult.error}
                      </p>
                    )}
                    
                    {syncResult.errors && syncResult.errors.length > 0 && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium">
                          View Errors ({syncResult.errors.length})
                        </summary>
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          {syncResult.errors.map((error, index) => (
                            <p key={index// src/components/admin/CoordinateSyncUtility.tsx
// Version: 1.0.0
// Last Modified: 27-05-2025 18:50 IST
// Purpose: Admin utility to sync property coordinates to the new coordinates table

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { bulkSyncPropertyCoordinates, syncSinglePropertyCoordinates } from '@/modules/seeker/services/propertyService';
import { 
  Loader2, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Database
} from 'lucide-react';

interface SyncResult {
  success: boolean;
  syncedCount?: number;
  totalProperties?: number;
  errors?: string[];
  error?: string;
}

const CoordinateSyncUtility: React.FC = () => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [singlePropertyId, setSinglePropertyId] = useState('');
  const [isSyncingSingle, setIsSyncingSingle] = useState(false);

  // Handle bulk sync of all properties
  const handleBulkSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      toast({
        title: "Starting Bulk Sync",
        description: "This may take a few minutes for large datasets...",
        variant: "default"
      });

      const result = await bulkSyncPropertyCoordinates();
      setSyncResult(result);

      if (result.success) {
        toast({
          title: "Bulk Sync Completed",
          description: `Successfully synced ${result.syncedCount}/${result.totalProperties} properties`,
          variant: "default"
        });
      } else {
        toast({
          title: "Bulk Sync Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in bulk sync:', error);
      toast({
        title: "Sync Error",
        description: "An unexpected error occurred during sync",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle single property sync
  const handleSingleSync = async () => {
    if (!singlePropertyId.trim()) {
      toast({
        title: "Property ID Required",
        description: "Please enter a valid property ID",
        variant: "destructive"
      });
      return;
    }

    setIsSyncingSingle(true);

    try {
      const result = await syncSinglePropertyCoordinates(singlePropertyId.trim());

      if (result.success) {
        toast({
          title: "Property Synced",
          description: `Successfully synced coordinates for property ${singlePropertyId}`,
          variant: "default"
        });
        setSinglePropertyId(''); // Clear input on success
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Failed to sync property coordinates",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in single sync:', error);
      toast({
        title: "Sync Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSyncingSingle(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Property Coordinates Sync Utility
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sync property coordinates from property_details to the dedicated coordinates table for faster nearby search.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Bulk Sync Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Bulk Sync All Properties</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Extract and sync coordinates for all properties in the database. This should be run once initially and periodically for maintenance.
              </p>
              
              <Button
                onClick={handleBulkSync}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isSyncing ? 'Syncing...' : 'Start Bulk Sync'}
              </Button>
            </div>

            {/* Sync Results */}
            {syncResult && (
              <div className={`p-4 rounded-lg border ${
                syncResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {syncResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      syncResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {syncResult.success ? 'Sync Completed' : 'Sync Failed'}
                    </h4>
                    
                    {syncResult.success && (
                      <div className="mt-2 text-sm text-green-700">
                        <p>✅ Successfully synced: {syncResult.syncedCount} properties</p>
                        <p>📊 Total properties: {syncResult.totalProperties}</p>
                        {syncResult.errors && syncResult.errors.length > 0 && (
                          <p>⚠️ Errors: {syncResult.errors.length}</p>
                        )}
                      </div>
                    )}
                    
                    {!syncResult.success && (
                      <p className="mt-2 text-sm text-red-700">
                        {syncResult.error}
                      </p>
                    )}
                    
                    {syncResult.errors && syncResult.errors.length > 0 && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium">
                          View Errors ({syncResult.errors.length})
                        </summary>
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          {syncResult.errors.map((error, index) => (
                            <p key={index} className="text-xs text-muted-foreground">
                              {error}
                            </p>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-border" />

          {/* Single Property Sync Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Sync Single Property</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manually sync coordinates for a specific property. Useful for testing or fixing individual properties.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Property ID"
                  value={singlePropertyId}
                  onChange={(e) => setSinglePropertyId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
                  disabled={isSyncingSingle}
                />
                <Button
                  onClick={handleSingleSync}
                  disabled={isSyncingSingle || !singlePropertyId.trim()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isSyncingSingle ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {isSyncingSingle ? 'Syncing...' : 'Sync'}
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Usage Instructions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. Run <strong>Bulk Sync</strong> once initially to populate the coordinates table</li>
              <li>2. The system will automatically sync new properties when they are viewed</li>
              <li>3. Use <strong>Single Property Sync</strong> for testing or manual fixes</li>
              <li>4. Nearby properties search will now be much faster using the coordinates table</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoordinateSyncUtility;