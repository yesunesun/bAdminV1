// src/pages/TestComponentsPage.tsx
import React from 'react';

// These imports should be exactly like what you have in mainRoutes.tsx
import Dashboard from '../modules/owner/pages/Dashboard';
// Comment out the rest for now
// import Properties from '../modules/owner/pages/Properties';
// import PropertyDetails from '../modules/owner/pages/PropertyDetails';
// etc.

const TestComponentsPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Component Testing Page</h1>
      
      <div className="p-4 border border-gray-300 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">Dashboard Component</h2>
        <div className="border-2 border-red-500 p-2">
          <Dashboard />
        </div>
      </div>
      
      {/* Add more components as you verify each one works */}
    </div>
  );
};

export default TestComponentsPage;