import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  Lock, 
  ArrowUpRight, 
  Send, 
  Square, 
  AlertCircle, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Zap, 
  Bot, 
  Building2, 
  Calendar, 
  User,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react';
import { 
  useAgent,
  useCopilotKit,
  useRenderTool,
  useRenderToolCall,
} from '@copilotkit/react-core/v2';
import { useAuth } from '@clerk/clerk-react';
import { z } from 'zod';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { CitationDetail } from './CitationDrawer';
import { ScheduleMeetingCard, DownloadResumeCard } from './ActionCards';
import { LiveSlotPicker } from './LiveSlotPicker';
import { FollowUpPills, type FollowUpPillItem } from './FollowUpPills';
import { getSavedRecruiterSession } from '../lib/session';

interface DigitalTwinChatProps {
  isAuthenticated: boolean;
  recruiterEmail?: string;
  token?: string | null;
  onOpenAuth: () => void;
  onOpenCitation: (citation: CitationDetail) => void;
  onBlockedEmail?: () => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
  onAgentStateChange?: (isRunning: boolean) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

interface QuickPromptItem {
  icon: React.ReactNode;
  title: string;
  prompt: string;
  tag: string;
}

const QUICK_PROMPTS: QuickPromptItem[] = [
  {
    icon: <Zap size={15} color="#D97706" />,
    title: "ASDA Peak Resilience",
    prompt: "How was zero downtime maintained during 90k/30-min peak trading surges at ASDA?",
    tag: "High Scale"
  },
  {
    icon: <Bot size={15} color="#2563EB" />,
    title: "Enterprise Agentic AI",
    prompt: "How do you implement secure MCP tool calling and SpiceDB ReBAC in production?",
    tag: "AI & Security"
  },
  {
    icon: <Building2 size={15} color="#059669" />,
    title: "Cloud Modernisation",
    prompt: "Walk me through the Boots UK 25k-user identity and cloud modernisation.",
    tag: "Cloud Native"
  },
  {
    icon: <Calendar size={15} color="#1D4ED8" />,
    title: "Interview Availability",
    prompt: "When is Ankit available for an interview or technical screening call?",
    tag: "Live Scheduling"
  }
];

const INITIAL_PILLS: FollowUpPillItem[] = [
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
  },
  {
    id: 'default-asda',
    label: "ASDA Scale & Zero-Incident Resilience",
    action_type: 'ask_question',
    category: 'Flagship Scale',
    icon: 'sparkles',
    prompt: "How did you achieve zero downtime during ASDA's 90k/30-min peak trading?"
  },
  {
    id: 'default-agentic',
    label: "Agentic AI, MCP & Enterprise Security",
    action_type: 'ask_question',
    category: 'AI Architecture',
    icon: 'sparkles',
    prompt: "How do you secure MCP tool calling and multi-agent workflows in production?"
  },
  {
    id: 'default-visa',
    label: "UK Visa Sponsorship & Availability",
    action_type: 'ask_question',
    category: 'Authorisation',
    icon: 'sparkles',
    prompt: "What is your UK Skilled Worker visa status, notice period, and location preference?"
  }
];

const parseResult = (data: any) => {
  if (!data) return {};
  let current = data;
  if (typeof current === 'string') {
    try {
      current = JSON.parse(current);
    } catch {
      return { message: data };
    }
  }
  if (current?.result) {
    if (typeof current.result === 'string') {
      try {
        current = JSON.parse(current.result);
      } catch {
        current = current.result;
      }
    } else {
      current = current.result;
    }
  }
  return current ?? {};
};

/**
 * Clean up raw error strings that might contain escaped JSON error payloads from Cal.com
 */
const sanitizeErrorMessage = (rawMsg?: string): string => {
  if (!rawMsg) return 'Please select another time slot or visit cal.com/ankitsarkar to book directly.';
  if (typeof rawMsg === 'string') {
    if (rawMsg.includes('already has booking') || rawMsg.includes('not available')) {
      return "This specific slot is no longer open or conflicts with an existing appointment on Ankit's calendar. Please select another slot or book directly on Cal.com.";
    }
    if (rawMsg.includes('{')) {
      try {
        const jsonIdx = rawMsg.indexOf('{');
        const jsonPart = rawMsg.substring(jsonIdx);
        const parsedObj = JSON.parse(jsonPart);
        const candidateMsg = parsedObj?.error?.message || parsedObj?.details?.message || parsedObj?.message;
        if (candidateMsg) {
          if (candidateMsg === 'email_domain_cannot_receive_mail') {
            return 'Cal.com cannot deliver calendar invites to this email domain. Please use a verified company email address.';
          }
          if (candidateMsg.includes('already has booking') || candidateMsg.includes('not available')) {
            return "This specific slot is no longer open or conflicts with an existing appointment on Ankit's calendar. Please select another slot or book directly on Cal.com.";
          }
          return candidateMsg;
        }
      } catch {
        // fallback
      }
    }
  }
  return rawMsg;
};

interface KnowledgeSearchCardProps {
  status: string;
  parameters: any;
  result: any;
  onOpenCitation: (citation: CitationDetail) => void;
}

const KnowledgeSearchCard: React.FC<KnowledgeSearchCardProps> = ({
  status,
  parameters,
  result,
  onOpenCitation,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const query = parameters?.query || 'Resume & Architecture';

  if (status !== 'complete') {
    return (
      <div className="telemetry-strip" style={{ margin: '0.5rem 0', width: '100%', maxWidth: '100%' }}>
        <div className="telemetry-spinner" />
        <div className="telemetry-text">
          <span>Evaluating verified architecture case studies for <em>"{query}"</em></span>
          <span className="telemetry-badge">MongoDB • Jina AI</span>
        </div>
      </div>
    );
  }

  const parsed = parseResult(result);
  const citations = parsed?.citations || [];
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div style={{
      margin: '0.6rem 0',
      background: '#FFFFFF',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-xs)',
      animation: 'slideUpFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Header Bar */}
      <div style={{
        padding: '0.55rem 0.85rem',
        background: 'var(--bg-surface-subtle)',
        borderBottom: isExpanded ? '1px solid var(--border-hairline)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.45rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <CheckCircle2 size={13} color="var(--accent-emerald)" />
          <span>Grounded in <strong>{citations.length} verified production sources</strong> for <em>"{query}"</em></span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: 'var(--text-primary)',
            fontSize: '0.7rem',
            fontWeight: 600
          }}
        >
          <span>{isExpanded ? 'Hide Excerpts' : 'View Excerpts'}</span>
          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Clickable Citation Chips */}
      <div style={{ padding: '0.55rem 0.85rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {citations.map((c: any, idx: number) => (
          <button
            key={idx}
            onClick={() => onOpenCitation({
              title: c.title || c.source_name || 'Resume Section',
              sourceName: c.source_name || c.title || 'Resume',
              sourceLink: c.source_link,
              category: c.category || 'Experience',
              company: c.company,
              role: c.role,
              period: c.period,
              technologies: c.technologies || [],
              content: c.content
            })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.6rem',
              background: '#FFFFFF',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.72rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              boxShadow: 'var(--shadow-xs)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-medium)';
              e.currentTarget.style.background = 'var(--bg-surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hairline)';
              e.currentTarget.style.background = '#FFFFFF';
            }}
            title="Click to view full architecture & tech stack in detail drawer"
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              [SRC-0{idx + 1}]
            </span>
            <BookOpen size={11} color="var(--text-secondary)" />
            <span>{c.title || c.source_name}</span>
          </button>
        ))}
      </div>

      {/* Collapsible raw excerpt view */}
      {isExpanded && (
        <div style={{
          padding: '0.75rem 0.95rem',
          background: 'var(--bg-surface-muted)',
          borderTop: '1px solid var(--border-hairline)',
          maxHeight: '220px',
          overflowY: 'auto',
          fontSize: '0.75rem',
          lineHeight: 1.55,
          color: 'var(--text-secondary)'
        }}>
          {citations.map((c: any, idx: number) => (
            <div key={idx} style={{ marginBottom: '0.65rem', paddingBottom: '0.5rem', borderBottom: idx < citations.length - 1 ? '1px dashed var(--border-hairline)' : 'none' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>[SRC-0{idx + 1}]</span>
                <span>{c.title}</span>
                {c.company && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({c.company})</span>}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.2rem', whiteSpace: 'pre-line' }}>
                {c.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const DigitalTwinChat: React.FC<DigitalTwinChatProps> = ({
  isAuthenticated,
  recruiterEmail,
  token,
  onOpenAuth,
  onOpenCitation,
  onBlockedEmail,
  externalPrompt,
  onClearExternalPrompt,
  onAgentStateChange,
  isSidebarCollapsed = false,
  onToggleSidebar
}) => {
  const { getToken, isSignedIn } = useAuth();
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();
  const renderToolCall = useRenderToolCall();
  const [input, setInput] = useState('');
  const [followUpPills, setFollowUpPills] = useState<FollowUpPillItem[]>(INITIAL_PILLS);
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(false);
  const prevIsRunningRef = useRef(agent.isRunning);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Notify parent of agent running state
  useEffect(() => {
    if (onAgentStateChange) {
      onAgentStateChange(agent.isRunning);
    }
  }, [agent.isRunning, onAgentStateChange]);

  // Maintain fresh auth state in ref so callbacks and tool renders always see latest session
  const authRef = useRef({ isAuthenticated, recruiterEmail });
  authRef.current = { isAuthenticated, recruiterEmail };

  // Pending slot or prompt to execute after authentication
  const pendingSlotRef = useRef<{ slot: any; duration: number } | null>(null);
  const pendingPromptRef = useRef<string | null>(null);

  // Handle slot booking — sends a message to trigger BookInterviewSlot via the agent
  const handleSlotBooking = useCallback(async (slot: any, duration: number) => {
    const email = authRef.current.recruiterEmail || recruiterEmail || localStorage.getItem('recruiter_email');
    const isAuthed = authRef.current.isAuthenticated || isAuthenticated || !!email;

    if (!isAuthed || !email) {
      pendingSlotRef.current = { slot, duration };
      onOpenAuth();
      return;
    }

    const company = localStorage.getItem('recruiter_company');
    const name = company ? `${company} Recruiter` : 'Recruiter';
    const slotTimeUtc = slot.time_utc || slot.raw_time || slot.time;
    const formatted = slot.formatted_time || slot.time_utc;

    const bookingMessage = `Please book the ${formatted} (${slotTimeUtc}) slot (${duration} minutes) for ${name} at ${email}.`;
    
    // Prune any legacy reasoning messages from frontend state
    if (Array.isArray(agent.messages) && typeof (agent as any).setMessages === 'function') {
      const clean = agent.messages.filter((m: any) => m.role !== 'reasoning' && m.type !== 'reasoning' && m.role !== 'activity');
      if (clean.length !== agent.messages.length) {
        (agent as any).setMessages(clean);
      }
    }

    // Ensure CopilotKit runtime headers contain the live Clerk session token before executing the agent
    let activeToken = token;
    if (isSignedIn) {
      try {
        const freshToken = await getToken();
        if (freshToken) activeToken = freshToken;
      } catch (err) {
        console.warn('Could not refresh Clerk token before booking slot:', err);
      }
    }
    if (!activeToken) {
      const session = getSavedRecruiterSession();
      activeToken = session?.token || (typeof window !== 'undefined' ? localStorage.getItem('recruiter_token') : null);
    }

    if (activeToken) {
      copilotkit.setHeaders({
        ...copilotkit.headers,
        Authorization: `Bearer ${activeToken}`,
      });
    }

    agent.addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: bookingMessage,
    });

    await copilotkit.runAgent({ agent });
  }, [isAuthenticated, recruiterEmail, token, isSignedIn, getToken, onOpenAuth, agent, copilotkit]);

  // If recruiter completes authentication while having a pending slot, auto-book it immediately
  useEffect(() => {
    if (isAuthenticated) {
      if (pendingSlotRef.current) {
        const { slot, duration } = pendingSlotRef.current;
        pendingSlotRef.current = null;
        handleSlotBooking(slot, duration);
      }
    }
  }, [isAuthenticated, handleSlotBooking]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agent.messages, agent.isRunning]);

  // 0. Tool Renderer: SearchResumeKnowledgeBase
  useRenderTool({
    name: 'SearchResumeKnowledgeBase',
    parameters: z.object({
      query: z.string(),
    }),
    render: ({ status, parameters, result }: any) => {
      return (
        <KnowledgeSearchCard
          status={status}
          parameters={parameters}
          result={result}
          onOpenCitation={onOpenCitation}
        />
      );
    }
  });

  // 1. Tool Renderer: ShowScheduleInterviewCard
  useRenderTool({
    name: 'ShowScheduleInterviewCard',
    parameters: z.object({
      interviewType: z.string().optional(),
      recommendedDurationMinutes: z.number().optional(),
    }),
    render: ({ parameters, result }: any) => {
      const parsed = parseResult(result);
      return (
        <ScheduleMeetingCard 
          headline={parsed?.headline || "Schedule a Call or Technical Screening with Ankit Sarkar"}
          recommendedTopic={parsed?.recommended_topic || parameters?.interviewType || 'AI Solutions Architecture, Agentic Systems & Enterprise Cloud'}
          bookingUrl={parsed?.booking_url || "https://cal.com/ankitsarkar"}
          durations={parsed?.available_durations || ['15 min intro', '30 min screening', '60 min system design']}
        />
      );
    }
  });

  // 2. Tool Renderer: ShowDownloadResumeCard
  useRenderTool({
    name: 'ShowDownloadResumeCard',
    parameters: z.object({
      format: z.string().optional(),
    }),
    render: () => {
      return <DownloadResumeCard />;
    }
  });

  // 3. Tool Renderer: GetAvailableInterviewSlots
  useRenderTool({
    name: 'GetAvailableInterviewSlots',
    parameters: z.object({
      durationInMinutes: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      timeZone: z.string().optional(),
    }),
    render: ({ status, result, parameters }: any) => {
      const parsed = parseResult(result);
      const slots = parsed?.slots || parsed?.Slots || [];
      const timeZone = parsed?.time_zone || parsed?.TimeZone || 'Europe/London';
      const bookingUrl = parsed?.booking_url || parsed?.BookingUrl || 'https://cal.com/ankitsarkar/30min';
      const duration = parameters?.durationInMinutes || parsed?.duration || 30;

      if (status !== 'complete' && slots.length === 0) {
        return (
          <div className="telemetry-strip" style={{ margin: '0.6rem 0', width: '100%' }}>
            <div className="telemetry-spinner" />
            <div className="telemetry-text">
              <span>Retrieving real-time availability from Cal.com ({duration}-min slots, {timeZone})...</span>
              <span className="telemetry-badge">Cal.com API v2</span>
            </div>
          </div>
        );
      }

      return (
        <LiveSlotPicker 
          slots={slots}
          timeZone={timeZone}
          duration={duration}
          bookingUrl={bookingUrl}
          isBooking={agent.isRunning}
          onSelectSlot={(slot, chosenDuration) => {
            handleSlotBooking(slot, chosenDuration || duration);
          }}
        />
      );
    }
  }, [handleSlotBooking, agent.isRunning]);

  // 4. Tool Renderer: BookInterviewSlot
  useRenderTool({
    name: 'BookInterviewSlot',
    parameters: z.object({
      recruiterName: z.string(),
      slotStartTimeUtc: z.string(),
      recruiterEmail: z.string().optional(),
      durationInMinutes: z.number().optional(),
      timeZone: z.string().optional(),
      notes: z.string().optional(),
    }),
    render: ({ status, result, parameters }: any) => {
      const email = parameters?.recruiterEmail || (isAuthenticated ? recruiterEmail : 'your email');
      const name = parameters?.recruiterName || 'Recruiter';
      const tz = parameters?.timeZone || 'Europe/London';

      if (status !== 'complete') {
        return (
          <div className="telemetry-strip" style={{ margin: '0.6rem 0', width: '100%' }}>
            <div className="telemetry-spinner" />
            <div className="telemetry-text">
              <span>Confirming interview reservation & generating video meeting room for {name}...</span>
              <span className="telemetry-badge">Cal.com Instant Booking</span>
            </div>
          </div>
        );
      }

      const parsed = parseResult(result);
      const success = parsed?.success !== false;
      
      if (!success) {
        const errorText = sanitizeErrorMessage(parsed?.message);
        return (
          <div style={{
            margin: '0.75rem 0',
            background: 'linear-gradient(145deg, #FEF2F2 0%, #FFF5F5 100%)',
            border: '1px solid #FECACA',
            borderRadius: '18px',
            padding: '1.25rem',
            boxShadow: '0 4px 16px rgba(220, 38, 38, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: '#FEE2E2', color: '#DC2626',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertCircle size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.925rem' }}>
                  Booking Request Unsuccessful
                </div>
                <div style={{ fontSize: '0.75rem', color: '#B91C1C' }}>
                  Attempted for {name} ({email})
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#7F1D1D', margin: '0.4rem 0 0.85rem', lineHeight: 1.5 }}>
              {errorText}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <a
                href="https://cal.com/ankitsarkar/30min"
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{
                  textDecoration: 'none',
                  fontSize: '0.78125rem',
                  padding: '0.45rem 0.85rem',
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                  borderColor: '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>Open Cal.com (30min)</span>
                <ArrowUpRight size={13} />
              </a>
              <a
                href="https://cal.com/ankitsarkar/15min"
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  padding: '0.45rem 0.75rem',
                  background: '#FFFFFF',
                  color: '#991B1B',
                  border: '1px solid #FECACA',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontWeight: 600
                }}
              >
                <span>15min Intro</span>
                <ArrowUpRight size={12} />
              </a>
              <a
                href="https://cal.com/ankitsarkar/60min"
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  padding: '0.45rem 0.75rem',
                  background: '#FFFFFF',
                  color: '#991B1B',
                  border: '1px solid #FECACA',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontWeight: 600
                }}
              >
                <span>60min Deep-Dive</span>
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        );
      }

      // Parse the booking time for nice display
      const bookingTimeUtc = parsed?.booking_time_utc || parameters?.slotStartTimeUtc || '';
      let displayDate = '';
      let displayTime = '';
      let displayLocalTime = '';
      try {
        const dt = new Date(bookingTimeUtc);
        displayDate = dt.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: tz });
        displayTime = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false }) + ' UTC';
        displayLocalTime = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz, hour12: true, timeZoneName: 'short' });
      } catch {
        displayDate = bookingTimeUtc;
      }

      const meetingUrl = parsed?.booking_url || parsed?.BookingUrl;

      return (
        <div style={{
          margin: '0.75rem 0',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15), 0 2px 8px rgba(0,0,0,0.05)',
        }}>
          {/* Green success header */}
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            padding: '1.1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle2 size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
                Interview Confirmed! 🎉
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem', marginTop: '0.15rem' }}>
                Calendar invite & video link sent to {email}
              </div>
            </div>
          </div>

          {/* Booking details body */}
          <div style={{
            background: '#FFFFFF',
            padding: '1.25rem 1.5rem',
            borderLeft: '1px solid #D1FAE5',
            borderRight: '1px solid #D1FAE5',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                  Date
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                  {displayDate || '—'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                  Time
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                  {displayLocalTime || displayTime || '—'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                  Attendee
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                  {parsed?.attendee_name || name}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                  {parsed?.attendee_email || email}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                  Host
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                  Ankit Sarkar
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                  AI Solutions Architect
                </div>
              </div>
            </div>
          </div>

          {/* Action footer */}
          <div style={{
            background: '#F9FAFB',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #E5E7EB',
            borderLeft: '1px solid #D1FAE5',
            borderRight: '1px solid #D1FAE5',
            borderBottom: '1px solid #D1FAE5',
            borderRadius: '0 0 20px 20px',
          }}>
            <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>
              📅 .ics invite delivered to your inbox
            </span>
            {meetingUrl && (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#FFFFFF',
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
                }}
              >
                <span>Join Video Call</span>
                <ArrowUpRight size={13} />
              </a>
            )}
          </div>
        </div>
      );
    }
  });

  // Send message handler
  const sendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    const email = authRef.current.recruiterEmail || recruiterEmail || localStorage.getItem('recruiter_email');
    const isAuthed = authRef.current.isAuthenticated || isAuthenticated || !!email;

    if (!isAuthed) {
      pendingPromptRef.current = text;
      onOpenAuth();
      return;
    }

    // Prune any legacy reasoning messages from frontend state
    if (Array.isArray(agent.messages) && typeof (agent as any).setMessages === 'function') {
      const clean = agent.messages.filter((m: any) => m.role !== 'reasoning' && m.type !== 'reasoning' && m.role !== 'activity');
      if (clean.length !== agent.messages.length) {
        (agent as any).setMessages(clean);
      }
    }

    agent.addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    });

    setInput('');
    inputRef.current?.focus();

    // Ensure CopilotKit runtime headers contain the live Clerk session token before executing the agent
    let activeToken = token;
    if (isSignedIn) {
      try {
        const freshToken = await getToken();
        if (freshToken) activeToken = freshToken;
      } catch (err) {
        console.warn('Could not refresh Clerk token before sending message:', err);
      }
    }
    if (!activeToken) {
      const session = getSavedRecruiterSession();
      activeToken = session?.token || (typeof window !== 'undefined' ? localStorage.getItem('recruiter_token') : null);
    }

    if (activeToken) {
      copilotkit.setHeaders({
        ...copilotkit.headers,
        Authorization: `Bearer ${activeToken}`,
      });
    }

    try {
      await copilotkit.runAgent({ agent });
    } catch (err: any) {
      const errStr = String(err?.message || err);
      if (errStr.includes('403') || errStr.toLowerCase().includes('disposable')) {
        onBlockedEmail?.();
      }
    }
  }, [input, agent, copilotkit, isAuthenticated, recruiterEmail, token, isSignedIn, getToken, onOpenAuth, onBlockedEmail]);

  // Reactive agent error listener (catches 403 / DisposableEmail on /agentic_chat stream)
  useEffect(() => {
    const error = (agent as any).error;
    if (error) {
      const errStr = String(error?.message || error);
      if (errStr.includes('403') || errStr.toLowerCase().includes('disposable')) {
        onBlockedEmail?.();
      }
    }
  }, [(agent as any).error, onBlockedEmail]);

  // Stop agent handler
  const stopAgent = useCallback(() => {
    copilotkit.stopAgent({ agent });
  }, [agent, copilotkit]);

  // Handle actionable pill selection
  const handleSelectPill = useCallback((pill: FollowUpPillItem) => {
    if (pill.action_type === 'download_resume' || pill.id.includes('download')) {
      // Direct browser download of PDF
      const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      const link = document.createElement('a');
      link.href = `${basePath}/resume.pdf`;
      link.download = 'Ankit_Sarkar_AI_Solutions_Architect_Resume.pdf';
      link.click();

      const email = authRef.current.recruiterEmail || recruiterEmail || localStorage.getItem('recruiter_email');
      const isAuthed = authRef.current.isAuthenticated || isAuthenticated || !!email;
      if (isAuthed) {
        sendMessage(pill.prompt || "Can I download Ankit Sarkar's resume PDF?");
      }
    } else if (pill.action_type === 'book_call' || pill.id.includes('book')) {
      sendMessage(pill.prompt || "When is Ankit available for an interview or screening call?");
    } else {
      sendMessage(pill.prompt);
    }
  }, [sendMessage, isAuthenticated, recruiterEmail]);

  // Query the independent FollowUpAgent whenever agent finishes streaming a response
  useEffect(() => {
    const wasRunning = prevIsRunningRef.current;
    prevIsRunningRef.current = agent.isRunning;

    if (agent.isRunning) {
      // While the digital twin is responding, show active generating/shimmer state
      setIsLoadingFollowUps(true);
    } else if (wasRunning && !agent.isRunning && agent.messages.length > 0) {
      const fetchFollowUps = async () => {
        try {
          setIsLoadingFollowUps(true);
          const payloadMessages = agent.messages
            .filter((m: any) => (m.role === 'user' || m.role === 'assistant') && m.role !== 'reasoning')
            .map((m: any) => {
              let text = m.content;
              if (Array.isArray(m.contents)) {
                const textParts = m.contents.filter((c: any) => c.$type === 'text' || c.type === 'text');
                if (textParts.length > 0) text = textParts.map((t: any) => t.text).join('\n');
              }
              return {
                role: m.role || 'user',
                content: typeof text === 'string' ? text : JSON.stringify(text || '')
              };
            });

          let sessionToken: string | null = token || null;
          if (isSignedIn) {
            try {
              const fresh = await getToken();
              if (fresh) sessionToken = fresh;
            } catch {}
          }
          if (!sessionToken) {
            const session = getSavedRecruiterSession();
            sessionToken = session?.token || (typeof window !== 'undefined' ? localStorage.getItem('recruiter_token') : null);
          }

          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (sessionToken) {
            headers['Authorization'] = `Bearer ${sessionToken}`;
          }

          const res = await fetch(`${backendUrl}/api/followup/suggestions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ messages: payloadMessages })
          });

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.pills) && data.pills.length > 0) {
              setFollowUpPills(data.pills);
            }
          }
        } catch (err) {
          console.warn('Could not load dynamic follow-up suggestions:', err);
        } finally {
          setIsLoadingFollowUps(false);
        }
      };

      fetchFollowUps();
    }
  }, [agent.isRunning, agent.messages, backendUrl, token, isSignedIn, getToken]);

  // Intercept citation clicks
  useEffect(() => {
    const handleCitationClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.hash && target.hash.startsWith('#')) {
        e.preventDefault();
        const anchor = target.hash;
        const title = target.textContent || 'Verified Resume Context';
        onOpenCitation({
          title,
          sourceName: title,
          sourceLink: anchor,
          category: anchor.includes('skills') ? 'Skills' : (anchor.includes('cert') ? 'Certifications' : 'Experience'),
          company: anchor.includes('asda') ? 'ASDA / Major UK Retailer' : (anchor.includes('boots') ? 'Boots UK' : (anchor.includes('nmbs') ? 'NMBS Belgian Railways' : undefined)),
          content: `Verified architectural documentation for: ${title}`
        });
      }
    };

    document.addEventListener('click', handleCitationClick);
    return () => {
      document.removeEventListener('click', handleCitationClick);
    };
  }, [onOpenCitation]);

  // Handle external prompt injection from sidebar
  useEffect(() => {
    if (externalPrompt && !agent.isRunning) {
      sendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt, agent.isRunning, sendMessage, onClearExternalPrompt]);

  const hasMessages = agent.messages.length > 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        flex: 1,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-hairline)',
        boxShadow: 'var(--shadow-xs)',
        background: '#FFFFFF',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Terminal Header Bar */}
        <div style={{
          padding: '0.55rem 1rem',
          background: 'var(--bg-surface-subtle)',
          borderBottom: '1px solid var(--border-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.45rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="sidebar-toggle-btn"
                title={isSidebarCollapsed ? "Expand Architecture Dossier (Ctrl+B)" : "Collapse Architecture Dossier (Ctrl+B)"}
                aria-label={isSidebarCollapsed ? "Expand Architecture Dossier" : "Collapse Architecture Dossier"}
              >
                {isSidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
                <span className="sidebar-toggle-label">
                  {isSidebarCollapsed ? 'Show Dossier' : 'Sidebar'}
                </span>
                <span className="shortcut-hint" style={{ display: isSidebarCollapsed ? 'none' : 'inline-block' }}>⌘B</span>
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="status-dot"></span>
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Interactive Digital Twin Terminal
              </span>
            </div>
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Grounded on Verified Production Architecture
          </span>
        </div>

        {/* ========== WELCOME SCREEN (shown when no messages) ========== */}
        {!hasMessages && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            textAlign: 'center',
            overflowY: 'auto'
          }}>
            {/* Header Badge */}
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--accent-slate)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '0.65rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)'
            }}>
              <Terminal size={20} />
            </div>

            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
              marginBottom: '0.25rem'
            }}>
              Interactive Architecture Terminal
            </h2>
            <p style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              maxWidth: '520px',
              marginBottom: '1.25rem',
              lineHeight: 1.5
            }}>
              Directly query Ankit's verified engineering portfolio, peak scale system designs, and live screening availability.
            </p>

            {/* Quick Prompt Command Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '0.65rem',
              maxWidth: '680px',
              width: '100%',
              marginBottom: '1.25rem'
            }}>
              {QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(item.prompt)}
                  disabled={agent.isRunning}
                  style={{
                    background: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-hairline)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    cursor: agent.isRunning ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.35rem',
                    transition: 'all 0.12s ease',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                  onMouseEnter={(e) => {
                    if (agent.isRunning) return;
                    e.currentTarget.style.borderColor = 'var(--accent-slate)';
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.transform = 'translateY(-1.5px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  onMouseLeave={(e) => {
                    if (agent.isRunning) return;
                    e.currentTarget.style.borderColor = 'var(--border-hairline)';
                    e.currentTarget.style.background = 'var(--bg-surface-subtle)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {item.icon}
                      <span style={{ fontSize: '0.78125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                    </div>
                    <span className="badge-mono" style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem' }}>
                      {item.tag}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    "{item.prompt}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========== MESSAGE LIST (shown when messages exist) ========== */}
        {hasMessages && (
          <div 
            className="autohide-scrollbar"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem 1.35rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.95rem'
            }}
          >
            {agent.messages.map((msg: any, index: number) => {
              // 1. Skip non-conversational reasoning messages if present in history
              if (msg.role === 'reasoning' || msg.type === 'reasoning') {
                return null;
              }

              // 2. Tool-response messages are resolved and rendered via the corresponding assistant toolCall
              if (msg.role === 'tool') {
                return null;
              }

              const isUser = msg.role === 'user';
              const toolCalls = msg.toolCalls || [];

              // Extract text content
              let textContent = msg.content;

              if (Array.isArray(msg.contents)) {
                const textParts = msg.contents.filter((c: any) => c.$type === 'text' || c.type === 'text');
                if (textParts.length > 0) {
                  textContent = textParts.map((t: any) => t.text).join('\n');
                }
              }

              // If this message has a GetAvailableInterviewSlots tool call, strip redundant markdown tables / slot listings
              if (!isUser && toolCalls.some((tc: any) => (tc.name === 'GetAvailableInterviewSlots' || tc.function?.name === 'GetAvailableInterviewSlots')) && typeof textContent === 'string') {
                const tableIndex = textContent.search(/(\r?\n)*(\|.*Date.*\||\|.*Time.*\||\|[\s-:]+\||\*\*Available Technical Screening Slots\*\*)/i);
                if (tableIndex >= 0) {
                  textContent = textContent.substring(0, tableIndex).trim();
                }
              }

              const hasText = Boolean(textContent && typeof textContent === 'string' && textContent.trim().length > 0);
              const hasToolCalls = Boolean(Array.isArray(toolCalls) && toolCalls.length > 0);

              if (!isUser && !hasText && !hasToolCalls) {
                return null;
              }

              // Check if this is the first message in a consecutive run of assistant messages
              let isFirstInAssistantRun = false;
              if (!isUser) {
                let prevVisibleMsg: any = null;
                for (let p = index - 1; p >= 0; p--) {
                  const pm: any = agent.messages[p];
                  if (pm && pm.role !== 'reasoning' && pm.type !== 'reasoning' && pm.role !== 'tool') {
                    const pmToolCalls = pm.toolCalls || [];
                    const pmText = typeof pm.content === 'string' ? pm.content.trim() : '';
                    if (pm.role === 'user' || pmText.length > 0 || pmToolCalls.length > 0) {
                      prevVisibleMsg = pm;
                      break;
                    }
                  }
                }
                isFirstInAssistantRun = !prevVisibleMsg || prevVisibleMsg.role !== 'assistant';
              }

              const session = getSavedRecruiterSession();
              const company = session?.company || (typeof window !== 'undefined' ? localStorage.getItem('recruiter_company') : undefined);
              const userTag = company ? `${company} Recruiter` : (isAuthenticated ? 'Verified Recruiter' : 'Guest Recruiter');

              return (
                <div key={`${msg.id || 'msg'}-${index}`} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  maxWidth: '100%',
                  gap: '0.45rem',
                  marginTop: isUser ? '0.35rem' : (isFirstInAssistantRun ? '0.65rem' : '0.15rem')
                }}>
                  {/* Recruiter Persona Header */}
                  {isUser && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      marginBottom: '0.1rem',
                      userSelect: 'none'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-hairline)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-xs)'
                      }}>
                        <User size={13} color="var(--text-secondary)" />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 650, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        You
                      </span>
                      <span className="badge-mono" style={{ fontSize: '0.6rem', padding: '0.05rem 0.35rem' }}>
                        {userTag}
                      </span>
                    </div>
                  )}

                  {/* Assistant Persona Header — shown once per contiguous assistant turn */}
                  {!isUser && isFirstInAssistantRun && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      marginBottom: '0.1rem',
                      userSelect: 'none'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'var(--accent-slate)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '-0.02em',
                        boxShadow: 'var(--shadow-xs)'
                      }}>
                        AS
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 650, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                          Ankit Sarkar
                        </span>
                        <span className="badge-mono" style={{ fontSize: '0.6rem', padding: '0.05rem 0.35rem' }}>
                          Digital Twin
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Render Generative UI Tool Calls BEFORE or alongside message */}
                  {hasToolCalls && (
                    <div style={{ width: '100%', maxWidth: '100%' }}>
                      {toolCalls.map((tc: any) => {
                        const toolMessage = agent.messages.find(
                          (m: any) => m.role === 'tool' && (m.toolCallId === tc.id || m.id === tc.id)
                        );
                        return (
                          <div key={tc.id || tc.toolCallId || `${msg.id}-tc`}>
                            {renderToolCall({ toolCall: tc, toolMessage: toolMessage as any })}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Standard Text Bubble */}
                  {hasText && (
                    <div style={{
                      maxWidth: '100%',
                      width: isUser ? 'auto' : '100%',
                      padding: isUser ? '0.65rem 0.95rem' : '0.1rem 0 0.2rem',
                      borderRadius: isUser ? 'var(--radius-md)' : '0',
                      background: isUser
                        ? 'var(--bg-surface-subtle)'
                        : 'transparent',
                      border: isUser ? '1px solid var(--border-hairline)' : 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      lineHeight: 1.62,
                      boxShadow: isUser ? 'var(--shadow-xs)' : 'none',
                      wordBreak: 'break-word'
                    }}>
                      {isUser ? (
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{textContent}</span>
                      ) : (
                        <div className="markdown-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {textContent}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Editorial Telemetry Processing Indicator */}
            {agent.isRunning && (
              <div className="telemetry-strip message-enter" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '5px',
                  background: 'var(--accent-slate)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  flexShrink: 0
                }}>
                  AS
                </div>
                <div className="telemetry-spinner" />
                <div className="telemetry-text">
                  <span>Ankit's Digital Twin is synthesizing response...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* ========== ACTIONABLE FOLLOW-UP PILLS BAR (shown when messages exist) ========== */}
        {hasMessages && (
          <div style={{
            borderTop: '1px solid var(--border-hairline)',
            background: 'var(--bg-surface-muted)',
            padding: '0.35rem 0.75rem 0.2rem'
          }}>
            <FollowUpPills
              pills={followUpPills}
              isLoading={isLoadingFollowUps}
              disabled={agent.isRunning}
              onSelectPill={handleSelectPill}
              variant="floating"
            />
          </div>
        )}

        {/* ========== INPUT AREA (Permanently Docked at Bottom) ========== */}
        <div style={{
          borderTop: '1px solid var(--border-hairline)',
          padding: '0.65rem 0.95rem',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexShrink: 0,
          position: 'sticky',
          bottom: 0,
          zIndex: 5
        }}>
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isAuthenticated 
                ? "Ask a technical architecture screening question or book a call... (Enter to send)"
                : "Click to sign in and ask Ankit's Digital Twin..."}
              disabled={agent.isRunning}
              style={{
                flex: 1,
                padding: '0.6rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-hairline)',
                background: 'var(--bg-surface-subtle)',
                fontSize: '0.86rem',
                outline: 'none',
                transition: 'all 0.15s ease',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-slate)';
                e.currentTarget.style.background = '#FFFFFF';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hairline)';
                e.currentTarget.style.background = 'var(--bg-surface-subtle)';
              }}
            />
            {agent.isRunning ? (
              <button
                type="button"
                onClick={stopAgent}
                style={{
                  width: '36px', height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
                title="Stop generating"
              >
                <Square size={14} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                style={{
                  width: '36px', height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: input.trim() 
                    ? 'var(--accent-slate)' 
                    : 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-hairline)',
                  color: input.trim() ? '#FFFFFF' : 'var(--text-muted)',
                  cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  boxShadow: input.trim() ? '0 1px 3px rgba(0, 0, 0, 0.15)' : 'none'
                }}
              >
                <Send size={14} />
              </button>
            )}
          </form>
        </div>

        {/* Unauthenticated Recruiter Overlay */}
        {!isAuthenticated && (
          <div
            onClick={onOpenAuth}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(5px)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '1.5rem',
              textAlign: 'center'
            }}
          >
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem 2rem',
              boxShadow: 'var(--shadow-xl)',
              maxWidth: '430px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-hairline)',
                color: 'var(--accent-slate)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lock size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Recruiter & Technical Screening Access
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Enter your work email for instant access to technical screening Q&A, real-time Cal.com scheduling, and verified resume citations.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAuth();
                }}
                className="btn-primary"
                style={{ width: '100%', padding: '0.65rem 1.15rem', marginTop: '0.25rem' }}
              >
                <span>Verify with Work Email (Instant Access)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
