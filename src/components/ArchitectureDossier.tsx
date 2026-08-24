import React, { useState } from 'react';
import { 
  Zap, 
  Layers, 
  Cpu, 
  Calendar, 
  Download, 
  ChevronRight,
  Globe,
  ShieldCheck,
  KeyRound,
  PanelLeftClose,
  GitBranch,
  Shield,
  Award,
  Printer,
  Network
} from 'lucide-react';

export interface ArchitectureDossierProps {
  onSelectPrompt: (prompt: string) => void;
  onScheduleClick: () => void;
  onDownloadPdf: () => void;
  isAgentRunning?: boolean;
  isAuthenticated?: boolean;
  recruiterEmail?: string;
  recruiterCompany?: string;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  onToggleSidebar?: () => void;
}

interface CaseStudy {
  id: string;
  category: string;
  title: string;
  metrics: string;
  description: string;
  technologies: string[];
  prompt: string;
  icon: React.ReactNode;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'asda-scale',
    category: 'FLAGSHIP HIGH-SCALE',
    title: "Tier-1 UK Grocery Picking Platform",
    metrics: "700k+ orders/wk • 90k/30-min peak • 0 incidents",
    description: "Architected decoupled event-driven platform handling flash-sale trading surges with Azure Service Bus session sharding, Cosmos DB RU reduction & Redis state.",
    technologies: ['.NET 10 / C#', 'Azure Service Bus', 'Cosmos DB', 'Redis', 'Terraform'],
    prompt: "How did you achieve zero downtime during the Tier-1 UK retailer's 90k/30-min peak trading?",
    icon: <Zap size={16} color="#D97706" />
  },
  {
    id: 'edge-printing',
    category: 'HARDWARE EDGE & IOT',
    title: "In-Store Edge Hardware & Self-Healing DNS",
    metrics: "600+ Stores • Self-Healing DNS • FusionCache",
    description: "Architected multi-channel in-store hardware edge printing across 600+ physical retail stores with self-healing DNS heuristics, FusionCache TTLs, raw TCP sockets, and in-memory ZPL barcode rendering.",
    technologies: ['FusionCache', 'IoT & Edge Hardware', 'TCP/IP Sockets', 'ZPL Rendering', 'Polly Resilience', 'mTLS'],
    prompt: "How did you architect the in-store edge printing system and self-healing DNS caching with FusionCache across 600+ physical stores?",
    icon: <Printer size={16} color="#0284C7" />
  },
  {
    id: 'platform-engineering',
    category: 'PLATFORM & DEVEX LEAD',
    title: "Enterprise Platform & DevEx Golden Paths",
    metrics: "200+ Repos • Private NuGet • Automated SemVer",
    description: "Architected enterprise golden paths, reusable Terraform modules, Release Please governance, and private NuGet package suites on Azure Artifacts.",
    technologies: ['Platform Engineering', 'Terraform', 'Release Please', 'Azure Artifacts', 'GitHub Actions'],
    prompt: "How did you build the Platform Engineering golden paths and NuGet package suites across 200+ repositories?",
    icon: <Layers size={16} color="#2563EB" />
  },
  {
    id: 'copilot-migration',
    category: 'AGENTIC AI MODERNISATION',
    title: "Deterministic Multi-Repo Copilot Migration Agent",
    metrics: "100+ Repos Modernized • Phase-Gated Skills • >75% Token Reduction",
    description: "Engineered deterministic VS Code GitHub Copilot Agent for automated .NET 6 to .NET 10 migration across 100+ repos with phase-scoped skills and zero-hallucination verification gates.",
    technologies: ['GitHub Copilot', 'Microsoft.Agents.AI', 'VS Code Skills', '.NET 10', 'Automated Verification'],
    prompt: "How did you build the deterministic GitHub Copilot Agent that automated .NET 6 to .NET 10 migration across 100+ repositories?",
    icon: <GitBranch size={16} color="#059669" />
  },
  {
    id: 'enterprise-rag-spicedb',
    category: 'ZERO-TRUST AI & RAG',
    title: "Zero-Trust Enterprise RAG with SpiceDB ReBAC",
    metrics: "Google Zanzibar Schema • Pre-Retrieval Auth • Jina Embeddings",
    description: "Architected zero-trust RAG integrating fine-grained SpiceDB ReBAC authorization with MongoDB Vector Search, multi-stage cross-encoder reranking, and citation audit provenance.",
    technologies: ['SpiceDB ReBAC', 'Enterprise RAG', 'MongoDB Vector', 'Jina AI', 'Zanzibar Pattern'],
    prompt: "How do you design Enterprise RAG with fine-grained SpiceDB authorization?",
    icon: <ShieldCheck size={16} color="#7C3AED" />
  },
  {
    id: 'digital-twin-platform',
    category: 'CONVERSATIONAL AI PLATFORM',
    title: "Conversational Digital Twin & AG-UI SSE Engine",
    metrics: ".NET 10 IChatClient • Microsoft.Agents.AI • Sub-Second SSE",
    description: "Architected interactive AI portfolio with .NET 10 IChatClient decorator pipeline, AG-UI protocol streaming, MongoDB vector retrieval, and automated Cal.com v2 scheduling.",
    technologies: ['.NET 10', 'Microsoft.Agents.AI', 'MongoDB Vector', 'AG-UI SSE', 'Cal.com API', 'Grafana LGTM'],
    prompt: "How is this Conversational Digital Twin architected using .NET 10, Microsoft Agent Framework, and AG-UI streaming?",
    icon: <Cpu size={16} color="#0D9488" />
  },
  {
    id: 'zuplo-ai-gateway',
    category: 'EDGE AI & FINOPS',
    title: "Zuplo AI Gateway: Multi-Account Edge Pooling",
    metrics: "Multi-Account Pooling • Dynamic Model Routing • Smart DLP",
    description: "Engineered edge AI gateway pooling multiple Cloudflare AI accounts with round-robin distribution, sub-second 429 auto-fallback, edge rate limiting, and Smart DLP PII sanitization.",
    technologies: ['Zuplo AI Gateway', 'Cloudflare Workers AI', 'Edge Computing', 'Smart DLP', 'TypeScript', 'Cloud FinOps'],
    prompt: "How did you architect the Zuplo AI Gateway with multi-account Cloudflare pooling, auto-fallback, and Smart DLP?",
    icon: <Network size={16} color="#7C3AED" />
  },
  {
    id: 'security-networking',
    category: 'ZERO-TRUST CLOUD SECURITY',
    title: "Zero-Trust Private Networking & STRIDE",
    metrics: "Private Link • Managed Identity RBAC • VNet Route-All",
    description: "Secured enterprise cloud perimeter with Azure Private Endpoints, System-Assigned Managed Identity RBAC, VNet Route-All inspection, and rigorous STRIDE threat mitigations.",
    technologies: ['Private Endpoints', 'Managed Identity', 'Azure APIM', 'Azure Key Vault', 'STRIDE'],
    prompt: "How is the zero-trust security architecture designed with Private Endpoints, Managed Identity RBAC, and STRIDE threat modelling?",
    icon: <Shield size={16} color="#DC2626" />
  }
];

const TECH_MATRIX = [
  { 
    group: 'Enterprise Cloud & Architecture', 
    items: ['Microsoft Azure', 'Event-Driven (EDA)', 'Microservices & CQRS', 'Azure API Management (APIM)', 'Azure Landing Zones (CAF)', 'Zero-Trust Security', 'IoT & Edge Hardware'] 
  },
  { 
    group: 'Agentic AI & LLMOps', 
    items: ['Microsoft Agent Framework', 'Microsoft.Agents.AI', 'Model Context Protocol (MCP)', 'GitHub Copilot Agents', 'Multi-Agent Swarms', 'Enterprise RAG', 'SpiceDB ReBAC', 'Zuplo AI Gateway'] 
  },
  { 
    group: 'Platform Engineering & DevSecOps', 
    items: ['Terraform Modules', 'Release Please (SemVer)', 'Internal NuGet Suites', 'Azure Artifacts', 'GitHub Actions', 'GitHub Advanced Security', 'Internal Developer Platform (IDP)'] 
  },
  { 
    group: 'Resilience, SRE & FinOps', 
    items: ['OpenTelemetry (OTel)', 'Grafana LGTM', 'Result Pattern (ErrorOr)', 'Polly Resilience', 'Dead Letter Queue (DLQ)', 'Cloud FinOps', 'FusionCache', 'Self-Healing DNS'] 
  },
  { 
    group: 'Languages & Data Stores', 
    items: ['.NET 10 / C#', 'Azure Cosmos DB', 'Azure Service Bus', 'MongoDB Vector Search', 'Azure Cache for Redis', 'Jina AI Embeddings', 'TypeScript & React 19', 'Cal.com API v2'] 
  }
];

export const ArchitectureDossier: React.FC<ArchitectureDossierProps> = ({
  onSelectPrompt,
  onScheduleClick,
  onDownloadPdf,
  isAgentRunning = false,
  isAuthenticated = false,
  recruiterEmail,
  recruiterCompany,
  onOpenAuth,
  onSignOut,
  onToggleSidebar
}) => {
  const [activeTab, setActiveTab] = useState<'case-studies' | 'tech-matrix'>('case-studies');

  return (
    <aside 
      className="autohide-scrollbar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        paddingRight: '0.25rem'
      }}
    >
      {/* 1. Candidate Executive Overview Card */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-hairline)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.15rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        {/* Candidate Identity Header + Collapse Button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '9px',
              background: 'var(--accent-slate)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontFamily: 'var(--font-sans)',
              fontWeight: 800,
              fontSize: '0.92rem',
              letterSpacing: '-0.02em',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
              flexShrink: 0
            }}>
              AS
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.2, margin: 0 }}>
                  Ankit Sarkar
                </h3>
                <span className="status-dot" title="Available for technical leadership & screening" />
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent-slate)', marginTop: '0.12rem', letterSpacing: '-0.015em', lineHeight: 1.3 }}>
                AI Solutions Architect | Platform Engineering | Cloud, DevEx & AI-Assisted Software Delivery
              </div>
            </div>
          </div>

          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="btn-icon sidebar-collapse-btn"
              style={{ width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0 }}
              title="Collapse Sidebar (Ctrl+B)"
              aria-label="Collapse Sidebar"
            >
              <PanelLeftClose size={13} color="var(--text-secondary)" />
            </button>
          )}
        </div>

        {/* Badges & Social Links Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginTop: '0.65rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid var(--border-hairline)'
        }}>
          {/* Key Metric Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="badge-mono" style={{ fontSize: '0.6875rem', padding: '0.15rem 0.45rem' }} title="13+ Years of Enterprise Software Delivery">
              13+ Yrs
            </span>
            <span 
              className="badge-mono" 
              style={{ 
                fontSize: '0.6875rem', 
                padding: '0.15rem 0.45rem', 
                background: '#F5F3FF', 
                color: '#7C3AED', 
                borderColor: '#DDD6FE' 
              }} 
              title="18 Industry Certifications: 9 Microsoft, 4 Anthropic, 5 GitHub, 1 AWS"
            >
              18 Certs
            </span>
          </div>

          {/* Social Profile Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.28rem' }}>
            <a 
              href="https://anktsrkr.github.io" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-icon" 
              style={{ width: '28px', height: '28px', borderRadius: '6px' }} 
              title="Technical Blog"
            >
              <Globe size={13} color="var(--text-secondary)" />
            </a>
            <a 
              href="https://github.com/anktsrkr" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-icon" 
              style={{ width: '28px', height: '28px', borderRadius: '6px' }} 
              title="GitHub Profile"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
            <a 
              href="https://linkedin.com/in/sarkaran" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-icon" 
              style={{ width: '28px', height: '28px', borderRadius: '6px' }} 
              title="LinkedIn Profile"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a 
              href="https://www.credly.com/users/sarkaran/badges/credly" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-icon" 
              style={{ width: '28px', height: '28px', borderRadius: '6px' }} 
              title="Credly Verified Credentials (18 Badges)"
            >
              <Award size={13} color="#7C3AED" />
            </a>
          </div>
        </div>

        <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginTop: '0.55rem', lineHeight: 1.45 }}>
          Architecting high-scale distributed systems, enterprise platform suites, and agentic AI on .NET & Microsoft Azure.
        </p>

        {/* Candidate Target Positioning & Work Preferences */}
        <div style={{
          marginTop: '0.75rem',
          padding: '0.65rem 0.8rem',
          background: 'var(--bg-surface-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-hairline)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.38rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', fontSize: '0.73rem', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Open To:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>
              Principal Engineer • AI Architect • Platform Lead
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.73rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Based In:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Leeds, United Kingdom</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.73rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Work Mode:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Hybrid (Leeds/London) • Remote • Relocate</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.73rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Work Rights:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} title="Valid UK GBM Visa. Eligible for in-country transfer / change of employer with Skilled Worker Visa Sponsorship.">
              UK GBM (Requires Skilled Worker Visa)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.73rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Availability:</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>3 Months Notice</span>
          </div>
        </div>

        {/* Action Buttons (50/50 Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button 
            onClick={onScheduleClick} 
            className="btn-primary" 
            style={{ padding: '0.52rem 0.75rem', fontSize: '0.78125rem', justifyContent: 'center' }}
          >
            <Calendar size={13} />
            <span>Book Call</span>
          </button>

          <button 
            onClick={onDownloadPdf} 
            className="btn-secondary" 
            style={{ padding: '0.52rem 0.75rem', fontSize: '0.78125rem', justifyContent: 'center' }}
          >
            <Download size={13} />
            <span>PDF Resume</span>
          </button>
        </div>

        {/* Recruiter Authentication Status Bar */}
        <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-hairline)' }}>
          {isAuthenticated ? (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                background: 'var(--accent-emerald-subtle)',
                border: '1px solid var(--accent-emerald-border)',
                padding: '0.4rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 1px 2px rgba(16, 185, 129, 0.06)'
              }}
              title={`Authenticated as ${recruiterEmail || recruiterCompany || 'Verified Recruiter'}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                <ShieldCheck size={15} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.25 }}>
                  <span style={{ fontWeight: 650, fontSize: '0.75rem', color: '#065F46', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {recruiterCompany ? `${recruiterCompany} Recruiter` : 'Verified Recruiter'}
                  </span>
                  {recruiterEmail && (
                    <span style={{ fontSize: '0.68rem', color: '#047857', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={recruiterEmail}>
                      {recruiterEmail}
                    </span>
                  )}
                </div>
              </div>
              <button 
                type="button"
                onClick={onSignOut}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--accent-emerald-border)',
                  color: '#065F46',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.22rem 0.55rem',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.borderColor = '#059669'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = 'var(--accent-emerald-border)'; }}
                title="Sign out of recruiter session"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth} 
              className="btn-secondary" 
              style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.76rem', justifyContent: 'center', gap: '0.35rem' }}
            >
              <KeyRound size={13} />
              <span>Recruiter Access (Instant Screening & Q&A)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-navigation tabs */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-surface-subtle)',
        padding: '0.2rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-hairline)'
      }}>
        <button
          onClick={() => setActiveTab('case-studies')}
          style={{
            flex: 1,
            padding: '0.4rem',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'case-studies' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'case-studies' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'case-studies' ? 700 : 500,
            fontSize: '0.75rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'case-studies' ? 'var(--shadow-xs)' : 'none',
            transition: 'all 0.12s ease'
          }}
        >
          Flagship Architectures
        </button>
        <button
          onClick={() => setActiveTab('tech-matrix')}
          style={{
            flex: 1,
            padding: '0.4rem',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'tech-matrix' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'tech-matrix' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'tech-matrix' ? 700 : 500,
            fontSize: '0.75rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'tech-matrix' ? 'var(--shadow-xs)' : 'none',
            transition: 'all 0.12s ease'
          }}
        >
          Competency Matrix
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'case-studies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {CASE_STUDIES.map((study) => (
            <div
              key={study.id}
              onClick={() => {
                if (!isAgentRunning) onSelectPrompt(study.prompt);
              }}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-md)',
                padding: '0.95rem 1.05rem',
                cursor: isAgentRunning ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: 'var(--shadow-xs)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (isAgentRunning) return;
                e.currentTarget.style.borderColor = 'var(--accent-slate)';
                e.currentTarget.style.transform = 'translateY(-1.5px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={(e) => {
                if (isAgentRunning) return;
                e.currentTarget.style.borderColor = 'var(--border-hairline)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
              }}
              title={`Click to ask Digital Twin: "${study.prompt}"`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  {study.category}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                  <span>Ask Twin</span>
                  <ChevronRight size={12} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                {study.icon}
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                  {study.title}
                </h4>
              </div>

              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--accent-slate)',
                fontWeight: 600,
                marginBottom: '0.4rem'
              }}>
                ⚡ {study.metrics}
              </div>

              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.55rem' }}>
                {study.description}
              </p>

              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {study.technologies.map((tech, i) => (
                  <span key={i} className="badge-mono" style={{ fontSize: '0.64rem', padding: '0.1rem 0.35rem' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tech-matrix' && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          {TECH_MATRIX.map((group, idx) => (
            <div key={idx}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                {group.group}
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {group.items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!isAgentRunning) onSelectPrompt(`What is Ankit's production experience with ${item}?`);
                    }}
                    disabled={isAgentRunning}
                    style={{
                      background: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.25rem 0.55rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      cursor: isAgentRunning ? 'not-allowed' : 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (isAgentRunning) return;
                      e.currentTarget.style.borderColor = 'var(--accent-slate)';
                      e.currentTarget.style.background = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      if (isAgentRunning) return;
                      e.currentTarget.style.borderColor = 'var(--border-hairline)';
                      e.currentTarget.style.background = 'var(--bg-surface-subtle)';
                    }}
                    title={`Click to ask about experience with ${item}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Footer & Copyright Notice */}
      <div style={{
        marginTop: 'auto',
        padding: '0.75rem 0.25rem 0.25rem',
        borderTop: '1px solid var(--border-hairline)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        fontSize: '0.6875rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 500 }}>© {new Date().getFullYear()} Ankit Sarkar</span>
          <span style={{ color: 'var(--text-subtle)' }}>All rights reserved</span>
        </div>
        <div style={{ color: 'var(--text-subtle)', fontSize: '0.65rem' }}>
          Verified Production Engineering & Architecture Portfolio
        </div>
      </div>
    </aside>
  );
};
