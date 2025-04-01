// src/pages/Register.tsx
// Version: 1.4.0
// Last Modified: 01-04-2025 12:45 IST

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Home } from 'lucide-react';

type UserRole = 'property_owner' | 'property_seeker';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const roleOptions: RoleOption[] = [
  {
    id: 'property_owner',
    title: 'Property Owner',
    description: 'I want to list my properties for rent',
    icon: <Building2 className="h-6 w-6" />,
  },
  {
    id: 'property_seeker',
    title: 'Property Seeker',
    description: 'I want to find properties to rent',
    icon: <Home className="h-6 w-6" />,
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const { registerUser, verifyOTP } = useAuth();

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setError('');
    setIsLoading(true);
    
    try {
      console.log(`Registering ${selectedRole} with email: ${email}`);
      const { error: registerError } = await registerUser(email, selectedRole);
      
      if (registerError) {
        console.error('Registration API error:', registerError);
        setError(registerError.message);
        return;
      }
      
      console.log('Registration successful, proceeding to verification');
      setShowVerification(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Basic validation
      if (!token.trim()) {
        setError('Please enter the verification code');
        setIsLoading(false);
        return;
      }
      
      console.log(`Verifying OTP for ${email} with code: ${token}`);
      const { error: verifyError } = await verifyOTP(email, token);

      if (verifyError) {
        console.error('Verification API error:', verifyError);
        setError(verifyError.message);
        setIsLoading(false);
        return;
      }

      console.log('Verification successful, redirecting to dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('Verification error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setShowVerification(false);
    setToken('');
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {showVerification ? 'Verify your email' : 'Create your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showVerification 
              ? 'Enter the verification code sent to your email'
              : 'Choose your role and enter your email'}
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
                  pattern="[0-9]*"
                  inputMode="numeric"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter 6-digit code"
                  value={token}
                  onChange={(e) => {
                    // Only allow digits
                    const value = e.target.value.replace(/\D/g, '');
                    setToken(value);
                  }}
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter the 6-digit code sent to {email}
              </p>
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
                onClick={handleStartOver}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Start over
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleRegistrationSubmit}>
            <div className="space-y-4">
              {roleOptions.map((role) => (
                <div
                  key={role.id}
                  className={`relative rounded-lg border p-4 cursor-pointer ${
                    selectedRole === role.id
                      ? 'border-indigo-600 ring-2 ring-indigo-600'
                      : 'border-gray-300 hover:border-indigo-500'
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 ${
                      selectedRole === role.id ? 'text-indigo-600' : 'text-gray-400'
                    }`}>
                      {role.icon}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{role.title}</h3>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
                disabled={isLoading || !selectedRole}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}