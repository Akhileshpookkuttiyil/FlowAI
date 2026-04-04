import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY.includes('...')) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ color: '#ef4444' }}>⚠️ Authentication Config Missing</h2>
      <p style={{ color: '#334155' }}>
        You need to add your verified Clerk Publishable Key to the frontend <code>.env</code> file.
      </p>
      <p style={{ color: '#64748b', fontSize: '14px' }}>
        Currently detected: {PUBLISHABLE_KEY ? "Placeholder Key" : "No Key"}
      </p>
    </div>
  );
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>,
  )
}