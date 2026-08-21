import React from 'react';
import { X, BookOpen, Tag, Calendar, Building, Database } from 'lucide-react';

export interface CitationDetail {
  title: string;
  sourceName: string;
  sourceLink?: string;
  category?: string;
  company?: string;
  role?: string;
  period?: string;
  technologies?: string[];
  content?: string;
}

interface CitationDrawerProps {
  isOpen: boolean;
  citation: CitationDetail | null;
  onClose: () => void;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({ isOpen, citation, onClose }) => {
  if (!isOpen || !citation) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 10000,
      animation: 'fadeIn 0.15s ease'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        height: '100%',
        background: '#FFFFFF',
        borderRadius: '16px 0 0 16px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.15rem',
        boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.12)',
        overflowY: 'auto',
        borderLeft: '1px solid var(--border-hairline)'
      }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-slate)', fontSize: '0.78125rem', fontWeight: 700 }}>
            <BookOpen size={15} />
            <span>Verified Architecture Source Dossier</span>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Citation Header */}
        <div>
          <span className="badge-mono" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
            {citation.category || 'Architecture Experience'}
          </span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem', letterSpacing: '-0.02em' }}>
            {citation.title || citation.sourceName}
          </h3>
          {citation.company && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '0.3rem' }}>
              <Building size={13} color="var(--text-muted)" />
              <span><strong>{citation.company}</strong> {citation.role ? `• ${citation.role}` : ''}</span>
            </div>
          )}
          {citation.period && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.78125rem', marginTop: '0.2rem' }}>
              <Calendar size={12} />
              <span>{citation.period}</span>
            </div>
          )}
        </div>

        {/* Content Box */}
        <div style={{
          background: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem',
          fontSize: '0.85rem',
          lineHeight: '1.62',
          color: 'var(--text-primary)',
          whiteSpace: 'pre-line'
        }}>
          {citation.content || 'Detailed context retrieved directly from the candidate\'s production resume database.'}
        </div>

        {/* Technologies Tag List */}
        {citation.technologies && citation.technologies.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.78125rem', fontWeight: 700, marginBottom: '0.45rem' }}>
              <Tag size={12} />
              <span>Technologies & Architecture</span>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {citation.technologies.map((t, idx) => (
                <span key={idx} className="badge-mono" style={{ background: '#FFFFFF', fontSize: '0.72rem' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Grounding note */}
        <div style={{
          marginTop: 'auto',
          background: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.72rem',
          color: 'var(--text-secondary)'
        }}>
          <Database size={14} color="var(--accent-slate)" />
          <span>Embedded via <strong>Jina AI (1024-dim)</strong> and indexed in <strong>MongoDB</strong>.</span>
        </div>
      </div>
    </div>
  );
};
