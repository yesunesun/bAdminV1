import React, { useState } from 'react';
import { btServiceClient } from './Search/services/btServiceClient';
import { searchService } from './Search/services/searchService';

const ApiTestPage: React.FC = () => {
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      console.log('Testing health check...');
      const result = await btServiceClient.healthCheck();
      console.log('Health check result:', result);
      setResults(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Health check error:', error);
      setResults(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testSearch = async () => {
    setLoading(true);
    try {
      console.log('Testing search...');
      const result = await searchService.search({
        searchQuery: '',
        selectedLocation: 'any',
        selectedPropertyType: 'any',
        selectedSubType: 'any',
        selectedBHK: 'any',
        selectedPriceRange: 'any',
        actionType: 'rent'
      });
      console.log('Search result:', result);
      setResults(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Search error:', error);
      setResults(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testLatestProperties = async () => {
    setLoading(true);
    try {
      console.log('Testing latest properties...');
      const result = await searchService.getLatestProperties(5, 0);
      console.log('Latest properties result:', result);
      setResults(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Latest properties error:', error);
      setResults(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>API Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Configuration</h2>
        <div>VITE_BTSERVICE_URL: {import.meta.env.VITE_BTSERVICE_URL}</div>
        <div>VITE_SKIP_BTSERVICE: {import.meta.env.VITE_SKIP_BTSERVICE}</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testHealthCheck} disabled={loading}>
          Test Health Check
        </button>
        <button onClick={testSearch} disabled={loading} style={{ marginLeft: '10px' }}>
          Test Search
        </button>
        <button onClick={testLatestProperties} disabled={loading} style={{ marginLeft: '10px' }}>
          Test Latest Properties
        </button>
      </div>

      <div>
        <h2>Results</h2>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          border: '1px solid #ddd',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}>
          {loading ? 'Loading...' : results}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Instructions</h2>
        <p>1. Open browser developer tools (F12)</p>
        <p>2. Go to Console tab</p>
        <p>3. Click any test button above</p>
        <p>4. Check console for detailed API call logs</p>
        <p>5. Go to Network tab to see actual HTTP requests</p>
      </div>
    </div>
  );
};

export default ApiTestPage;