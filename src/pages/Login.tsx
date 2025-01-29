import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, KeyRound } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const { signInWithEmail, verifyOtp } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const { error: signInError } = await signInWithEmail(email);
      
      if (signInError) {
        setError(signInError.message);
        return;
      }
      
      setShowVerification(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: verifyError } = await verifyOtp(email, token);

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            {showVerification ? (
              <KeyRound className="h-6 w-6 text-indigo-600" />
            ) : (
              <Mail className="h-6 w-6 text-indigo-600" />
            )}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {showVerification ? 'Enter verification code' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showVerification 
              ? 'Check your email for the verification code'
              : 'We\'ll send you a verification code'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {showVerification ? (
          <form className="mt-8 space-y-6" onSubmit={handleVerificationSubmit}>
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="token"
                  name="token"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter code"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowVerification(false);
                  setToken('');
                  setError('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Use a different email
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Sending code...' : 'Send verification code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}