import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

// Add only this new piece
window.addEventListener('unhandledrejection', event => {
  console.error('🚨 Unhandled Promise Rejection:', {
    reason: event.reason,
    stack: event.reason?.stack
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);