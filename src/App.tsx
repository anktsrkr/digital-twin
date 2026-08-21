import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import { ArchitectureDossier } from './components/ArchitectureDossier';
import { DigitalTwinChat } from './components/DigitalTwinChat';
import { AuthModal } from './components/AuthModal';
import { BlockedEmailModal } from './components/BlockedEmailModal';
import { CitationDrawer, type CitationDetail } from './components/CitationDrawer';
import { Callback } from './components/Callback';
import { useLogto } from '@logto/react';
import { BookOpen, Terminal } from 'lucide-react';
import { getSavedRecruiterSession, saveRecruiterSession, clearRecruiterSession } from './lib/logtoClient';
import './styles/index.css';

export function App() {
  const { isAuthenticated, isLoading, signIn, signOut, getAccessToken, getIdTokenClaims, fetchUserInfo } = useLogto();
  const isProcessingAuthRef = useRef(false);
  
  // Initialize state immediately from cached localStorage session to prevent reload flicker/flash
  const [token, setToken] = useState<string | null>(() => {
    const session = getSavedRecruiterSession();
    return session?.token || (typeof window !== 'undefined' ? localStorage.getItem('recruiter_token') : null);
  });
  const [recruiterEmail, setRecruiterEmail] = useState<string | undefined>(() => {
    const session = getSavedRecruiterSession();
    return session?.email || (typeof window !== 'undefined' ? (localStorage.getItem('recruiter_email') || undefined) : undefined);
  });
  const [recruiterCompany, setRecruiterCompany] = useState<string | undefined>(() => {
    const session = getSavedRecruiterSession();
    return session?.company || (typeof window !== 'undefined' ? (localStorage.getItem('recruiter_company') || undefined) : undefined);
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBlockedEmail, setIsBlockedEmail] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<CitationDetail | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [mobileTab, setMobileTab] = useState<'dossier' | 'terminal'>('dossier');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar_collapsed', String(next));
      }
      return next;
    });
  }, []);

  // Keyboard shortcut: Cmd+B / Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Maintain effective authentication state across reload/hydration
  const isEffectivelyAuthenticated = isAuthenticated || (isLoading && !!recruiterEmail);

  const backendUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : (import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000');

  useEffect(() => {
    if (isAuthenticated) {
      if (isProcessingAuthRef.current) return;
      isProcessingAuthRef.current = true;

      (async () => {
        try {
          // Fetch Logto access token scoped for the .NET API
          const resource = import.meta.env.VITE_LOGTO_API_RESOURCE;
          const resourceToken = resource ? await getAccessToken(resource) : undefined;

          // Prefer reading claims directly from ID token (avoid unnecessary /oidc/me network requests)
          let email: string | undefined;
          try {
            const claims = await getIdTokenClaims();
            email = claims?.email ?? undefined;
          } catch {
            // Fallback to fetchUserInfo if claims retrieval fails
          }

          if (!email) {
            const userInfo = await fetchUserInfo();
            email = userInfo?.email ?? undefined;
          }

          let inferredCompany: string | undefined = undefined;

          if (email && email.includes('@')) {
            const domain = email.split('@')[1]?.toLowerCase();
            const standardProviders = ['gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'yahoo.com', 'icloud.com', 'proton.me', 'protonmail.com'];
            if (domain && !standardProviders.includes(domain)) {
              const companyPart = domain.split('.')[0];
              if (companyPart) {
                inferredCompany = companyPart.charAt(0).toUpperCase() + companyPart.slice(1);
                setRecruiterCompany(inferredCompany);
              }
            } else {
              setRecruiterCompany(undefined);
            }
          }

          setToken(resourceToken ?? null);
          setRecruiterEmail(email);
          setIsBlockedEmail(false);

          if (email) {
            saveRecruiterSession({
              email,
              company: inferredCompany,
              token: resourceToken ?? undefined,
              authenticatedAt: new Date().toISOString()
            });
          }

          if (pendingPrompt) {
            setSelectedPrompt(pendingPrompt);
            setPendingPrompt(null);
          }
        } catch (error) {
          console.error('Failed to fetch Logto token/userinfo:', error);
        } finally {
          isProcessingAuthRef.current = false;
        }
      })();
    } else if (!isLoading) {
      isProcessingAuthRef.current = false;
      // Only clear if Logto has completed initialization and confirmed unauthenticated
      setToken(null);
      setRecruiterEmail(undefined);
      setRecruiterCompany(undefined);
      setIsBlockedEmail(false);
      clearRecruiterSession();
    }
  }, [isAuthenticated, isLoading, getAccessToken, getIdTokenClaims, fetchUserInfo, pendingPrompt]);

  // Global network interceptor: distinguish between Blocked Disposable Email (X-Blocked-Reason / 403) vs Regular 401 Session Expiry
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const url = typeof args[0] === 'string' ? args[0] : (args[0] instanceof Request ? args[0].url : '');
      
      if (url.includes('/agentic_chat')) {
        const isBlockedReason = response.headers.get('X-Blocked-Reason') === 'DisposableEmail';
        const isForbidden = response.status === 403;

        if (isBlockedReason || isForbidden) {
          console.warn('🚫 Disposable email blocked by backend security policy');
          setIsBlockedEmail(true);
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const handleAuthSuccess = () => {
    const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${basePath}/callback`
      : 'http://localhost:5173/callback';
    signIn(redirectUrl);
  };

  const handleSignOut = () => {
    clearRecruiterSession();
    setToken(null);
    setRecruiterEmail(undefined);
    setRecruiterCompany(undefined);
    const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${basePath}/`
      : 'http://localhost:5173/';
    signOut(redirectUrl);
  };

  const handleDownloadPdf = useCallback(() => {
    const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const link = document.createElement('a');
    link.href = `${basePath}/resume.pdf`;
    link.download = 'Ankit_Sarkar_AI_Solutions_Architect_Resume.pdf';
    link.click();
  }, []);

  const handleSelectPrompt = useCallback((prompt: string) => {
    if (!isEffectivelyAuthenticated) {
      setPendingPrompt(prompt);
      setIsAuthOpen(true);
      return;
    }
    setSelectedPrompt(prompt);
    // On mobile, auto-switch to terminal tab to see the live response
    setMobileTab('terminal');
  }, [isEffectivelyAuthenticated]);

  const handleScheduleClick = useCallback(() => {
    handleSelectPrompt("When is Ankit available for an interview or screening call?");
  }, [handleSelectPrompt]);

  const copilotHeaders = useMemo(() => {
    return {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }, [token]);

  const isCallbackPath = typeof window !== 'undefined' && (
    window.location.pathname.endsWith('/callback') ||
    window.location.pathname === '/callback'
  );

  if (isCallbackPath) {
    return <Callback />;
  }

  return (
    <CopilotKit
      runtimeUrl={`${backendUrl}/agentic_chat`}
      agent="agentic_chat"
      showDevConsole={false}
      headers={copilotHeaders}
    >
      <div style={{ height: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="console-container">
          {/* Mobile Segmented View Switcher */}
          <div className="mobile-pane-switcher">
            <button
              className={`mobile-tab-btn ${mobileTab === 'dossier' ? 'active' : ''}`}
              onClick={() => setMobileTab('dossier')}
            >
              <BookOpen size={14} />
              <span>Architecture Dossier</span>
            </button>
            <button
              className={`mobile-tab-btn ${mobileTab === 'terminal' ? 'active' : ''}`}
              onClick={() => setMobileTab('terminal')}
            >
              <Terminal size={14} />
              <span>Digital Twin Terminal {isAgentRunning ? '⚡' : ''}</span>
            </button>
          </div>

          {/* Main Dual-Pane Console Grid */}
          <main className={`console-main-grid ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Left Pane: Architecture Dossier */}
            <section className={`dossier-pane ${mobileTab !== 'dossier' ? 'hide-mobile' : ''}`}>
              <div className="dossier-pane-inner">
                <ArchitectureDossier
                  onSelectPrompt={handleSelectPrompt}
                  onScheduleClick={handleScheduleClick}
                  onDownloadPdf={handleDownloadPdf}
                  isAgentRunning={isAgentRunning}
                  isAuthenticated={isEffectivelyAuthenticated}
                  recruiterEmail={recruiterEmail}
                  recruiterCompany={recruiterCompany}
                  onOpenAuth={() => setIsAuthOpen(true)}
                  onSignOut={handleSignOut}
                  onToggleSidebar={toggleSidebar}
                />
              </div>
            </section>

            {/* Right Pane: Digital Twin Interactive Console */}
            <section className={`terminal-pane ${mobileTab !== 'terminal' ? 'hide-mobile' : ''}`}>
              <DigitalTwinChat
                isAuthenticated={isEffectivelyAuthenticated}
                recruiterEmail={recruiterEmail}
                onOpenAuth={() => setIsAuthOpen(true)}
                onBlockedEmail={() => setIsBlockedEmail(true)}
                onOpenCitation={(citation) => setSelectedCitation(citation)}
                externalPrompt={selectedPrompt}
                onClearExternalPrompt={() => setSelectedPrompt(null)}
                onAgentStateChange={setIsAgentRunning}
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={toggleSidebar}
              />
            </section>
          </main>
        </div>

        {/* Recruiter Magic Link Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />

        {/* Disposable Email Blocked Modal */}
        <BlockedEmailModal
          isOpen={isBlockedEmail}
          email={recruiterEmail}
          domain={recruiterEmail?.includes('@') ? recruiterEmail.split('@')[1] : undefined}
          onSignOut={handleSignOut}
        />

        {/* Interactive Citation Drawer */}
        <CitationDrawer
          isOpen={selectedCitation !== null}
          citation={selectedCitation}
          onClose={() => setSelectedCitation(null)}
        />
      </div>
    </CopilotKit>
  );
}

export default App;
