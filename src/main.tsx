import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './styles/index.css';
import App from './App.tsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_aHVtYmxlLWZpbmNoLTYzMDIuY2xlcmsuYWNjb3VudHMuZGV2JA';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        layout: {
          socialButtonsPlacement: 'top',
          showOptionalFields: false
        },
        variables: {
          colorPrimary: '#1D4ED8',
          colorText: '#0F172A',
          borderRadius: '0.625rem',
          fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)'
        },
        elements: {
          footer: { display: 'none' },
          footerAction: { display: 'none' },
          badge: { display: 'none' },
          devModeBadge: { display: 'none' }
        }
      }}
      localization={{
        signIn: {
          start: {
            title: "Sign in to Ankit's Digital Twin",
            subtitle: "Welcome! Please verify your recruiter email to continue"
          }
        }
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
);
