// src/pages/AdminSetup/index.tsx
// Version: 1.0.0
// Last Modified: 25-02-2025 16:30 IST
// Purpose: Main AdminSetup component that coordinates all subcomponents

import React from 'react';
import { useAdminSetup } from './hooks/useAdminSetup';
import LoadingState from './components/LoadingState.tsx';
import SuccessState from './components/SuccessState';
import PasswordSetupForm from './components/PasswordSetupForm';
import AdminActions from './components/AdminActions';

const AdminSetup: React.FC = () => {
  const {
    loading,
    error,
    email,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    success,
    processingSetup,
    handlePasswordSetup
  } = useAdminSetup();

  // Success state
  if (success) {
    return <SuccessState />;
  }

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Password setup form
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <PasswordSetupForm
          email={email}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          error={error}
          processingSetup={processingSetup}
          handleSubmit={handlePasswordSetup}
        />
        
        <AdminActions email={email} />
      </div>
    </div>
  );
};

export default AdminSetup;