import React from 'react';
import { useHandleSignInCallback } from '@logto/react';
import { Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Callback: React.FC = () => {
  const { isLoading } = useHandleSignInCallback(() => {
    // Navigate back to app home page after successful sign in
    window.location.assign(import.meta.env.BASE_URL || '/');
  });

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8F9FA',
        backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        padding: '16px',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-sans, sans-serif)',
      }}
    >
      <div
        style={{
          position: 'relative',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '36px 32px',
          maxWidth: '440px',
          width: '100%',
          color: '#0F172A',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)',
          animation: 'modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box',
        }}
      >
        {/* Themed Icon Badge */}
        <div
          style={{
            display: 'inline-flex',
            padding: '16px',
            background: isLoading ? 'var(--accent-cobalt-subtle, #EFF6FF)' : 'var(--accent-emerald-subtle, #ECFDF5)',
            border: isLoading ? '1px solid var(--accent-cobalt-border, #BFDBFE)' : '1px solid var(--accent-emerald-border, #A7F3D0)',
            borderRadius: '50%',
            marginBottom: '18px',
          }}
        >
          {isLoading ? (
            <Loader2
              size={32}
              color="#1D4ED8"
              strokeWidth={2.2}
              style={{ animation: 'spin 1.2s linear infinite' }}
            />
          ) : (
            <CheckCircle2 size={32} color="#059669" strokeWidth={2.2} />
          )}
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
          {isLoading ? 'Authenticating...' : 'Redirecting...'}
        </h2>

        <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '22px', lineHeight: 1.6 }}>
          {isLoading
            ? 'Please wait while we verify your secure login.'
            : 'Authentication verified. Launching your executive session...'}
        </p>

        {/* Progress & Verification Track */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '4px',
              background: '#E2E8F0',
              borderRadius: '9999px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '50%',
                height: '100%',
                background: 'linear-gradient(90deg, #1D4ED8, #60A5FA, #1D4ED8)',
                borderRadius: '9999px',
                animation: 'progressSweep 1.6s ease-in-out infinite',
              }}
            />
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 500,
            }}
          >
            <ShieldCheck size={14} color="#1D4ED8" />
            <span>
              {isLoading
                ? 'Verifying OpenID Connect identity tokens...'
                : 'Session established'}
            </span>
          </div>
        </div>

        {/* Trust Footer Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px', color: '#64748B', fontSize: '0.75rem', fontWeight: 500 }}>
          <ShieldCheck size={14} color="#059669" />
          <span>Powered by Logto Security</span>
        </div>
      </div>
    </div>
  );
};
