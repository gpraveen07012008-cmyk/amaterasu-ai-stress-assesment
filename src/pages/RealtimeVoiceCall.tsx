import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, UserRound, Volume2, VolumeX, Flag } from 'lucide-react';
import { UserProfile } from '../types';
import { CallTimer } from '../components/CallTimer';
import { SafetyBanner } from '../components/SafetyBanner';
import { EmergencyModal } from '../components/EmergencyModal';
import { GroundingChecklist } from '../components/GroundingChecklist';
import { callService } from '../services/callService';
import { safetyService } from '../services/safetyService';

export interface RealtimeCallSession {
  callId: string;
  peerCallId: string;
  role: 'caller' | 'callee';
  status: 'calling' | 'ringing' | 'connecting' | 'connected' | 'failed';
}

interface RealtimeVoiceCallProps {
  user: UserProfile;
  call: RealtimeCallSession;
  callError?: string;
  onConnected: () => void;
  onEndCall: (duration: string) => void;
  onCancel: () => void;
}

export const RealtimeVoiceCall: React.FC<RealtimeVoiceCallProps> = ({
  user,
  call,
  callError,
  onConnected,
  onEndCall,
  onCancel
}) => {
  const [callStatus, setCallStatus] = useState<RealtimeCallSession['status']>(call.status);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [warningCount] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [isAccepted, setIsAccepted] = useState(false);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const connectedAtRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    setCallStatus(call.status);
    if (call.status === 'connecting') setIsAccepted(true);
  }, [call.status]);

  useEffect(() => {
    if (!call.callId || !isAccepted || call.status === 'failed') return;

    let disposed = false;
    let peerConnection: RTCPeerConnection | null = null;
    let localStream: MediaStream | null = null;
    const pendingCandidates: RTCIceCandidateInit[] = [];

    const applySignal = async (event: { callId?: string; signal?: RTCSessionDescriptionInit | RTCIceCandidateInit | { type: 'ice'; candidate: RTCIceCandidateInit } }) => {
      if (disposed || event.callId !== call.callId || !event.signal || !peerConnection) return;
      const signal = event.signal;
      if ('type' in signal && signal.type === 'ice' && 'candidate' in signal) {
        if (peerConnection.remoteDescription) {
          await peerConnection.addIceCandidate(signal.candidate);
        } else {
          pendingCandidates.push(signal.candidate);
        }
        return;
      }

      const description = signal as RTCSessionDescriptionInit;
      await peerConnection.setRemoteDescription(description);
      while (pendingCandidates.length) {
        await peerConnection.addIceCandidate(pendingCandidates.shift()!);
      }

      if (description.type === 'offer') {
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        await callService.sendSignal(call.callId, peerConnection.localDescription!.toJSON());
      }
    };

    const unsubscribeSignal = callService.on('call:signal', (event) => {
      void applySignal(event).catch(() => setMediaError('Could not establish the encrypted audio connection.'));
    });

    const connectAudio = async () => {
      try {
        const iceResponse = await fetch('/api/calls/ice', { credentials: 'include' });
        if (!iceResponse.ok) throw new Error('Unable to load secure call connection settings.');
        const { iceServers } = await iceResponse.json() as { iceServers: RTCIceServer[] };

        peerConnection = new RTCPeerConnection({ iceServers });
        peerConnectionRef.current = peerConnection;
        peerConnection.ontrack = (event) => {
          if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0];
        };
        peerConnection.onicecandidate = (event) => {
          if (event.candidate && call.callId) {
            void callService.sendSignal(call.callId, { type: 'ice', candidate: event.candidate.toJSON() });
          }
        };
        peerConnection.onconnectionstatechange = () => {
          if (peerConnection?.connectionState === 'connected') {
            connectedAtRef.current = Date.now();
            setCallStatus('connected');
            onConnected();
          } else if (peerConnection?.connectionState === 'failed') {
            setCallStatus('failed');
            setMediaError('The audio connection failed. Check your network and try again.');
          }
        };

        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (disposed) {
          localStream.getTracks().forEach((track) => track.stop());
          return;
        }
        localStreamRef.current = localStream;
        localStream.getAudioTracks().forEach((track) => peerConnection?.addTrack(track, localStream!));

        if (call.role === 'caller') {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          await callService.sendSignal(call.callId, peerConnection.localDescription!.toJSON());
        }
      } catch (error) {
        if (disposed) return;
        const message = error instanceof Error && error.name === 'NotAllowedError'
          ? 'Microphone access was denied. Allow microphone access and rejoin the call.'
          : error instanceof Error
          ? error.message
          : 'Unable to start the microphone.';
        setMediaError(message);
        setCallStatus('failed');
      }
    };

    void connectAudio();

    return () => {
      disposed = true;
      unsubscribeSignal();
      peerConnection?.close();
      localStream?.getTracks().forEach((track) => track.stop());
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
      peerConnectionRef.current = null;
      localStreamRef.current = null;
    };
  }, [call.callId, isAccepted]);

  const getElapsedDuration = () => {
    const elapsed = connectedAtRef.current ? Math.max(1, Math.floor((Date.now() - connectedAtRef.current) / 1000)) : 0;
    return `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (call.callId) void callService.endCall(call.callId);
    if (callStatus === 'connected') onEndCall(getElapsedDuration());
    else onCancel();
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    localStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = !nextMuted; });
    setIsMuted(nextMuted);
  };

  const handleReport = () => {
    safetyService.reportUser('voice_session', user.id, call.peerCallId, 'Voice call report');
    setShowReportModal(false);
    handleEndCall();
  };

  const statusText = callStatus === 'calling'
    ? 'Calling...'
    : callStatus === 'ringing'
    ? 'Ringing...'
    : callStatus === 'connected'
    ? 'Connected'
    : callStatus === 'failed'
    ? 'Connection failed'
    : 'Connecting...';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 text-center">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-28 h-28 rounded-full bg-slate-800 border border-indigo-500/40 flex items-center justify-center shadow-xl">
            <UserRound className="w-14 h-14 text-indigo-300" aria-label="Default caller avatar" />
          </div>
          <div className="mt-5 text-xs uppercase text-slate-400">Call ID</div>
          <div className="text-xl font-bold text-white">{call.peerCallId}</div>
          <div className={`mt-2 text-sm font-semibold ${callStatus === 'connected' ? 'text-emerald-400' : callStatus === 'failed' ? 'text-rose-300' : 'text-amber-300'}`}>
            {statusText}
          </div>
          {callStatus === 'connected' && <CallTimer initialSeconds={900} onExpire={handleEndCall} />}
          {(callError || mediaError) && <p role="alert" className="mt-3 max-w-md text-xs text-rose-300">{mediaError || callError}</p>}
          <audio ref={remoteAudioRef} autoPlay playsInline muted={!isSpeakerOn} className="hidden" />
        </div>

        <SafetyBanner warningCount={warningCount} isMuted={isMuted} onReportClick={() => setShowReportModal(true)} />

        <div className="flex items-center justify-center gap-4 pt-5 mt-5 border-t border-slate-800">
          {callStatus === 'connected' && (
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-4 rounded-2xl transition-all ${isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          )}
          {callStatus === 'connected' && (
            <button
              type="button"
              onClick={() => setIsSpeakerOn((enabled) => !enabled)}
              className="p-4 rounded-2xl bg-slate-800 text-slate-300 hover:text-white transition-all"
              title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
              aria-label={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
          )}
          <button
            type="button"
            onClick={handleEndCall}
            disabled={!call.callId}
            className="flex items-center gap-2 px-6 py-4 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all"
          >
            <PhoneOff className="w-5 h-5" />
            <span>{callStatus === 'connected' ? 'End Call' : 'Cancel Call'}</span>
          </button>
        </div>
      </div>

      <GroundingChecklist />

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-left space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <Flag className="w-5 h-5" />
              <h3>Report Call Participant</h3>
            </div>
            <p className="text-xs text-slate-300">Reporting ends the call and records a safety report.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowReportModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">Cancel</button>
              <button type="button" onClick={handleReport} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">End Call & Report</button>
            </div>
          </div>
        </div>
      )}
      <EmergencyModal isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
    </div>
  );
};