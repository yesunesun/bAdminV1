// src/components/FlowContextDebug.tsx
// Version: 1.0.0
// Last Modified: 25-05-2025 21:45 IST
// Purpose: Debug component to test FlowContext functionality

import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useFlow } from '@/contexts/FlowContext';

export default function FlowContextDebug() {
  const { category, type, step } = useParams();
  const location = useLocation();
  const flowContext = useFlow();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">FlowContext Debug Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">URL Information</h3>
            <div className="space-y-1 text-sm">
              <div><strong>Pathname:</strong> {location.pathname}</div>
              <div><strong>Search:</strong> {location.search}</div>
              <div><strong>Hash:</strong> {location.hash}</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">URL Parameters</h3>
            <div className="space-y-1 text-sm">
              <div><strong>category:</strong> {category || 'undefined'}</div>
              <div><strong>type:</strong> {type || 'undefined'}</div>
              <div><strong>step:</strong> {step || 'undefined'}</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">FlowContext State</h3>
            <div className="space-y-1 text-sm">
              <div><strong>flowType:</strong> {flowContext.flowType || 'empty'}</div>
              <div><strong>category:</strong> {flowContext.category || 'empty'}</div>
              <div><strong>listingType:</strong> {flowContext.listingType || 'empty'}</div>
              <div><strong>isValidFlow:</strong> {flowContext.isValidFlow ? 'true' : 'false'}</div>
              <div><strong>isLoading:</strong> {flowContext.isLoading ? 'true' : 'false'}</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Test Actions</h3>
            <div className="space-y-2">
              <button 
                className="block w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                onClick={() => flowContext.setFlow('residential', 'rent')}
              >
                Test: Set Residential Rent
              </button>
              <button 
                className="block w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                onClick={() => flowContext.setFlow('commercial', 'coworking')}
              >
                Test: Set Commercial Coworking
              </button>
              <button 
                className="block w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
                onClick={() => flowContext.redirectToPropertySelection()}
              >
                Test: Go to Selection
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-100 rounded">
          <h4 className="font-semibold">Expected Behavior:</h4>
          <ul className="text-sm mt-2 space-y-1">
            <li>• URL <code>/properties/list</code> → No params, show PropertyTypeSelection</li>
            <li>• URL <code>/properties/list/residential/rent/details</code> → Valid flow, show PropertyForm</li>
            <li>• When clicking "Set Residential Rent" → Should navigate and show PropertyForm</li>
          </ul>
        </div>
      </div>
    </div>
  );
}