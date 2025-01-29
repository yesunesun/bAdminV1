import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from '@/components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddProperty from './pages/AddProperty';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import EditProperty from './pages/EditProperty';
import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Header />

          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/add" element={<AddProperty />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/properties/:id/edit" element={<EditProperty />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App