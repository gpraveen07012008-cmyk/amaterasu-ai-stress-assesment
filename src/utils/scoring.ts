import { SupportRegion, AssessmentAnswer, ConcernCategory, SpeechSignalAnalysis } from '../types';

export interface SVIScoringBreakdown {
  emotionalResponseScore: number; // 0-30
  selfReportedStressScore: number; // 0-30
  concernSeverityScore: number;    // 0-20
  socialSignalScore: number;       // 0-20
  speechModifierScore: number;     // -5 to +5 adjustment
  totalSvi: number;                // 0-100 clamped
  region: SupportRegion;
  regionTitle: string;
  regionDescription: string;
  disclaimer: string;
}

/**
 * Transparent SVI Scoring Formula:
 * - Emotional responses: 30% weight
 * - Self-reported stress trajectory: 30% weight
 * - Main concern severity: 20% weight
 * - Social & emotional signals: 20% weight
 * - Speech signals: supporting context only (never medical proof)
 * 
 * Strict non-clinical framing:
 * - GREEN (0–30): Low Support Priority
 * - ORANGE (31–70): Moderate Support Priority
 * - RED (71–100): High Support Priority
 */
export function calculateSVI(
  answers: AssessmentAnswer[],
  mainConcern: ConcernCategory,
  speechSignals?: SpeechSignalAnalysis
): SVIScoringBreakdown {
  let emotionalScore = 10;
  let stressScore = 10;
  let concernScore = 8;
  let socialScore = 8;

  // 1. Analyze Answer 1: Emotional state (Max 30)
  const q1 = answers.find(a => a.questionId === 1)?.userAnswer.toLowerCase() || '';
  const q5 = answers.find(a => a.questionId === 5)?.userAnswer.toLowerCase() || '';
  const combinedEmotion = q1;

  const highDistressWords = ['overwhelmed', 'hopeless', 'exhausted', 'can\'t take it', 'panic', 'crying', 'drowning', 'awful', 'terrible', 'shattered', 'empty'];
  const moderateDistressWords = ['stressed', 'worried', 'tired', 'anxious', 'irritated', 'confused', 'low', 'sad', 'uneasy', 'tense', 'drained'];
  const positiveWords = ['calm', 'fine', 'good', 'happy', 'great', 'peaceful', 'relaxed', 'okay', 'excited', 'optimistic'];

  const highMatches = highDistressWords.filter(w => combinedEmotion.includes(w)).length;
  const modMatches = moderateDistressWords.filter(w => combinedEmotion.includes(w)).length;
  const posMatches = positiveWords.filter(w => combinedEmotion.includes(w)).length;

  if (highMatches >= 2) {
    emotionalScore = 28;
  } else if (highMatches === 1 || modMatches >= 2) {
    emotionalScore = 20;
  } else if (modMatches === 1) {
    emotionalScore = 14;
  } else if (posMatches >= 1) {
    emotionalScore = Math.max(3, 8 - posMatches * 2);
  } else {
    emotionalScore = 12;
  }

  // 2. Analyze Answer 3: Frequency and impact on daily functioning (Max 30)
  const q3 = answers.find(a => a.questionId === 3)?.userAnswer.toLowerCase() || '';
  if (q3.includes('almost all the time') || q3.includes('all the time') || q3.includes('constantly') || q3.includes('most of the time')) {
    stressScore = 28;
  } else if (q3.includes('during the day') || q3.includes('mostly at night') || q3.includes('often') || q3.includes('frequently') || q3.includes('every day')) {
    stressScore = 21;
  } else if (q3.includes('occasionally') || q3.includes('sometimes') || q3.includes('once in a while')) {
    stressScore = 13;
  } else if (q3.includes('rarely') || q3.includes('never')) {
    stressScore = 5;
  }

  const q4 = answers.find(a => a.questionId === 4)?.userAnswer.toLowerCase() || '';
  const impactWords = ['affect', 'changed', 'difficulty', 'hard to', 'struggle', 'disrupt', 'worse', 'unable', "can't", 'missed'];
  if (impactWords.some(word => q4.includes(word))) {
    const significantImpactWords = ['struggle', 'unable', "can't", 'significant', 'severe', 'missed'];
    stressScore = Math.min(30, stressScore + (significantImpactWords.some(word => q4.includes(word)) ? 5 : 3));
  } else if (['no change', 'nothing changed', 'not affected', 'no effect', 'not really'].some(phrase => q4.includes(phrase))) {
    stressScore = Math.max(0, stressScore - 3);
  }

  // 3. Analyze Answer 2: Concern Severity (Max 20)
  const q2 = answers.find(a => a.questionId === 2)?.userAnswer.toLowerCase() || '';
  const concernSeverityWeights: Record<ConcernCategory, number> = {
    'Academic pressure': 14,
    'Career': 13,
    'Family': 15,
    'Relationship': 15,
    'Financial': 17,
    'Work': 14,
    'Health': 16,
    'Loneliness': 16,
    'Personal': 12,
    'Other': 10,
  };
  concernScore = concernSeverityWeights[mainConcern] || 12;
  if (q2.includes('crisis') || q2.includes('failing') || q2.includes('debt') || q2.includes('breakup') || q2.includes('fired')) {
    concernScore = Math.min(20, concernScore + 4);
  }

  // 4. Analyze Answer 5: Social support and connection (Max 20)
  if (q5.includes('isolated') || q5.includes('unsupported') || q5.includes('uncomfortable') || q5.includes('alone') || q5.includes('nobody') || q5.includes('no one')) {
    socialScore = 18;
  } else if (q5.includes('supported') || q5.includes('comfortable') || q5.includes('friend') || q5.includes('family') || q5.includes('someone') || q5.includes('connected')) {
    socialScore = 13;
  }

  // 5. Speech Signals (supporting modifier only, max +/- 4 points)
  let speechModifier = 0;
  if (speechSignals) {
    if (speechSignals.pauses === 'frequent' && speechSignals.voiceEnergy === 'subdued') {
      speechModifier += 3;
    } else if (speechSignals.voiceEnergy === 'elevated' && speechSignals.speechRate === 'fast') {
      speechModifier += 2;
    } else if (speechSignals.speechRate === 'normal' && speechSignals.pitchVariation === 'natural') {
      speechModifier -= 2;
    }
  }

  // Calculate raw sum and clamp to 0-100
  let rawTotal = emotionalScore + stressScore + concernScore + socialScore + speechModifier;
  const totalSvi = Math.max(0, Math.min(100, Math.round(rawTotal)));

  // Determine Support Priority Region
  let region: SupportRegion = 'GREEN';
  let regionTitle = 'LOW SUPPORT PRIORITY';
  let regionDescription = 'Your responses contain relatively low levels of observed distress indicators.';

  if (totalSvi >= 71) {
    region = 'RED';
    regionTitle = 'HIGH SUPPORT PRIORITY';
    regionDescription = 'Your responses indicate that prompt human or professional support may be beneficial.';
  } else if (totalSvi >= 31) {
    region = 'ORANGE';
    regionTitle = 'MODERATE SUPPORT PRIORITY';
    regionDescription = 'Your responses indicate moderate distress indicators. Additional human connection and personalized relaxation may be helpful.';
  }

  return {
    emotionalResponseScore: emotionalScore,
    selfReportedStressScore: stressScore,
    concernSeverityScore: concernScore,
    socialSignalScore: socialScore,
    speechModifierScore: speechModifier,
    totalSvi,
    region,
    regionTitle,
    regionDescription,
    disclaimer: 'SVI is a prototype screening indicator and is not a medical diagnosis.'
  };
}

export function getRegionColor(region: SupportRegion) {
  switch (region) {
    case 'GREEN':
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500 text-slate-950 font-bold',
        glow: 'shadow-emerald-500/20',
        bar: 'bg-emerald-400',
      };
    case 'ORANGE':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        badge: 'bg-amber-500 text-slate-950 font-bold',
        glow: 'shadow-amber-500/20',
        bar: 'bg-amber-400',
      };
    case 'RED':
      return {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        badge: 'bg-rose-500 text-white font-bold',
        glow: 'shadow-rose-500/20',
        bar: 'bg-rose-500',
      };
  }
}
