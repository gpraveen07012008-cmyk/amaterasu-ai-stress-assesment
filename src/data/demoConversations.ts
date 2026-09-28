import { AssessmentResult } from '../types';
import { MANDATORY_ASSESSMENT_QUESTIONS } from '../config/supportResources';

export const DEMO_GREEN_ASSESSMENT: AssessmentResult = {
  id: 'demo-green-001',
  sessionId: 'session_demo_green',
  userId: 'user-demo',
  timestamp: new Date().toISOString(),
  answers: [
    {
      questionId: 1,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[0].text,
      userAnswer: "I'm feeling pretty calm and balanced right now. Had a productive morning and just finished lunch.",
      detectedEmotion: 'Calm, Content',
      intensity: 'low'
    },
    {
      questionId: 2,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[1].text,
      userAnswer: 'Just planning my study schedule for next week and thinking about a weekend trip with friends.',
      detectedEmotion: 'Organized, Forward-looking',
      intensity: 'low'
    },
    {
      questionId: 3,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[2].text,
      userAnswer: 'Overall mostly positive. Maybe a little tired in the evenings, but nothing unmanageable.',
      detectedEmotion: 'Positive',
      intensity: 'low'
    },
    {
      questionId: 4,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[3].text,
      userAnswer: 'I enjoy being with my classmates and roommates. We had a fun group conversation yesterday.',
      detectedEmotion: 'Connected, Socially comfortable',
      intensity: 'low'
    },
    {
      questionId: 5,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[4].text,
      userAnswer: 'Relaxed, grateful, and steady.',
      detectedEmotion: 'Relaxed',
      intensity: 'low'
    }
  ],
  generalChatCount: 3,
  mainConcern: 'Academic pressure',
  secondaryConcerns: ['Personal routine', 'Travel planning'],
  emotionalIndicators: {
    stress: 'Low',
    worry: 'Low',
    loneliness: 'Low',
    fear: 'Low',
    irritation: 'Low',
    socialWithdrawal: 'Low'
  },
  speechSignals: {
    speechRate: 'normal',
    pauses: 'normal',
    voiceEnergy: 'moderate',
    pitchVariation: 'natural',
    isEstimated: true
  },
  sviScore: 18,
  supportRegion: 'GREEN',
  screeningSummary: 'Your responses indicate low levels of observed distress indicators and healthy social connection.',
  personalizedSuggestions: [
    'Maintain your steady routine with a 5-minute daily grounding breathing exercise.',
    'Continue active social connection with your study peers.',
    'Practice light evening digital detox to sustain restorative sleep.'
  ],
  isDemo: true
};

export const DEMO_ORANGE_ASSESSMENT: AssessmentResult = {
  id: 'demo-orange-002',
  sessionId: 'session_demo_orange',
  userId: 'user-demo',
  timestamp: new Date().toISOString(),
  answers: [
    {
      questionId: 1,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[0].text,
      userAnswer: "Honestly I feel pretty drained and anxious. I have two major midterm assignments due this Friday and I keep falling behind.",
      detectedEmotion: 'Worried, Drained, Anxious',
      intensity: 'moderate'
    },
    {
      questionId: 2,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[1].text,
      userAnswer: 'Academic deadlines and career uncertainty. I worry that if my grades slip, my internship prospects will suffer.',
      detectedEmotion: 'Academic pressure, Performance anxiety',
      intensity: 'moderate'
    },
    {
      questionId: 3,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[2].text,
      userAnswer: 'Definitely much more worried and irritated than usual. Minor delays frustrate me and I find it hard to sit still.',
      detectedEmotion: 'Worried, Irritated',
      intensity: 'moderate'
    },
    {
      questionId: 4,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[3].text,
      userAnswer: "A bit withdrawn. I skip hanging out because I feel guilty whenever I'm not studying, but then I feel lonely in my room.",
      detectedEmotion: 'Social withdrawal, Loneliness',
      intensity: 'moderate'
    },
    {
      questionId: 5,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[4].text,
      userAnswer: 'Racing thoughts, pressured, needing a genuine breather.',
      detectedEmotion: 'Pressured, Restless',
      intensity: 'moderate'
    }
  ],
  generalChatCount: 2,
  mainConcern: 'Academic pressure',
  secondaryConcerns: ['Career uncertainty', 'Loneliness & withdrawal'],
  emotionalIndicators: {
    stress: 'Moderate',
    worry: 'High',
    loneliness: 'Moderate',
    fear: 'Low',
    irritation: 'Moderate',
    socialWithdrawal: 'Moderate'
  },
  speechSignals: {
    speechRate: 'fast',
    pauses: 'frequent',
    voiceEnergy: 'elevated',
    pitchVariation: 'natural',
    isEstimated: true
  },
  sviScore: 56,
  supportRegion: 'ORANGE',
  screeningSummary: 'Your responses indicate moderate distress indicators associated with academic deadlines and social isolation.',
  personalizedSuggestions: [
    'Break your syllabus assignments into bite-sized 25-minute Pomodoro focus blocks.',
    'Connect with an anonymous peer facing similar college pressures in our 15-minute moderated support room.',
    'Engage in 4-7-8 parasympathetic box breathing to lower acute cognitive tension.'
  ],
  isDemo: true
};

export const DEMO_RED_ASSESSMENT: AssessmentResult = {
  id: 'demo-red-003',
  sessionId: 'session_demo_red',
  userId: 'user-demo',
  timestamp: new Date().toISOString(),
  answers: [
    {
      questionId: 1,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[0].text,
      userAnswer: "I feel completely overwhelmed and shattered. I haven't slept properly in days and I feel like I'm drowning.",
      detectedEmotion: 'Overwhelmed, Exhausted, Despair',
      intensity: 'high'
    },
    {
      questionId: 2,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[1].text,
      userAnswer: 'Everything is crumbling. Severe financial stress, family conflicts, and I feel completely alone in dealing with it.',
      detectedEmotion: 'Financial crisis, Family turmoil',
      intensity: 'high'
    },
    {
      questionId: 3,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[2].text,
      userAnswer: 'Severely low and constantly terrified. I have persistent knot in my stomach and panic attacks.',
      detectedEmotion: 'High distress, Fear, Panic',
      intensity: 'high'
    },
    {
      questionId: 4,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[3].text,
      userAnswer: "I've cut myself off from everyone. I can't face friends or family. I hide away in my dark room.",
      detectedEmotion: 'Severe social withdrawal, Severe isolation',
      intensity: 'high'
    },
    {
      questionId: 5,
      questionText: MANDATORY_ASSESSMENT_QUESTIONS[4].text,
      userAnswer: 'Exhausted, helpless, and drowning in panic.',
      detectedEmotion: 'Helpless, Exhausted',
      intensity: 'high'
    }
  ],
  generalChatCount: 1,
  mainConcern: 'Financial',
  secondaryConcerns: ['Family conflict', 'Severe isolation', 'Sleep disruption'],
  emotionalIndicators: {
    stress: 'High',
    worry: 'High',
    loneliness: 'High',
    fear: 'High',
    irritation: 'Moderate',
    socialWithdrawal: 'High'
  },
  speechSignals: {
    speechRate: 'slow',
    pauses: 'frequent',
    voiceEnergy: 'subdued',
    pitchVariation: 'monotone',
    isEstimated: true
  },
  sviScore: 84,
  supportRegion: 'RED',
  screeningSummary: 'Your responses indicate significant distress indicators. Connecting promptly with qualified professional care or an immediate listening service is strongly recommended.',
  personalizedSuggestions: [
    'Connect with a licensed clinical psychologist or Tele-MANAS national counselor.',
    'Reach out to a trusted family member or close friend nearby to be physically present with you.',
    'Utilize our direct professional directory for online tele-consultation or local offline centers.'
  ],
  isDemo: true
};
