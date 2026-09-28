import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Square, 
  AlertTriangle, 
  Heart, 
  MessageSquare, 
  ChevronRight, 
  Info, 
  Volume2, 
  VolumeX, 
  ShieldCheck 
} from 'lucide-react';
import { UserProfile, AssessmentAnswer, AssessmentResult, SpeechSignalAnalysis } from '../types';
import { MANDATORY_ASSESSMENT_QUESTIONS, NON_CLINICAL_DISCLAIMER } from '../config/supportResources';
import { speechService, SpeechStatus } from '../services/speechService';
import { aiService } from '../services/aiService';
import { VoiceAssistantOrb } from '../components/VoiceAssistantOrb';
import { EmergencyModal } from '../components/EmergencyModal';

interface AssessmentProps {
  user: UserProfile;
  onAssessmentComplete: (result: AssessmentResult) => void;
  onCancel: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const Assessment: React.FC<AssessmentProps> = ({ user, onAssessmentComplete, onCancel }) => {
  // Pre-session consent agreement
  const [hasConsented, setHasConsented] = useState(false);

  // Conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordedAnswers, setRecordedAnswers] = useState<AssessmentAnswer[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  // Voice state
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isTextMode, setIsTextMode] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Safety
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');

  // Auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  // Initial welcome message from AI once consent is accepted
  const startSession = () => {
    setHasConsented(true);
    const initialGreeting = `Hi ${user.name.split(' ')[0] || ''}. I'm here to listen and understand how you're feeling. You can answer comfortably in your own words. ${MANDATORY_ASSESSMENT_QUESTIONS[0].text}`;

    const welcomeMsg: ChatMessage = {
      id: 'msg_welcome',
      sender: 'ai',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMsg]);

    // Speak initial greeting if voice is supported
    if (voiceEnabled && speechService.isSpeechSynthesisSupported) {
      setIsSpeaking(true);
      speechService.speak(
        initialGreeting,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  // Toggle speech recognition
  const handleToggleListening = () => {
    if (isResponding || isAnalyzing) return;

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setSpeechStatus('idle');
      if (transcript.trim()) {
        handleSendMessage(transcript.trim());
        setTranscript('');
      }
    } else {
      setSpeechError(null);
      speechService.stopSpeaking();
      setIsSpeaking(false);
      setIsListening(true);
      setSpeechStatus('listening');

      speechService.startListening(
        (recognizedText, isFinal) => {
          setTranscript(recognizedText);
          if (isFinal && recognizedText.trim()) {
            speechService.stopListening();
            setIsListening(false);
            setSpeechStatus('processing');
            handleSendMessage(recognizedText.trim());
            setTranscript('');
          }
        },
        (errorMsg) => {
          setIsListening(false);
          setSpeechStatus('error');
          setSpeechError(errorMsg);
        },
        () => {
          setIsListening(false);
          setSpeechStatus('idle');
        }
      );
    }
  };

  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  // Handle user sending text/speech message
  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim() || isAnalyzing || isResponding || currentQuestionIndex >= MANDATORY_ASSESSMENT_QUESTIONS.length) return;

    // Acute self-harm / danger emergency check
    const lower = content.toLowerCase();
    if (lower.includes('kill myself') || lower.includes('suicide') || lower.includes('end my life') || lower.includes('want to die')) {
      setShowEmergency(true);
      setEmergencyReason('Immediate support indicators detected. Please connect with human crisis professionals right away.');
    }

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSpeechStatus('processing');
    setIsResponding(true);

    const question = MANDATORY_ASSESSMENT_QUESTIONS[currentQuestionIndex];
    const answersForAnalysis = [...recordedAnswers];
    const existingAnswerIndex = answersForAnalysis.findIndex((answer) => answer.questionId === question.id);
    const recordedAnswer: AssessmentAnswer = {
      questionId: question.id,
      questionText: question.text,
      userAnswer: content,
      intensity: 'moderate'
    };
    if (existingAnswerIndex >= 0) {
      answersForAnalysis[existingAnswerIndex] = recordedAnswer;
    } else {
      answersForAnalysis.push(recordedAnswer);
    }
    setRecordedAnswers(answersForAnalysis);

    // Call AI Service for empathetic conversational response
    try {
      const historyFormatted = [...messages, userMsg].map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const reply = await aiService.getReply(
        content,
        historyFormatted,
        currentQuestionIndex,
        false
      );

      const aiMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: reply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      setSpeechStatus('idle');
      setIsResponding(false);

      if (currentQuestionIndex + 1 >= MANDATORY_ASSESSMENT_QUESTIONS.length) {
        await handleCompleteAndAnalyze(answersForAnalysis);
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        if (voiceEnabled && speechService.isSpeechSynthesisSupported) {
          setIsSpeaking(true);
          speechService.speak(
            reply.text,
            () => setIsSpeaking(true),
            () => setIsSpeaking(false)
          );
        }
      }
    } catch (err) {
      console.error(err);
      setSpeechStatus('idle');
      setIsResponding(false);
    }
  };

  // Complete and trigger AI analysis
  const handleCompleteAndAnalyze = async (answersToAnalyze: AssessmentAnswer[] = recordedAnswers) => {
    speechService.stopSpeaking();
    speechService.stopListening();
    setIsAnalyzing(true);

    // Fallback fill answers if session ended early
    const finalAnswers: AssessmentAnswer[] = [...answersToAnalyze];
    if (finalAnswers.length < MANDATORY_ASSESSMENT_QUESTIONS.length) {
      MANDATORY_ASSESSMENT_QUESTIONS.forEach((q) => {
        if (!finalAnswers.some((a) => a.questionId === q.id)) {
          finalAnswers.push({
            questionId: q.id,
            questionText: q.text,
            userAnswer: 'User completed the conversational session.',
            intensity: 'moderate'
          });
        }
      });
    }

    const speechSignals: SpeechSignalAnalysis = speechService.getSpeechSignalAnalysis();
    const result = await aiService.analyzeAssessment(finalAnswers, speechSignals);
    setIsAnalyzing(false);
    onAssessmentComplete(result);
  };

  // 1. Consent Gate
  if (!hasConsented) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-purple-600" />
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Before We Begin Your Conversation</h2>
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Privacy & Non-Clinical Consent</p>
            </div>
          </div>

          <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 text-xs text-slate-300 space-y-3 leading-relaxed mb-6">
            <p>
              <b>1. Non-Clinical Screening:</b> AMATERASU is an AI-assisted stress screening and personalized support system. It is <b>NOT</b> a diagnostic medical system and does not diagnose mental illness or provide medical prescriptions.
            </p>
            <p>
              <b>2. Natural Conversation:</b> You can speak or type freely. The AI will ask five reflective questions to gauge your current stress vulnerability and suggest personalized care.
            </p>
            <p>
              <b>3. Confidentiality & Data Minimization:</b> Your real name and identifiers are not shared. Peer sessions use anonymous IDs (e.g. {user.anonymousId}).
            </p>
            <p className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200">
              "I understand that this AI interaction is for screening and support purposes and is not a medical diagnosis."
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Return to Dashboard
            </button>
            <button
              onClick={startSession}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>I AGREE & START</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Analyzing State Screen
  if (isAnalyzing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-600/20 border-2 border-indigo-400 flex items-center justify-center mb-6 animate-pulse-glow">
            <Sparkles className="w-10 h-10 text-indigo-400 animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Analyzing your responses...</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
            Computing Stress Vulnerability Index (SVI 0–100), identifying your primary concern, and tailoring personalized supportive pathways.
          </p>
          <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto mt-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 animate-pulse" style={{ width: '100%' }} />
          </div>
          <div className="text-[11px] text-slate-400 mt-4">
            Non-clinical screening • Formulating recommendations
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Session Progress Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">AI Voice Assessment</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                Question {currentQuestionIndex + 1} / {MANDATORY_ASSESSMENT_QUESTIONS.length}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {MANDATORY_ASSESSMENT_QUESTIONS[currentQuestionIndex]?.category || 'Emotional reflection'}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Exit Session"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Dots for 5 Questions */}
      <div className="flex items-center justify-between gap-2 px-2">
        {MANDATORY_ASSESSMENT_QUESTIONS.map((q, idx) => {
          const isDone = idx < currentQuestionIndex;
          const isCurrent = idx === currentQuestionIndex;
          return (
            <div key={q.id} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-500'
                    : isCurrent
                    ? 'bg-indigo-500 animate-pulse'
                    : 'bg-slate-800'
                }`}
              />
              <span className="text-[9px] text-slate-400 hidden sm:inline">Q{idx + 1}</span>
            </div>
          );
        })}
      </div>

      {/* Center Voice Orb Visualizer */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl backdrop-blur-md overflow-hidden">
        <VoiceAssistantOrb
          status={speechStatus}
          isListening={isListening}
          isSpeaking={isSpeaking}
          transcript={transcript}
          isTextMode={isTextMode}
          onToggleListening={handleToggleListening}
          onStopSpeaking={handleStopSpeaking}
          onToggleTextMode={() => setIsTextMode(!isTextMode)}
        />

        {speechError && (
          <div className="mx-6 mb-4 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between">
            <span>{speechError}</span>
            <button
              onClick={() => setSpeechError(null)}
              className="text-[11px] underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Conversation Thread / Dialogue History */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 max-h-80 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isAI
                    ? 'bg-slate-800/90 border border-slate-700/70 text-slate-100'
                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isAI ? 'AMATERASU AI' : user.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">{msg.timestamp}</span>
                </div>
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Fallback Text Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isResponding}
            placeholder="Type your response or use 🎙 Start Speaking above..."
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-indigo-500 rounded-2xl pl-4 pr-12 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner"
          />
          <button
            type="button"
            onClick={handleToggleListening}
            disabled={isResponding}
            className={`absolute right-3 top-2.5 p-1.5 rounded-xl transition-colors ${
              isListening ? 'text-rose-400 bg-rose-500/20 animate-pulse' : 'text-slate-400 hover:text-white'
            }`}
            title={isListening ? 'Stop listening' : 'Start speaking'}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || isResponding}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-2xl transition-all shadow-md shadow-indigo-600/30 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Emergency Crisis Modal */}
      <EmergencyModal
        isOpen={showEmergency}
        onClose={() => setShowEmergency(false)}
        reason={emergencyReason}
      />
    </div>
  );
};
