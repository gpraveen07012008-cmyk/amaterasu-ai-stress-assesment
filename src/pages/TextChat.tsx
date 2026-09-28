import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Flag, 
  Square, 
  AlertTriangle, 
  ShieldCheck, 
  VolumeX, 
  Lock, 
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { UserProfile, Message } from '../types';
import { AnonymousPeer } from '../data/demoUsers';
import { CallTimer } from '../components/CallTimer';
import { SafetyBanner } from '../components/SafetyBanner';
import { safetyService } from '../services/safetyService';
import { EmergencyModal } from '../components/EmergencyModal';

interface TextChatProps {
  user: UserProfile;
  peer: AnonymousPeer;
  onEndSession: (duration: string, messagesCount: number) => void;
}

export const TextChat: React.FC<TextChatProps> = ({ user, peer, onEndSession }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'sys-start',
      sender: 'system',
      text: `Anonymous room established between ${user.anonymousId} and ${peer.anonymousId}. Session timer is active (15:00 max). Please maintain a warm, supportive space.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 'peer-welcome',
      sender: 'peer',
      text: `Hi there! I saw we're both dealing with ${peer.mainConcern.toLowerCase()}. How are things feeling for you right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [warningCount, setWarningCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [muteRemainingSeconds, setMuteRemainingSeconds] = useState(0);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  // Safety & reporting
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate language');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle mute countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMuted && muteRemainingSeconds > 0) {
      timer = setInterval(() => {
        setMuteRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsMuted(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isMuted, muteRemainingSeconds]);

  const getElapsedDuration = (): string => {
    const elapsedSeconds = Math.max(1, Math.floor((Date.now() - sessionStartTime) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleTimerExpired = () => {
    const sysEnd: Message = {
      id: 'sys-end',
      sender: 'system',
      text: 'Session duration limit (15:00) has concluded. Thank you for connecting respectfully.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, sysEnd]);
    setTimeout(() => {
      onEndSession('15:00', messages.length);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || isMuted) return;

    const text = inputText.trim();
    setInputText('');

    // Safety moderation check
    const check = safetyService.evaluateContent(text, warningCount);

    if (check.severity === 'emergency') {
      setShowEmergency(true);
      return;
    }

    if (!check.isSafe) {
      const nextWarnings = warningCount + 1;
      setWarningCount(nextWarnings);
      setActiveAlert(check.actionMessage || null);

      if (check.severity === 'warning') {
        const warningMsg: Message = {
          id: 'warn-' + Date.now(),
          sender: 'system',
          text: check.actionMessage || '⚠️ Safety Warning: Sensitive content detected.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFlagged: true
        };
        setMessages((prev) => [...prev, warningMsg]);
      } else if (check.severity === 'mute') {
        setIsMuted(true);
        setMuteRemainingSeconds(30);
        const muteMsg: Message = {
          id: 'mute-' + Date.now(),
          sender: 'system',
          text: '🔇 You have been temporarily muted for 30 seconds due to a second sensitive alert.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFlagged: true
        };
        setMessages((prev) => [...prev, muteMsg]);
        return;
      } else if (check.severity === 'terminate') {
        alert('Session terminated due to multiple policy violations.');
        onEndSession(getElapsedDuration(), messages.length);
        return;
      }
    }

    // Normal message sent
    const newMsg: Message = {
      id: 'my-' + Date.now(),
      sender: 'me',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);

    // Simulated empathetic peer response
    setTimeout(() => {
      const peerResponses = [
        "I completely resonate with that. It's really comforting to hear someone else experiencing something so similar.",
        "Totally. Sometimes just being able to say it out loud without judgment takes half the weight off.",
        "Thank you for sharing that with me. Have you found any small moments today where you felt even a little bit of relief?",
        "That makes total sense. We put so much pressure on ourselves without realizing it."
      ];
      const randomReply = peerResponses[Math.floor(Math.random() * peerResponses.length)];
      const peerMsg: Message = {
        id: 'peer-' + Date.now(),
        sender: 'peer',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, peerMsg]);
    }, 1400);
  };

  const handleReportUser = () => {
    safetyService.reportUser('text_session', user.id, peer.anonymousId, reportReason);
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
      onEndSession(getElapsedDuration(), messages.length);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      
      {/* Top Session Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-white text-xs">
            {peer.anonymousId.slice(-4)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                Chatting with <span className="text-amber-400">{peer.anonymousId}</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>You: <b className="text-slate-200">{user.anonymousId}</b></span>
              <span>•</span>
              <span>Shared theme: {peer.mainConcern}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 15:00 countdown timer */}
          <CallTimer initialSeconds={900} onExpire={handleTimerExpired} />

          <button
            onClick={() => onEndSession(getElapsedDuration(), messages.length)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition-all"
          >
            <Square className="w-3.5 h-3.5" />
            <span>End Chat</span>
          </button>
        </div>
      </div>

      {/* Safety Alert Banner */}
      <SafetyBanner
        warningCount={warningCount}
        isMuted={isMuted}
        onReportClick={() => setShowReportModal(true)}
      />

      {/* Warning Notice Box if active */}
      {activeAlert && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{activeAlert}</span>
          </div>
          <button
            onClick={() => setActiveAlert(null)}
            className="text-[10px] text-slate-400 hover:text-white ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 h-[480px] overflow-y-auto space-y-3">
        {messages.map((m) => {
          if (m.sender === 'system') {
            return (
              <div
                key={m.id}
                className={`p-3 rounded-2xl text-xs text-center border mx-auto max-w-lg ${
                  m.isFlagged
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                {m.text}
              </div>
            );
          }

          const isMe = m.sender === 'me';
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] font-bold text-slate-500 mb-1 px-1">
                {isMe ? `${user.anonymousId} (You)` : peer.anonymousId}
              </span>
              <div
                className={`max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isMe
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none'
                }`}
              >
                {m.text}
                <div
                  className={`text-[9px] mt-1 font-mono text-right ${
                    isMe ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="relative">
        {isMuted ? (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 text-xs text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <VolumeX className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>
                Temporarily muted due to sensitive content policy. Remaining:{' '}
                <b>{muteRemainingSeconds}s</b>
              </span>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Send a supportive message as ${user.anonymousId}...`}
              className="flex-1 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-2xl transition-all shadow-md shadow-indigo-600/30 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <Flag className="w-5 h-5" />
              <h3>Report Anonymous Participant</h3>
            </div>
            <p className="text-xs text-slate-300">
              Please specify the issue. Our community safety filter will audit the room transcript.
            </p>

            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="Inappropriate language">Inappropriate / abusive language</option>
              <option value="Sharing personal contact info">Attempting to trade phone/personal contacts</option>
              <option value="Disrespectful behavior">Harassment or disrespectful remarks</option>
              <option value="Other">Other safety concern</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReportUser}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                {reportSubmitted ? 'Report Submitted...' : 'Submit Report & Leave'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Crisis Modal */}
      <EmergencyModal isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
    </div>
  );
};
