// src/pages/AuthCallback.tsx
// Version: 1.2.0
// Last Modified: 21-02-2025 22:30 IST
// Purpose: Handle authentication callbacks including password setup

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const type = searchParams.get('type');

        if (!code) {
          throw new Error('No code provided');
        }

        if (type === 'invite' || type === 'recovery') {
          setShowPasswordSetup(true);
          setLoading(false);
          return;
        }

        // Handle other auth flows (email confirmation, etc)
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;

        navigate('/dashboard');
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'An error occurred during authentication');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

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

      const code = searchParams.get('code');
      if (!code) throw new Error('No code provided');

      // First exchange the code for a session
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      if (sessionError) throw sessionError;

      // Then update the password
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      toast({
        title: 'Password set successfully',
        description: 'You can now log in with your email and password.',
      });

      // Redirect to login
      navigate('/login');
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
        <p>Processing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-xl font-semibold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => navigate('/login')}>Return to Login</Button>
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

  return null;
}