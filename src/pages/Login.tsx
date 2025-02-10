// src/pages/Login.tsx
// Version: 1.6.0
// Last Modified: 10-02-2025 16:00 IST

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Building2, Home } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const { signInWithOTP, verifyOTP } = useAuth();

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const { error: signInError } = await signInWithOTP(email);
      
      if (signInError) {
        setError(signInError.message);
        return;
      }
      
      setShowVerification(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: verifyError } = await verifyOTP(email, token);

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
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sky-50 items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <div className="text-center">
            <img 
              src="/bhumitallilogo.png" 
              alt="Bhoomitalli" 
              className="h-16 mx-auto mb-8"
            />
            <h1 className="mt-6 text-4xl font-bold text-sky-900">Bhoomitalli</h1>
            <p className="mt-2 text-xl text-sky-700">Transform Your Real Estate Journey</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-md">
              <Home className="h-6 w-6 text-sky-600 mb-2" />
              <h3 className="font-semibold text-sky-900">Property Management</h3>
              <p className="text-sm text-sky-600">Effortless listing and management</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <Building2 className="h-6 w-6 text-sky-600 mb-2" />
              <h3 className="font-semibold text-sky-900">Portfolio Growth</h3>
              <p className="text-sm text-sky-600">Scale your property business</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-sky-400/20 to-sky-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-white/80 backdrop-blur rounded-xl shadow-lg mx-4">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-sky-100">
              <Mail className="h-7 w-7 text-sky-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-sky-900">
              {showVerification ? 'Verify Your Email' : 'Welcome Back'}
            </h2>
            <p className="mt-2 text-sm text-sky-600">
              {showVerification 
                ? 'Check your email for the verification code'
                : 'Sign in to access your account'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {showVerification ? (
            <form className="mt-8 space-y-6" onSubmit={handleVerificationSubmit}>
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-sky-900">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="token"
                    name="token"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-sky-200 rounded-lg shadow-sm placeholder-sky-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white/50 backdrop-blur sm:text-sm"
                    placeholder="Enter verification code"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-colors duration-200"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerification(false);
                    setToken('');
                    setError('');
                  }}
                  className="text-sm text-sky-600 hover:text-sky-700"
                >
                  Use a different email
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSignInSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-sky-900">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-sky-200 rounded-lg shadow-sm placeholder-sky-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white/50 backdrop-blur sm:text-sm"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-colors duration-200"
              >
                {isLoading ? 'Sending code...' : 'Send verification code'}
              </button>

              <div className="text-center">
                <p className="text-sm text-sky-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-sky-700 hover:text-sky-800">
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}