// src/components/admin/AdminDebugTools.tsx
// Version: 1.0.0
// Last Modified: 26-02-2025 01:00 IST
// Purpose: Debug tool for admin user invitation and profile creation

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const AdminDebugTools: React.FC = () => {
  const [email, setEmail] = useState('wencesfx@gmail.com'); // Default email for testing
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{message: string, status: 'success' | 'error'}[]>([]);
  const { toast } = useToast();

  // Step 1: Send invitation
  const sendInvite = async () => {
    setLoading(true);
    addResult('Starting invitation process...', 'success');

    try {
      // Get role ID (property_moderator role for testing)
      const { data: roleData, error: roleError } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('role_type', 'property_moderator')
        .single();

      if (roleError || !roleData) {
        throw new Error(`Failed to fetch role: ${roleError?.message}`);
      }

      addResult(`Found role ID: ${roleData.id}`, 'success');

      // Send magic link email
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          data: {
            invitation_type: 'admin',
            role: 'property_moderator',
            role_id: roleData.id
          }
        }
      });

      if (magicLinkError) {
        throw new Error(`Failed to send invitation: ${magicLinkError.message}`);
      }

      addResult('Invitation email sent successfully!', 'success');
      toast({
        title: 'Invitation Sent',
        description: `Invitation email sent to ${email}`,
      });
    } catch (error: any) {
      const errorMsg = `Error: ${error.message}`;
      addResult(errorMsg, 'error');
      toast({
        title: 'Invitation Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Fix profile for existing user
  const fixProfile = async () => {
    setLoading(true);
    addResult('Starting profile fix process...', 'success');

    try {
      // Get user ID
      addResult(`Looking for user with email: ${email}`, 'success');
      
      // First try to get directly from auth.users (this might fail due to permissions)
      let userId = null;
      
      try {
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', email)
          .single();
          
        if (userError) {
          addResult(`Could not access auth.users directly: ${userError.message}`, 'error');
        } else if (userData) {
          userId = userData.id;
          addResult(`Found user ID directly: ${userId}`, 'success');
        }
      } catch (e) {
        addResult('Direct access to auth.users failed, trying alternative approach', 'error');
      }
      
      // If direct access failed, try to get all users (this works if user has access to auth_user view)
      if (!userId) {
        try {
          // Try to get from a custom RPC function if available
          const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_auth_users');
          
          if (rpcError) {
            addResult(`RPC get_all_auth_users failed: ${rpcError.message}`, 'error');
          } else if (rpcData) {
            // Parse RPC result and find user by email
            const userObj = Array.isArray(rpcData) 
              ? rpcData.find((u: any) => u.email === email)
              : null;
              
            if (userObj) {
              userId = userObj.id;
              addResult(`Found user ID via RPC: ${userId}`, 'success');
            }
          }
        } catch (e) {
          addResult('RPC approach failed, trying direct input', 'error');
        }
      }
      
      // If all else fails, ask for manual input
      if (!userId) {
        const manualId = prompt('Could not automatically find user ID. Please enter the user ID manually:');
        if (manualId) {
          userId = manualId;
          addResult(`Using manually entered user ID: ${userId}`, 'success');
        } else {
          throw new Error('User ID is required to fix profile');
        }
      }
      
      // Now create profile with the user ID
      await createProfile(userId);
      
    } catch (error: any) {
      const errorMsg = `Error: ${error.message}`;
      addResult(errorMsg, 'error');
      toast({
        title: 'Profile Fix Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to create profile using admin_create_profile function
  const createProfile = async (userId: string) => {
    try {
      addResult(`Calling admin_create_profile for user ID: ${userId}`, 'success');
      
      // Call the admin_create_profile function
      const { data, error } = await supabase.rpc('admin_create_profile', {
        user_id: userId,
        user_email: email,
        user_role: 'property_moderator'
      });

      if (error) {
        addResult(`RPC error: ${error.message}`, 'error');
        throw error;
      }

      addResult('Profile created successfully via RPC!', 'success');

      // Verify profile creation
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        addResult(`Warning: Could not verify profile creation: ${profileError.message}`, 'error');
      } else {
        addResult(`Verified profile exists: ${JSON.stringify(profileData)}`, 'success');
      }

      toast({
        title: 'Profile Fixed',
        description: `Profile created for ${email}`,
      });
    } catch (error: any) {
      const errorMsg = `Profile creation error: ${error.message}`;
      addResult(errorMsg, 'error');
      throw error;
    }
  };

  // Helper to add a result message
  const addResult = (message: string, status: 'success' | 'error') => {
    setResults(prev => [...prev, { message, status }]);
    console.log(`[AdminDebugTools] ${status}: ${message}`); // Also log to console for easier debugging
  };

  // Clear results
  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Admin Debug Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={sendInvite} 
              disabled={loading} 
              className="flex-1"
            >
              1. Send Invitation
            </Button>
            
            <Button 
              onClick={fixProfile} 
              disabled={loading} 
              className="flex-1"
              variant="secondary"
            >
              2. Fix Profile
            </Button>
            
            <Button 
              onClick={clearResults} 
              variant="outline"
            >
              Clear Log
            </Button>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Result Log</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md h-[300px] overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-gray-500 italic">No results yet</p>
              ) : (
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded ${
                        result.status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 
                                                     'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {result.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDebugTools;