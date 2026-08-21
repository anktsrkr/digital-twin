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
          devModeBadge: { display: 'none' }
        }
      }}
      localization={{
        signIn: {
          start: {
            title: "Sign in to Ankit's Digital Twin",
            subtitle: "Welcome! Please verify your recruiter email to continue"
          },
          emailCode: {
            subtitle: "Enter the 6-digit verification code sent to your email (subject line starts with [Development])"
          }
        },
        signUp: {
          start: {
            title: "Recruiter Access — Ankit's Digital Twin",
            subtitle: "Enter your work email for instant screening access"
          },
          emailCode: {
            subtitle: "Enter the 6-digit verification code sent to your email (subject line starts with [Development])"
          }
        }
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
);
