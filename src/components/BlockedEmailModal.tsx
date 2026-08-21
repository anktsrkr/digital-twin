import React from 'react';
import { ShieldX, LogOut, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';

interface BlockedEmailModalProps {
  isOpen: boolean;
  email?: string;
  domain?: string;
  onSignOut: () => void;
}

export const BlockedEmailModal: React.FC<BlockedEmailModalProps> = ({
  isOpen,
  email,
  domain,
  onSignOut,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        padding: '16px',
        animation: 'overlayFadeIn 0.2s ease-out',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          background: '#FFFFFF',
          border: '1px solid #FECACA',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '440px',
          width: '100%',
          color: '#0F172A',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(239, 68, 68, 0.12)',
          animation: 'modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box',
          fontFamily: 'var(--font-sans, sans-serif)',
        }}
      >
        {/* Themed Icon Badge */}
        <div
          style={{
            display: 'inline-flex',
            padding: '16px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '50%',
            marginBottom: '18px',
          }}
        >
          <ShieldX size={32} color="#DC2626" strokeWidth={2.2} />
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#DC2626', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
          Disposable Email Blocked
        </h2>

        <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '18px', lineHeight: 1.6 }}>
          Temporary or disposable email addresses are not permitted for security and audit integrity.
        </p>

        {/* Email Pill Box */}
        {email && (
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '14px',
              fontSize: '0.8125rem',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              wordBreak: 'break-all',
            }}
          >
            <Mail size={15} color="#64748B" />
            <span style={{ fontWeight: 500 }}>{email}</span>
            {domain && (
              <span
                style={{
                  background: '#FEE2E2',
                  color: '#DC2626',
                  border: '1px solid #FCA5A5',
                  borderRadius: '4px',
                  padding: '1px 6px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  marginLeft: '4px',
                }}
              >
                {domain}
              </span>
            )}
          </div>
        )}

        {/* Domain Policy Notice */}
        <div
          style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '22px',
            fontSize: '0.75rem',
            color: '#92400E',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            textAlign: 'left',
            lineHeight: 1.5,
          }}
        >
          <AlertTriangle size={15} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            Please sign in with a verified corporate domain (e.g. <code style={{ background: '#FEF3C7', padding: '1px 4px', borderRadius: '3px' }}>@company.com</code>) or standard provider (Gmail, Outlook, iCloud).
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onSignOut}
          style={{
            width: '100%',
            padding: '13px 20px',
            background: '#DC2626',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.92rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.2)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#B91C1C';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(220, 38, 38, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#DC2626';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(220, 38, 38, 0.2)';
          }}
        >
          <LogOut size={17} />
          <span>Sign Out & Use Another Email</span>
        </button>

        {/* Trust Footer Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px', color: '#64748B', fontSize: '0.75rem', fontWeight: 500 }}>
          <ShieldCheck size={14} color="#059669" />
          <span>Powered by Logto Security</span>
        </div>
      </div>
    </div>
  );
};
