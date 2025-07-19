// Test environment variables
console.log('=== ENVIRONMENT VARIABLES TEST ===');
console.log('VITE_BTSERVICE_URL:', import.meta.env.VITE_BTSERVICE_URL);
console.log('VITE_SKIP_BTSERVICE:', import.meta.env.VITE_SKIP_BTSERVICE);
console.log('Expected URL:', 'https://5h325rzyk2.execute-api.ap-south-1.amazonaws.com/prod');

// Test btService client configuration
import { btServiceClient } from './src/components/Search/services/btServiceClient.js';

console.log('=== BTSERVICE CLIENT TEST ===');
console.log('BtService client baseUrl:', btServiceClient.baseUrl);

// Test health check
console.log('=== HEALTH CHECK TEST ===');
try {
    const result = await btServiceClient.healthCheck();
    console.log('Health check result:', result);
} catch (error) {
    console.error('Health check error:', error.message);
}