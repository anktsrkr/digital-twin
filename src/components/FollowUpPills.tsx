import React from 'react';
import { FileDown, Calendar, Compass, MessageSquare, ArrowUpRight } from 'lucide-react';

export interface FollowUpPillItem {
  id: string;
  label: string;
  action_type: 'download_resume' | 'book_call' | 'ask_question' | string;
  category?: string;
  icon?: string;
  prompt: string;
}

interface FollowUpPillsProps {
  pills: FollowUpPillItem[];
  isLoading?: boolean;
  disabled?: boolean;
  onSelectPill: (pill: FollowUpPillItem) => void;
  title?: string;
  variant?: 'floating' | 'inline' | 'welcome';
}

const DEFAULT_ACTION_PILLS: FollowUpPillItem[] = [
  {
    id: 'action-download-resume',
    label: 'Download Resume',
    action_type: 'download_resume',
    category: 'Action',
    icon: 'file-text',
    prompt: "Can I download Ankit Sarkar's resume PDF?"
  },
  {
    id: 'action-book-call',
    label: 'Book a Call',
    action_type: 'book_call',
    category: 'Action',
    icon: 'calendar',
    prompt: "When is Ankit available for an interview?"
  }
];

export const FollowUpPills: React.FC<FollowUpPillsProps> = ({
  pills,
  isLoading = false,
  disabled = false,
  onSelectPill,
  title = 'Suggested Architecture Inquiries:',
  variant = 'floating'
}) => {
  const isWelcome = variant === 'welcome';

  // 1. Welcome Screen Loading State
  if (isLoading && isWelcome) {
    return (
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        flexWrap: 'wrap',
        padding: '0.4rem 0'
      }}>
        {[140, 120, 220, 240, 200].map((width, idx) => (
          <div
            key={`welcome-skeleton-${idx}`}
            style={{
              height: '32px',
              width: `${width}px`,
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-hairline)'
            }}
            className="shimmer"
          />
        ))}
      </div>
    );
  }

  // 2. Active pills resolution
  const currentPills = pills && pills.length > 0 ? pills : DEFAULT_ACTION_PILLS;
  const actionPills = currentPills.filter(p => 
    p.action_type === 'download_resume' || 
    p.action_type === 'book_call' || 
    p.id.includes('download') || 
    p.id.includes('book')
  );
  const displayActionPills = actionPills.length > 0 ? actionPills : DEFAULT_ACTION_PILLS;
  const questionPills = currentPills.filter(p => !displayActionPills.some(a => a.id === p.id));

  const renderPillButton = (pill: FollowUpPillItem) => {
    const isDownload = pill.action_type === 'download_resume' || pill.id.includes('download');
    const isBooking = pill.action_type === 'book_call' || pill.id.includes('book') || pill.id.includes('call');

    let bg = '#FFFFFF';
    let borderColor = 'var(--border-hairline)';
    let textColor = 'var(--text-secondary)';
    let hoverBg = 'var(--bg-surface-hover)';
    let hoverBorderColor = 'var(--border-subtle)';
    let hoverText = 'var(--text-primary)';
    let icon = <MessageSquare size={12} color="var(--text-secondary)" />;
    let shadow = 'var(--shadow-xs)';

    if (isDownload) {
      bg = 'var(--accent-emerald-subtle)';
      borderColor = 'var(--accent-emerald-border)';
      textColor = '#065F46';
      hoverBg = '#D1FAE5';
      hoverBorderColor = '#6EE7B7';
      hoverText = '#047857';
      icon = <FileDown size={13} color="#059669" />;
      shadow = '0 1px 3px rgba(5, 150, 105, 0.1)';
    } else if (isBooking) {
      bg = '#FFFFFF';
      borderColor = 'var(--accent-slate)';
      textColor = 'var(--accent-slate)';
      hoverBg = 'var(--bg-surface-hover)';
      hoverBorderColor = 'var(--accent-slate)';
      hoverText = 'var(--text-primary)';
      icon = <Calendar size={13} color="var(--accent-slate)" />;
      shadow = 'var(--shadow-xs)';
    }

    return (
      <button
        key={pill.id}
        onClick={() => onSelectPill(pill)}
        disabled={disabled}
        title={pill.prompt}
        style={{
          background: bg,
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--radius-full)',
          padding: isDownload || isBooking ? '0.35rem 0.85rem' : '0.32rem 0.75rem',
          fontSize: '0.78125rem',
          fontWeight: isDownload || isBooking ? 600 : 500,
          color: textColor,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          boxShadow: shadow
        }}
        onMouseEnter={(e) => {
          if (disabled) return;
          e.currentTarget.style.borderColor = hoverBorderColor;
          e.currentTarget.style.color = hoverText;
          e.currentTarget.style.background = hoverBg;
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
        onMouseLeave={(e) => {
          if (disabled) return;
          e.currentTarget.style.borderColor = borderColor;
          e.currentTarget.style.color = textColor;
          e.currentTarget.style.background = bg;
          e.currentTarget.style.boxShadow = shadow;
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span>{pill.label}</span>
        {(isDownload || isBooking) && (
          <ArrowUpRight size={11} style={{ opacity: 0.6, marginLeft: '-0.15rem' }} />
        )}
      </button>
    );
  };

  return (
    <div style={{
      width: '100%',
      position: 'relative',
      padding: isWelcome ? '0.4rem 0' : '0.25rem 0.1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: isWelcome ? 'wrap' : 'nowrap',
        justifyContent: isWelcome ? 'center' : 'flex-start',
        gap: '0.45rem',
        overflowX: isWelcome ? 'visible' : 'auto',
        padding: isWelcome ? '0.4rem 0' : '0.25rem 0.1rem',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {/* Header Tag */}
        {!isWelcome && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--text-secondary)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            flexShrink: 0,
            padding: '0.22rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-hairline)'
          }}>
            <Compass size={11} color="var(--text-primary)" />
            <span>{isLoading ? 'Synthesizing...' : title}</span>
          </div>
        )}

        {/* 1. Always Render Action Pills */}
        {displayActionPills.map(renderPillButton)}

        {/* 2. When Loading in Floating Bar: Show Shimmer Skeletons for Question Pills */}
        {isLoading ? (
          <>
            {[160, 200, 150].map((width, idx) => (
              <div
                key={`loading-skeleton-${idx}`}
                style={{
                  height: '30px',
                  width: `${width}px`,
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-hairline)',
                  flexShrink: 0
                }}
                className="shimmer"
              />
            ))}
          </>
        ) : (
          /* 3. When Done: Render Generated Question Pills */
          questionPills.map(renderPillButton)
        )}
      </div>
    </div>
  );
};
