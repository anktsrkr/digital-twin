import React from 'react';
import { Sparkles, ShoppingBag, Cpu, ShieldCheck, Cloud, Award } from 'lucide-react';

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

interface SuggestionItem {
  id: string;
  category: string;
  icon: React.ReactNode;
  label: string;
  query: string;
  tagColor: string;
}

const SUGGESTED_PROMPTS: SuggestionItem[] = [
  {
    id: 'asda',
    category: 'Flagship Scale',
    icon: <ShoppingBag size={14} color="#059669" />,
    label: 'ASDA Picking Platform (700k orders/wk)',
    query: 'Tell me about your role and scale on ASDA\'s eCommerce picking platform.',
    tagColor: '#ECFDF5'
  },
  {
    id: 'agentic',
    category: 'AI Architecture',
    icon: <Cpu size={14} color="#4F46E5" />,
    label: 'Agentic AI, MCP & Microsoft Agent Framework',
    query: 'How do you build Agentic AI solutions with Microsoft Agent Framework & MCP?',
    tagColor: '#EEF2FF'
  },
  {
    id: 'rag-spicedb',
    category: 'Security & RAG',
    icon: <ShieldCheck size={14} color="#D97706" />,
    label: 'Enterprise RAG with SpiceDB ReBAC Authorization',
    query: 'How do you design Enterprise RAG with fine-grained SpiceDB authorization?',
    tagColor: '#FFFBEB'
  },
  {
    id: 'modernisation',
    category: 'Enterprise Cloud',
    icon: <Cloud size={14} color="#0284C7" />,
    label: 'Boots UK & Belgian Railways Cloud Modernisation',
    query: 'What was your architectural impact at Boots UK and Belgian Railways (NMBS)?',
    tagColor: '#F0F9FF'
  },
  {
    id: 'certs',
    category: 'Credentials',
    icon: <Award size={14} color="#7C3AED" />,
    label: 'Azure & Anthropic Certifications',
    query: 'What are your professional Microsoft, Anthropic and GitHub certifications?',
    tagColor: '#F5F3FF'
  }
];

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt, disabled }) => {
  return (
    <div style={{
      width: '100%',
      position: 'relative',
      padding: '0.2rem 0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        padding: '0.35rem 0.25rem',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: '#4F46E5',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          flexShrink: 0,
          padding: '0.25rem 0.5rem',
          borderRadius: '6px',
          background: 'rgba(99, 102, 241, 0.08)'
        }}>
          <Sparkles size={13} />
          <span>Suggested:</span>
        </div>

        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPrompt(p.query)}
            disabled={disabled}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '9999px',
              padding: '0.38rem 0.85rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}
            onMouseEnter={(e) => {
              if (disabled) return;
              e.currentTarget.style.borderColor = '#818CF8';
              e.currentTarget.style.color = '#312E81';
              e.currentTarget.style.background = '#EEF2FF';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 3px 8px rgba(79, 70, 229, 0.12)';
            }}
            onMouseLeave={(e) => {
              if (disabled) return;
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.04)';
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
