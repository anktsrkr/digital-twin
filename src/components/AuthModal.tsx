import React from 'react';
import { Lock, ArrowRight, ShieldCheck, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
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
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '440px',
          width: '100%',
          color: '#0F172A',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)',
          animation: 'modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box',
          fontFamily: 'var(--font-sans, sans-serif)',
        }}
      >
        {/* Top-Right Dismiss Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#F1F5F9',
            border: '1px solid #E2E8F0',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#0F172A';
            e.currentTarget.style.background = '#E2E8F0';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#64748B';
            e.currentTarget.style.background = '#F1F5F9';
          }}
        >
          <X size={15} />
        </button>

        {/* Themed Icon Badge */}
        <div
          style={{
            display: 'inline-flex',
            padding: '16px',
            background: 'var(--accent-cobalt-subtle, #EFF6FF)',
            border: '1px solid var(--accent-cobalt-border, #BFDBFE)',
            borderRadius: '50%',
            marginBottom: '18px',
          }}
        >
          <Lock size={32} color="#1D4ED8" strokeWidth={2.2} />
        </div>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
          Recruiter Verification Required
        </h2>

        <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '24px', lineHeight: 1.6 }}>
          Access to this interactive Digital Twin and technical dossier requires verification. We use secure passwordless authentication.
        </p>

        {/* Primary Action Button */}
        <button
          onClick={() => onSuccess()}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '13px 20px',
            background: 'var(--accent-slate)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            fontSize: '0.92rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 2px 6px rgba(29, 78, 216, 0.22)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'var(--accent-slate-hover)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(29, 78, 216, 0.32)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'var(--accent-slate)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(29, 78, 216, 0.22)';
          }}
        >
          <span>Continue to Secure Login</span>
          <ArrowRight size={17} />
        </button>

        {/* Trust Footer Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px', color: '#64748B', fontSize: '0.75rem', fontWeight: 500 }}>
          <ShieldCheck size={14} color="#059669" />
          <span>Powered by Clerk Security</span>
        </div>
      </div>
    </div>
  );
};
