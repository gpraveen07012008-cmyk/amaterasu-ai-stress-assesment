import React, { useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Assessment } from './pages/Assessment';
import { Analysis } from './pages/Analysis';
import { PersonalizedSupport } from './pages/PersonalizedSupport';
import { Communication } from './pages/Communication';
import { TextChat } from './pages/TextChat';
import { RealtimeVoiceCall } from './pages/RealtimeVoiceCall';
import { ProfessionalSupport } from './pages/ProfessionalSupport';
import { Credits } from './pages/Credits';
import { CallHistory } from './pages/CallHistory';
import { Feedback } from './pages/Feedback';
import { Reassessment } from './pages/Reassessment';
import { Profile } from './pages/Profile';

import { authService } from './services/authService';
import { UserProfile, AssessmentResult, SupportRegion } from './types';
import { AnonymousPeer } from './data/demoUsers';
import { calculateSVI } from './utils/scoring';
import { callService, CallEvent } from './services/callService';
import { 
  DEMO_GREEN_ASSESSMENT, 
  DEMO_ORANGE_ASSESSMENT, 
  DEMO_RED_ASSESSMENT 
} from './data/demoConversations';

interface ActiveCallState {
  callId: string;
  peerCallId: string;
  role: 'caller' | 'callee';
  status: 'calling' | 'ringing' | 'connecting' | 'connected' | 'failed';
  startedAt: number;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [authReady, setAuthReady] = useState(false);

  // Active Assessment Result
  const [latestAssessment, setLatestAssessment] = useState<AssessmentResult>(DEMO_ORANGE_ASSESSMENT);
  const [previousAssessmentSvi, setPreviousAssessmentSvi] = useState<number>(64);

  // Active Peer Communication Session
  const [activePeer, setActivePeer] = useState<AnonymousPeer | null>(null);
  const [activeSessionMode, setActiveSessionMode] = useState<'text' | 'voice'>('text');
  const [lastPeerSessionDuration, setLastPeerSessionDuration] = useState<string>('12:30');
  const [isVoiceCallFeedback, setIsVoiceCallFeedback] = useState(false);
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ callId: string; peerCallId: string } | null>(null);
  const [callError, setCallError] = useState('');
  const activeCallRef = useRef<ActiveCallState | null>(null);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  const refreshUser = () => {
    setCurrentUser(authService.getCurrentUser());
  };

  useEffect(() => {
    let mounted = true;
    authService.restoreServerSession().then((user) => {
      if (mounted) {
        setCurrentUser(user);
        if (!user) setCurrentPage('login');
        setAuthReady(true);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleRegisterSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentPage('login');
  };

  // Quick Demo Triggers for Faculty / Evaluators / Judges
  const handleSelectDemoMode = (region: SupportRegion) => {
    let demoResult: AssessmentResult;
    if (region === 'GREEN') {
      demoResult = DEMO_GREEN_ASSESSMENT;
    } else if (region === 'RED') {
      demoResult = DEMO_RED_ASSESSMENT;
    } else {
      demoResult = DEMO_ORANGE_ASSESSMENT;
    }

    setPreviousAssessmentSvi(currentUser?.lastSvi || 64);
    setLatestAssessment(demoResult);

    if (currentUser) {
      const updated = {
        ...currentUser,
        lastSvi: demoResult.sviScore,
        lastRegion: demoResult.supportRegion,
        lastConcern: demoResult.mainConcern,
        lastAssessmentDate: new Date().toISOString()
      };
      authService.setCurrentUser(updated);
      refreshUser();
    }

    setCurrentPage('analysis');
  };

  // AI Assessment completed
  const handleAssessmentComplete = (result: AssessmentResult) => {
    setIsVoiceCallFeedback(false);
    setPreviousAssessmentSvi(currentUser?.lastSvi || 60);
    setLatestAssessment(result);

    if (currentUser) {
      const updated = {
        ...currentUser,
        lastSvi: result.sviScore,
        lastRegion: result.supportRegion,
        lastConcern: result.mainConcern,
        lastAssessmentDate: new Date().toISOString()
      };
      authService.setCurrentUser(updated);
      refreshUser();
    }

    setCurrentPage('analysis');
  };

  // Launching active 15-min anonymous peer room
  const handleStartPeerSession = (
    mode: 'text' | 'voice',
    peer: AnonymousPeer,
    genderPref: string,
    matchedConcern: string
  ) => {
    setActivePeer(peer);
    setActiveSessionMode(mode);
    if (mode === 'text') {
      setCurrentPage('text-chat');
    }
  };

  const handleStartVoiceCall = (targetCallId: string) => {
    const normalizedCallId = targetCallId.trim();
    if (!normalizedCallId) return;
    setCallError('');
    setActivePeer({
      anonymousId: normalizedCallId,
      gender: 'Prefer not to say',
      mainConcern: 'Other',
      isOnline: true,
      avatarColor: 'from-indigo-500 to-slate-600',
      interests: []
    });
    setActiveSessionMode('voice');
    setActiveCall({ callId: '', peerCallId: normalizedCallId, role: 'caller', status: 'calling', startedAt: Date.now() });
    setCurrentPage('voice-call');
    void callService.startCall(normalizedCallId).catch((error: unknown) => {
      setCallError(error instanceof Error ? error.message : 'Unable to place call.');
      setActiveCall(null);
      setCurrentPage('communication');
    });
  };

  const handleAcceptIncomingCall = () => {
    if (!incomingCall) return;
    const acceptedCall = incomingCall;
    setIncomingCall(null);
    setCallError('');
    setActivePeer({
      anonymousId: acceptedCall.peerCallId,
      gender: 'Prefer not to say',
      mainConcern: 'Other',
      isOnline: true,
      avatarColor: 'from-indigo-500 to-slate-600',
      interests: []
    });
    setActiveSessionMode('voice');
    setActiveCall({
      callId: acceptedCall.callId,
      peerCallId: acceptedCall.peerCallId,
      role: 'callee',
      status: 'connecting',
      startedAt: Date.now()
    });
    setCurrentPage('voice-call');
    void callService.acceptCall(acceptedCall.callId).catch((error: unknown) => {
      setCallError(error instanceof Error ? error.message : 'Unable to accept call.');
      setActiveCall(null);
      setCurrentPage('communication');
    });
  };

  const handleRejectIncomingCall = () => {
    if (!incomingCall) return;
    void callService.rejectCall(incomingCall.callId);
    setIncomingCall(null);
  };

  const handleCallConnected = () => {
    setActiveCall((current) => {
      if (!current) return current;
      const connectedCall = { ...current, status: 'connected' as const };
      activeCallRef.current = connectedCall;
      return connectedCall;
    });
  };

  const handleRealCallEnded = () => {
    const call = activeCallRef.current;
    setActiveCall(null);
    setIncomingCall(null);
    if (call?.status === 'connected') {
      const elapsedSeconds = Math.max(1, Math.floor((Date.now() - call.startedAt) / 1000));
      const mins = Math.floor(elapsedSeconds / 60);
      const secs = elapsedSeconds % 60;
      handleEndPeerSession(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    } else {
      setCurrentPage('communication');
      setCallError('The call ended before connecting.');
    }
  };

  // Ending peer room
  const handleEndPeerSession = (duration: string) => {
    setLastPeerSessionDuration(duration);
    setIsVoiceCallFeedback(activeSessionMode === 'voice');
    setActiveCall(null);

    if (activePeer) {
      authService.addCallHistoryItem({
        date: new Date().toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }),
        anonymousUserId: activePeer.anonymousId,
        communicationType: activeSessionMode === 'voice' ? 'Voice' : 'Text',
        duration,
        status: 'Completed',
        rating: 5,
        feedbackText: 'Session concluded naturally.',
        isFavourite: false
      });
    }

    if (activeSessionMode === 'voice' && currentUser) {
      const callScoring = calculateSVI(
        latestAssessment.answers,
        latestAssessment.mainConcern,
        latestAssessment.speechSignals
      );
      const updatedUser = {
        ...currentUser,
        lastSvi: callScoring.totalSvi,
        lastRegion: callScoring.region,
        lastConcern: latestAssessment.mainConcern
      };
      authService.setCurrentUser(updatedUser);
      setLatestAssessment((current) => ({
        ...current,
        sviScore: callScoring.totalSvi,
        supportRegion: callScoring.region
      }));
    }

    refreshUser();

    setCurrentPage('feedback');
  };

  useEffect(() => {
    if (!authReady || !currentUser) return;
    const subscriptions: Array<() => void> = [];
    subscriptions.push(callService.on('call:incoming', (event: CallEvent) => {
      if (event.callId && event.peerCallId) setIncomingCall({ callId: event.callId, peerCallId: event.peerCallId });
    }));
    subscriptions.push(callService.on('call:ringing', (event: CallEvent) => {
      if (event.callId) setActiveCall((current) => current ? { ...current, callId: event.callId!, status: 'ringing' } : current);
    }));
    subscriptions.push(callService.on('call:accepted', (event: CallEvent) => {
      if (event.callId && event.peerCallId && event.role) {
        setActiveCall({
          callId: event.callId,
          peerCallId: event.peerCallId,
          role: event.role,
          status: 'connecting',
          startedAt: Date.now()
        });
        setActivePeer({
          anonymousId: event.peerCallId,
          gender: 'Prefer not to say',
          mainConcern: 'Other',
          isOnline: true,
          avatarColor: 'from-indigo-500 to-slate-600',
          interests: []
        });
        setActiveSessionMode('voice');
        setCurrentPage('voice-call');
      }
    }));
    subscriptions.push(callService.on('call:rejected', (event: CallEvent) => {
      setActiveCall(null);
      setCallError(event.reason === 'declined' ? 'The user declined the call.' : 'The user did not answer.');
      setCurrentPage('communication');
    }));
    subscriptions.push(callService.on('call:ended', handleRealCallEnded));
    subscriptions.push(callService.on('call:error', (event: CallEvent) => {
      if (!event.error) return;
      setCallError(event.error);
      const current = activeCallRef.current;
      if (current && (current.status === 'calling' || current.status === 'ringing')) {
        setActiveCall(null);
        activeCallRef.current = null;
        setCurrentPage('communication');
      } else {
        setActiveCall((active) => active ? { ...active, status: 'failed' } : active);
      }
    }));
    void callService.connect().catch((error: unknown) => {
      setCallError(error instanceof Error ? error.message : 'Call signaling is unavailable.');
    });
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, [authReady, currentUser, latestAssessment]);

  // Protected routing check
  if (!currentUser) {
    if (currentPage === 'register') {
      return (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setCurrentPage('register')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation Header */}
      <Navbar
        user={currentUser}
        currentPath={currentPage}
        onNavigate={(path) => setCurrentPage(path)}
        onLogout={handleLogout}
        onSelectDemoMode={handleSelectDemoMode}
      />

      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
            <div className="w-24 h-24 mx-auto rounded-full bg-slate-800 border border-indigo-500/40 flex items-center justify-center">
              <span className="text-2xl font-black text-white">●</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Incoming Call</h2>
              <p className="text-xs text-slate-400 mt-2">Call ID: <span className="text-slate-100 font-semibold">{incomingCall.peerCallId}</span></p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleRejectIncomingCall}
                className="px-5 py-2.5 bg-slate-800 hover:bg-rose-700 text-slate-200 rounded-xl text-xs font-bold"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={handleAcceptIncomingCall}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentPage === 'dashboard' && (
          <Dashboard
            user={currentUser}
            onNavigate={(p) => setCurrentPage(p)}
            onTriggerDemo={handleSelectDemoMode}
          />
        )}

        {currentPage === 'assessment' && (
          <Assessment
            user={currentUser}
            onAssessmentComplete={handleAssessmentComplete}
            onCancel={() => setCurrentPage('dashboard')}
          />
        )}

        {currentPage === 'analysis' && (
          <Analysis
            assessment={latestAssessment}
            user={currentUser}
            onNavigate={(p) => {
              if (p === 'feedback') setIsVoiceCallFeedback(false);
              setCurrentPage(p);
            }}
            onStartReassessment={() => setCurrentPage('reassessment')}
          />
        )}

        {currentPage === 'personalized-support' && (
          <PersonalizedSupport
            user={currentUser}
            concern={latestAssessment.mainConcern}
            region={latestAssessment.supportRegion}
            onNavigate={(p) => setCurrentPage(p)}
          />
        )}

        {currentPage === 'communication' && (
          <Communication
            user={currentUser}
            onStartSession={handleStartPeerSession}
            onCallUser={handleStartVoiceCall}
            callError={callError}
            onNavigate={(p) => setCurrentPage(p)}
          />
        )}

        {currentPage === 'text-chat' && activePeer && (
          <TextChat
            user={currentUser}
            peer={activePeer}
            onEndSession={(duration) => handleEndPeerSession(duration)}
          />
        )}

        {currentPage === 'voice-call' && activePeer && (
          <RealtimeVoiceCall
            user={currentUser}
            call={activeCall!}
            callError={callError}
            onConnected={handleCallConnected}
            onEndCall={handleEndPeerSession}
            onCancel={() => {
              if (activeCall?.callId) void callService.endCall(activeCall.callId);
              setActiveCall(null);
              setCurrentPage('communication');
            }}
          />
        )}

        {currentPage === 'professional-support' && (
          <ProfessionalSupport />
        )}

        {currentPage === 'credits' && (
          <Credits
            user={currentUser}
            onNavigate={(p) => setCurrentPage(p)}
            onRefreshUser={refreshUser}
          />
        )}

        {currentPage === 'call-history' && (
          <CallHistory
            user={currentUser}
            onNavigate={(p) => setCurrentPage(p)}
            onRefreshUser={refreshUser}
          />
        )}

        {currentPage === 'feedback' && (
          <Feedback
            user={currentUser}
            peerAnonymousId={activePeer?.anonymousId || 'User_7392'}
            isVoiceCallFeedback={isVoiceCallFeedback}
            onFeedbackSubmitted={refreshUser}
            onNavigateToReassessment={() => setCurrentPage('reassessment')}
            onNavigateToDashboard={() => setCurrentPage('dashboard')}
          />
        )}

        {currentPage === 'reassessment' && (
          <Reassessment
            user={currentUser}
            previousSvi={previousAssessmentSvi}
            currentSvi={latestAssessment.sviScore}
            previousRegion={previousAssessmentSvi > 70 ? 'RED' : previousAssessmentSvi > 30 ? 'ORANGE' : 'GREEN'}
            currentRegion={latestAssessment.supportRegion}
            onContinueSupport={() => setCurrentPage('personalized-support')}
            onChangeSupport={() => setCurrentPage('communication')}
            onEscalateProfessional={() => setCurrentPage('professional-support')}
            onTakeNewAssessment={() => setCurrentPage('assessment')}
          />
        )}

        {currentPage === 'profile' && (
          <Profile
            user={currentUser}
            onLogout={handleLogout}
            onRefreshUser={refreshUser}
          />
        )}
      </main>

      {/* Global Minimal Footer */}
      <footer className="border-t border-slate-900 bg-[#060913] py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-400">AMATERASU</span>
            <span>•</span>
            <span>AI-Assisted Stress Assessment & Personalized Support</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Prototype Screening System • Non-Clinical • Emergency Helplines Available 24/7
          </div>
        </div>
      </footer>
    </div>
  );
}
