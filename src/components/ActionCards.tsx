import React from 'react';
import { Calendar, Download, Clock, ArrowUpRight, Globe, ShieldCheck } from 'lucide-react';

interface ScheduleMeetingCardProps {
  headline?: string;
  bookingUrl?: string;
  durations?: string[];
  recommendedTopic?: string;
}

export const ScheduleMeetingCard: React.FC<ScheduleMeetingCardProps> = ({
  headline = 'Schedule a Call or Technical Screening with Ankit Sarkar',
  bookingUrl = 'https://cal.com/ankitsarkar',
  durations = ['15 min intro', '30 min screening', '60 min system design'],
  recommendedTopic = 'AI Solutions Architecture, Agentic Systems & Enterprise Cloud'
}) => {
  return (
    <div style={{
      marginTop: '0.75rem',
      padding: '1.15rem 1.35rem',
      background: '#FFFFFF',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xs)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-slate)', fontSize: '0.78125rem', fontWeight: 700 }}>
          <Calendar size={14} />
          <span>Direct Calendar Booking</span>
        </div>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          background: 'var(--accent-emerald-subtle)',
          color: 'var(--accent-emerald)',
          border: '1px solid var(--accent-emerald-border)',
          padding: '0.12rem 0.5rem',
          borderRadius: 'var(--radius-full)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <span className="status-dot"></span>
          Instant Confirmation
        </span>
      </div>

      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem', lineHeight: 1.3 }}>
        {headline}
      </h4>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
        Recommended topic: <strong style={{ color: 'var(--text-primary)' }}>{recommendedTopic}</strong>
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.95rem' }}>
        <Clock size={12} color="var(--text-muted)" />
        {durations.map((d, i) => (
          <span key={i} style={{
            background: 'var(--bg-surface-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '0.72rem',
            fontWeight: 500,
            border: '1px solid var(--border-hairline)',
            padding: '0.15rem 0.45rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            {d}
          </span>
        ))}
      </div>

      <a 
        href={bookingUrl} 
        target="_blank" 
        rel="noreferrer" 
        className="btn-primary"
        style={{
          textDecoration: 'none',
          display: 'inline-flex',
          width: '100%',
          padding: '0.6rem 1.15rem',
          justifyContent: 'center',
          fontSize: '0.84rem'
        }}
      >
        <span>Open Cal.com Calendar (London / GMT Timezone)</span>
        <ArrowUpRight size={14} />
      </a>
    </div>
  );
};

interface DownloadResumeCardProps {
  pdfUrl?: string;
  fileName?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  blogUrl?: string;
}

export const DownloadResumeCard: React.FC<DownloadResumeCardProps> = ({
  pdfUrl,
  fileName = 'Ankit_Sarkar_AI_Solutions_Architect_Resume.pdf',
  githubUrl = 'https://github.com/anktsrkr',
  linkedinUrl = 'https://linkedin.com/in/sarkaran',
  blogUrl = 'https://anktsrkr.github.io'
}) => {
  const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const resolvedPdfUrl = !pdfUrl || pdfUrl === '/resume.pdf'
    ? `${basePath}/resume.pdf`
    : (pdfUrl.startsWith('/') && basePath && !pdfUrl.startsWith(basePath) ? `${basePath}${pdfUrl}` : pdfUrl);
  return (
    <div style={{
      marginTop: '0.75rem',
      padding: '1.15rem 1.35rem',
      background: '#FFFFFF',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xs)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-slate)', fontSize: '0.78125rem', fontWeight: 700 }}>
          <Download size={14} />
          <span>Official Verified Resume Assets</span>
        </div>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          background: 'var(--bg-surface-subtle)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-hairline)',
          padding: '0.12rem 0.5rem',
          borderRadius: 'var(--radius-full)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <ShieldCheck size={11} color="var(--accent-emerald)" />
          2-Page ATS Verified
        </span>
      </div>

      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem', lineHeight: 1.3 }}>
        Ankit Sarkar — AI Solutions Architect (Resume PDF)
      </h4>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
        Includes complete project breakdowns for ASDA (700k orders/wk), Boots UK, Belgian Railways, certifications & multi-agent systems.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <a 
          href={resolvedPdfUrl} 
          download={fileName}
          className="btn-primary"
          style={{
            textDecoration: 'none',
            flex: 1,
            minWidth: '160px',
            padding: '0.55rem 0.95rem'
          }}
        >
          <Download size={14} />
          <span>Download PDF Resume</span>
        </a>

        {blogUrl && (
          <a href={blogUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }} title="Technical Architecture Blog">
            <Globe size={13} color="var(--text-secondary)" />
            <span>Blog</span>
          </a>
        )}

        {githubUrl && (
          <a href={githubUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }} title="GitHub Portfolio">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            <span>GitHub</span>
          </a>
        )}

        {linkedinUrl && (
          <a href={linkedinUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }} title="LinkedIn Profile">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            <span>LinkedIn</span>
          </a>
        )}
      </div>
    </div>
  );
};
