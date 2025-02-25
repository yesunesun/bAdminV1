// src/modules/admin/pages/AdminLogin.tsx
// Version: 3.1.0
// Last Modified: 24-02-2025 22:45 IST
// Purpose: Refactored Admin Login page using custom hooks and components

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginContainer } from './AdminLogin/components/LoginContainer';
import { PasswordLoginForm } from './AdminLogin/components/PasswordLoginForm';
import { TokenLoginForm } from './AdminLogin/components/TokenLoginForm';
import { SetupPasswordForm } from './AdminLogin/components/SetupPasswordForm';
import { LoadingState } from './AdminLogin/components/LoadingState';
import { SuccessState } from './AdminLogin/components/SuccessState';
import { LoginHeader } from './AdminLogin/components/LoginHeader';
import { ErrorMessage } from './AdminLogin/components/ErrorMessage';
import { SuccessMessage } from './AdminLogin/components/SuccessMessage';
import { useAdminAuth } from './AdminLogin/hooks/useAdminAuth';
import { LOGIN_METHODS } from './AdminLogin/constants';

// Debug helper component for development mode
const DebugPanel = ({ state }) => {
  if (!import.meta.env.DEV) return null;
  
  return (
    <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
      <details>
        <summary className="cursor-pointer text-gray-600 font-medium">Debug Info</summary>
        <div className="mt-2 p-2 bg-white rounded">
          <pre className="overflow-auto">{JSON.stringify(state, null, 2)}</pre>
        </div>
      </details>
    </div>
  );
};

// Force debug rendering if the page is blank with a code parameter
const useEmergencyDebugRender = (code, componentState, needsPasswordSetup) => {
  useEffect(() => {
    if (code && document.body.contains(document.getElementById('admin-login-debug'))) {
      console.log('Debug element found, clearing it');
      document.getElementById('admin-login-debug').remove();
    }
    
    if (code && !document.body.textContent?.trim()) {
      console.log('Empty body detected with code parameter, forcing debug render');
      const debugElement = document.createElement('div');
      debugElement.id = 'admin-login-debug';
      debugElement.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif;">
          <h2>Debug Info - Blank Page Detected</h2>
          <p>Code parameter: ${code}</p>
          <p>Component State: ${componentState}</p>
          <p>Needs Password Setup: ${needsPasswordSetup}</p>
          <a href="/admin/login" style="padding: 10px; background: blue; color: white; display: inline-block; margin-top: 20px; text-decoration: none; border-radius: 4px;">Return to Login</a>
        </div>
      `;
      document.body.appendChild(debugElement);
    }
  }, [code, componentState, needsPasswordSetup]);
};

export default function AdminLogin() {
  const navigate = useNavigate();
  
  // Log component mount
  useEffect(() => {
    console.log('AdminLogin component mounted');
  }, []);
  
  // Use our custom hook for all authentication logic
  const {
    loginMethod,
    isLoading,
    error,
    success,
    isResending,
    needsPasswordSetup,
    code,
    emailParam,
    tokenParam,
    componentState,
    setError,
    setSuccess,
    setIsLoading,
    handleTokenVerification,
    handlePasswordSetup,
    handleResendToken,
    toggleLoginMethod
  } = useAdminAuth();
  
  // Emergency debug render if page is blank
  useEmergencyDebugRender(code, componentState, needsPasswordSetup);

  // Main render logic - loading state
  if (isLoading && !error && !success) {
    console.log('Rendering loading state');
    return <LoadingState />;
  }

  // Main render logic - success state
  if (success && !error) {
    console.log('Rendering success state');
    return <SuccessState message={success} />;
  }
  
  // Special case for password setup - this is the key to fixing the blank page
  if (needsPasswordSetup) {
    console.log('Rendering password setup form');
    return (
      <LoginContainer>
        <LoginHeader loginMethod="setup" onToggleMethod={null} />
        
        {error && <ErrorMessage error={error} />}
        {success && <SuccessMessage message={success} />}
        
        <SetupPasswordForm 
          isLoading={isLoading}
          onSubmit={handlePasswordSetup}
        />
        
        <DebugPanel state={{ needsPasswordSetup, code, componentState }} />
      </LoginContainer>
    );
  }

  // Default login form - fallback for any other state
  console.log('Rendering default login form');
  return (
    <LoginContainer>
      <LoginHeader 
        loginMethod={loginMethod} 
        onToggleMethod={toggleLoginMethod} 
      />

      {error && (
        <ErrorMessage 
          error={error} 
          showResendButton={loginMethod === LOGIN_METHODS.TOKEN}
          onResend={() => handleResendToken(emailParam || '')}
          isResending={isResending}
        />
      )}
      
      {success && <SuccessMessage message={success} />}

      {loginMethod === LOGIN_METHODS.PASSWORD ? (
        <PasswordLoginForm 
          setError={setError}
          setSuccess={setSuccess}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          navigate={navigate}
        />
      ) : (
        <TokenLoginForm 
          initialEmail={emailParam || ''}
          initialToken={tokenParam || ''}
          onVerify={handleTokenVerification}
          setError={setError}
          isLoading={isLoading}
        />
      )}
      
      <DebugPanel state={{ 
        loginMethod, 
        isLoading, 
        error: error ? 'Error present' : 'No error', 
        success: success ? 'Success present' : 'No success', 
        needsPasswordSetup,
        code,
        componentState
      }} />
    </LoginContainer>
  );
}