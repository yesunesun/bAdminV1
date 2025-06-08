// src/pages/AdminSetup/components/AdminActions.tsx
// Version: 2.0.0
// Last Modified: 25-02-2025 22:30 IST
// Purpose: Provide admin profile fixing actions (as fallback for legacy users)

import React, { useState } from 'react';
import { fixExistingUserProfile } from '../hooks/useProfileFixer';
import { supabase } from '@/lib/supabase';

interface AdminActionsProps {
  email: string;
}

const AdminActions: React.FC<AdminActionsProps> = ({ email }) => {
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleFixProfile = async () => {
    setFixing(true);
    setResult(null);
    
    try {
      // First sign in with the email/password just set
      const password = prompt("Please enter your password to authenticate profile creation:");
      
      if (!password) {
        setFixing(false);
        return;
      }
      
      // Try to sign in with the provided credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        setResult({
          success: false,
          message: `Authentication failed: ${signInError.message}`
        });
        setFixing(false);
        return;
      }
      
      // Verify we have a user
      if (!signInData.user) {
        setResult({
          success: false,
          message: 'Authentication succeeded but no user was returned'
        });
        setFixing(false);
        return;
      }
      
      // Try to fix the profile
      const fixResult = await fixExistingUserProfile(email);
      
      if (fixResult.success) {
        setResult({
          success: true,
          message: fixResult.message || 'Profile fixed successfully! You can now log in.'
        });
      } else {
        setResult({
          success: false,
          message: fixResult.error || 'Failed to fix profile.'
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setFixing(false);
    }
  };
  
  const fetchProfileDebugInfo = async () => {
    setShowDebug(true);
    
    try {
      // Get user auth info
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setDebugInfo({ error: 'Not authenticated' });
        return;
      }
      
      // Check for profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      // Check admin roles
      const { data: rolesData } = await supabase
        .from('admin_roles')
        .select('*')
        .limit(5);
      
      // Check admin user entry
      const { data: adminUserData, error: adminUserError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setDebugInfo({
        user: user,
        profile: { data: profileData, error: profileError },
        adminUser: { data: adminUserData, error: adminUserError },
        roles: rolesData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setDebugInfo({ error });
    }
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Additional Options</h3>
        
        <div className="text-sm text-gray-500 mb-3">
          <p>These options are available if you encounter any issues with your account setup.</p>
        </div>
        
        {!result && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleFixProfile}
              disabled={fixing}
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {fixing ? 'Fixing Profile...' : 'Fix Profile Manually'}
            </button>
            
            <button
              onClick={fetchProfileDebugInfo}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showDebug ? 'Hide' : 'Show'} Debug Info
            </button>
          </div>
        )}
        
        {result && (
          <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p>{result.message}</p>
            
            {result.success && (
              <a 
                href="/admin/login" 
                className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Go to Login Page
              </a>
            )}
            
            {!result.success && (
              <button
                onClick={() => setResult(null)}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Try Again
              </button>
            )}
          </div>
        )}
        
        {showDebug && debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-64 text-xs">
            <h4 className="font-bold mb-2">Debug Information:</h4>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActions;