// src/pages/AuthCallback.tsx
// Version: 1.5.0
// Last Modified: 25-02-2025 09:30 IST

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debug the current URL and localStorage for PKCE params
  useEffect(() => {
    console.log('====== AUTH CALLBACK DEBUG ======');
    console.log('Full URL:', window.location.href);
    console.log('Has code param:', window.location.href.includes('code='));
    
    // Log localStorage keys (not values for security)
    console.log('LocalStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`  ${key}`);
    }
    
    // Check for supabase-auth-token key
    if (localStorage.getItem('supabase.auth.token')) {
      console.log('Found supabase auth token in localStorage');
    }
    
    // Log search params
    const params = new URLSearchParams(window.location.search);
    console.log('URL parameters:');
    params.forEach((value, key) => {
      console.log(`  ${key}: ${value.length > 20 ? value.substring(0, 20) + '...' : value}`);
    });
  }, []);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Beginning authentication callback process...');
        setLoading(true);
        
        // Get the current URL's path and query string
        const { hash, pathname, search } = window.location;
        const url = `${pathname}${search}${hash}`;

        console.log('Processing URL:', url);
        
        // IMPORTANT: Use the exact API as recommended by Supabase
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);
        
        if (error) {
          console.error('Code exchange error:', error);
          throw error;
        }
        
        console.log('Successfully exchanged code for session');
        
        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error('No user found after code exchange');
          throw new Error('Authentication completed but no user was found.');
        }
        
        console.log('Authenticated user:', user.id);
        
        // Check if this is an invitation that requires password setup
        const isNewUser = !user.last_sign_in_at; // First time sign in
        const isAdminInvite = user.user_metadata?.invitation_type === 'admin' || 
                            user.user_metadata?.is_admin === true;
        
        console.log('User status:', { isNewUser, isAdminInvite });
        
        if (isNewUser || isAdminInvite) {
          console.log('Showing password setup form for new admin user');
          setShowPasswordSetup(true);
        } else {
          // Regular authentication, redirect to appropriate dashboard
          console.log('Regular authentication, redirecting to appropriate dashboard');
          if (isAdminInvite) {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        }
      } catch (err: any) {
        console.error('Authentication callback error:', err);
        setError(err.message || 'An error occurred during authentication');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      console.log('Setting up password for user...');
      
      // Update password for current session
      const { error: updateError } = await supabase.auth.updateUser({ 
        password 
      });
      
      if (updateError) {
        console.error('Password update error:', updateError);
        throw updateError;
      }
      
      console.log('Password updated successfully');

      // Get user details after password update
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if the user is an admin and activate accordingly
        const { error: adminError } = await supabase
          .from('admin_users')
          .update({ is_active: true })
          .eq('user_id', user.id);
          
        if (adminError) {
          console.warn('Admin activation error (non-critical):', adminError);
        } else {
          console.log('Admin user activated successfully');
        }
      }

      toast({
        title: 'Password set successfully',
        description: 'You can now log in with your email and password.',
      });

      // Redirect to admin login
      console.log('Redirecting to admin login...');
      setTimeout(() => navigate('/admin/login'), 1500);
    } catch (err: any) {
      console.error('Password setup error:', err);
      setError(err.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !showPasswordSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Processing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-xl font-semibold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex space-x-4">
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
          <Button variant="outline" onClick={() => navigate('/admin/login')}>Admin Login</Button>
        </div>
        <div className="mt-8 text-sm text-gray-500">
          <p>If you continue to experience issues, please contact your administrator</p>
          <p>Error details: {error}</p>
        </div>
      </div>
    );
  }

  if (showPasswordSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Set Your Password</CardTitle>
          </CardHeader>
          <form onSubmit={handlePasswordSetup}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                type="submit"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? 'Setting Password...' : 'Set Password'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // Fallback UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-xl font-semibold mb-4">Authentication Processing</h1>
      <p className="text-gray-600 mb-4">Your authentication request is being processed.</p>
      <div className="flex space-x-4">
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
        <Button variant="outline" onClick={() => navigate('/admin/login')}>Admin Login</Button>
      </div>
    </div>
  );
}