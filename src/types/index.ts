export type SupportRegion = 'GREEN' | 'ORANGE' | 'RED';

export type ConcernCategory =
  | 'Academic pressure'
  | 'Career'
  | 'Family'
  | 'Relationship'
  | 'Financial'
  | 'Work'
  | 'Health'
  | 'Loneliness'
  | 'Personal'
  | 'Other';

export interface UserProfile {
  id: string;
  name: string;
  userId: string;
  password?: string;
  email?: string;
  phoneNumber?: string;
  maritalStatus: 'Single' | 'Married' | 'Other' | 'Prefer not to say';
  sex: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  dob: string;
  credits: number;
  anonymousId: string;
  favouriteCallers: string[]; // List of anonymous IDs favourited
  createdAt: string;
  lastSvi?: number;
  lastRegion?: SupportRegion;
  lastConcern?: ConcernCategory;
  lastAssessmentDate?: string;
}

export interface AssessmentAnswer {
  questionId: number;
  questionText: string;
  userAnswer: string;
  followUpQuestion?: string;
  followUpAnswer?: string;
  detectedEmotion?: string;
  intensity?: 'low' | 'moderate' | 'high';
}

export interface SpeechSignalAnalysis {
  speechRate?: 'slow' | 'normal' | 'fast';
  pauses?: 'frequent' | 'normal' | 'rare';
  voiceEnergy?: 'subdued' | 'moderate' | 'elevated';
  pitchVariation?: 'monotone' | 'natural' | 'expressive';
  isEstimated: boolean;
}

export interface AssessmentResult {
  id: string;
  sessionId: string;
  userId: string;
  timestamp: string;
  answers: AssessmentAnswer[];
  generalChatCount: number;
  mainConcern: ConcernCategory;
  secondaryConcerns: string[];
  emotionalIndicators: {
    stress: 'Low' | 'Moderate' | 'High';
    worry: 'Low' | 'Moderate' | 'High';
    loneliness: 'Low' | 'Moderate' | 'High';
    fear: 'Low' | 'Moderate' | 'High';
    irritation: 'Low' | 'Moderate' | 'High';
    socialWithdrawal: 'Low' | 'Moderate' | 'High';
  };
  speechSignals?: SpeechSignalAnalysis;
  sviScore: number; // 0 - 100
  supportRegion: SupportRegion;
  screeningSummary: string;
  personalizedSuggestions: string[];
  isDemo?: boolean;
}

export interface Message {
  id: string;
  sender: 'me' | 'peer' | 'system';
  text: string;
  timestamp: string;
  isFlagged?: boolean;
}

export interface PeerSession {
  id: string;
  mode: 'text' | 'voice';
  myAnonymousId: string;
  peerAnonymousId: string;
  peerGenderPreference: 'Any' | 'Same gender' | 'Different gender';
  matchedConcern?: string;
  durationSeconds: number; // usually 900 (15 min)
  remainingSeconds: number;
  status: 'active' | 'muted' | 'completed' | 'terminated_safety' | 'reported';
  safetyWarningsCount: number;
  messages: Message[];
  startedAt: string;
}

export interface ProfessionalProvider {
  id: string;
  name: string;
  role: 'Psychologist' | 'Psychiatrist' | 'Counsellor' | 'Government support service';
  qualification: string;
  specialization: string;
  mode: 'Online' | 'Offline' | 'Both';
  availability: string;
  contact: string;
  location: string;
  isDemoData: boolean;
  rating: number;
  bio: string;
}

export interface CallHistoryItem {
  id: string;
  date: string;
  anonymousUserId: string;
  communicationType: 'Voice' | 'Text';
  duration: string;
  status: 'Completed' | 'Ended Early' | 'Reported';
  rating?: number;
  feedbackText?: string;
  isFavourite: boolean;
}

export interface FeedbackData {
  sessionId: string;
  anonymousUserId: string;
  helpfulRating: number; // 1-5
  wasRespectful: boolean;
  feltSupported: boolean;
  wouldTalkAgain: boolean;
  comments?: string;
}

export interface ReassessmentComparison {
  previousSvi: number;
  currentSvi: number;
  previousRegion: SupportRegion;
  currentRegion: SupportRegion;
  recommendation: 'CONTINUE' | 'CHANGE' | 'ESCALATE';
  notes: string;
}
