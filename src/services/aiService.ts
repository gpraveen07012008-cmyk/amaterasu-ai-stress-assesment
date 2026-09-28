import { GoogleGenAI } from '@google/genai';
import { AssessmentAnswer, AssessmentResult, ConcernCategory, SpeechSignalAnalysis, SupportRegion } from '../types';
import { calculateSVI } from '../utils/scoring';
import { MANDATORY_ASSESSMENT_QUESTIONS } from '../config/supportResources';

export interface AIProvider {
  generateReply(
    userMessage: string,
    history: { sender: 'ai' | 'user'; text: string }[],
    currentQuestionIndex: number,
    isFollowUp: boolean
  ): Promise<{ text: string; isFollowUp: boolean; advanceQuestion: boolean }>;

  analyzeAssessment(
    answers: AssessmentAnswer[],
    speechSignals?: SpeechSignalAnalysis
  ): Promise<AssessmentResult>;
}

// System prompt strictly adhering to non-clinical and empathetic screening principles
export const AMATERASU_SYSTEM_PROMPT = `
You are AMATERASU, an AI-assisted stress screening and supportive conversational assistant.
Your role:
- Be warm, genuinely empathetic, validating, and conversational.
- Be an empathetic listener, NOT a medical doctor, psychiatrist, or licensed clinical therapist.
- NEVER diagnose mental illness. NEVER say "You have depression", "You have anxiety disorder", or "You are mentally ill".
- Use non-clinical framing: "Potential distress indicators detected", "Your responses indicate that additional support may be helpful".
- Ask only the next question from the fixed five-question assessment, in order. Do not ask additional questions.
- Conduct a natural conversation that feels gentle and human, not like a cold questionnaire.
- Never assume interests or preferences based on gender/sex.
- If immediate self-harm or danger is detected, provide compassionate crisis helpline guidance.
`;

const getFixedAssessmentReply = (currentQuestionIndex: number) => {
  const nextQuestion = MANDATORY_ASSESSMENT_QUESTIONS[currentQuestionIndex + 1];
  return {
    text: nextQuestion
      ? `Thank you for sharing that. ${nextQuestion.text}`
      : 'Thank you for sharing that. You have completed all five assessment questions, and your responses are being reviewed now.',
    isFollowUp: false,
    advanceQuestion: true
  };
};

class GeminiAIProvider implements AIProvider {
  private client: GoogleGenAI | null = null;
  private apiKey: string = '';

  constructor() {
    // Check multiple environments for key
    const key =
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
      '';
    if (key && key !== 'MY_GEMINI_API_KEY') {
      this.apiKey = key;
      try {
        this.client = new GoogleGenAI({ apiKey: key });
      } catch (err) {
        console.warn('Could not initialize GoogleGenAI client, fallback will be used', err);
      }
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.client && this.apiKey);
  }

  public async generateReply(
    _userMessage: string,
    _history: { sender: 'ai' | 'user'; text: string }[],
    currentQuestionIndex: number,
    _isFollowUp: boolean
  ): Promise<{ text: string; isFollowUp: boolean; advanceQuestion: boolean }> {
    if (!this.client) {
      throw new Error('Gemini API key not configured');
    }

    return getFixedAssessmentReply(currentQuestionIndex);
  }

  public async analyzeAssessment(
    answers: AssessmentAnswer[],
    speechSignals?: SpeechSignalAnalysis
  ): Promise<AssessmentResult> {
    // Determine main concern from answers
    const textAnswers = answers.map(a => `Q${a.questionId}: ${a.questionText}\nUser: ${a.userAnswer}\nFollow-up: ${a.followUpAnswer || 'N/A'}`).join('\n\n');
    let mainConcern: ConcernCategory = 'Academic pressure';

    if (this.client) {
      try {
        const prompt = `Analyze this stress screening session:
${textAnswers}

Return a valid JSON object with:
{
  "mainConcern": one of ["Academic pressure", "Career", "Family", "Relationship", "Financial", "Work", "Health", "Loneliness", "Personal", "Other"],
  "secondaryConcerns": [array of 2 strings]
}`;
        const response = await this.client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
        const json = response.text?.replace(/```json|```/g, '').trim() || '{}';
        const parsed = JSON.parse(json);
        const concernCategories: ConcernCategory[] = [
          'Academic pressure', 'Career', 'Family', 'Relationship', 'Financial',
          'Work', 'Health', 'Loneliness', 'Personal', 'Other'
        ];
        if (concernCategories.includes(parsed.mainConcern)) {
          mainConcern = parsed.mainConcern;
        }
      } catch (error) {
        console.warn('Gemini analysis failed; using assessment answers for concern detection.', error);
      }
    }

    const scoring = calculateSVI(answers, mainConcern, speechSignals);
    return {
      id: 'asmt_' + Date.now(),
      sessionId: 'sess_' + Date.now(),
      userId: 'user',
      timestamp: new Date().toISOString(),
      answers,
      generalChatCount: 0,
      mainConcern,
      secondaryConcerns: ['Emotional balance', 'Daily routine'],
      emotionalIndicators: {
        stress: scoring.totalSvi > 70 ? 'High' : scoring.totalSvi > 30 ? 'Moderate' : 'Low',
        worry: scoring.totalSvi > 60 ? 'High' : scoring.totalSvi > 30 ? 'Moderate' : 'Low',
        loneliness: scoring.socialSignalScore > 14 ? 'High' : scoring.socialSignalScore > 8 ? 'Moderate' : 'Low',
        fear: scoring.totalSvi > 75 ? 'High' : scoring.totalSvi > 45 ? 'Moderate' : 'Low',
        irritation: scoring.selfReportedStressScore > 18 ? 'Moderate' : 'Low',
        socialWithdrawal: scoring.socialSignalScore > 12 ? 'Moderate' : 'Low'
      },
      speechSignals,
      sviScore: scoring.totalSvi,
      supportRegion: scoring.region,
      screeningSummary: scoring.regionDescription,
      personalizedSuggestions: [
        `Targeted coping for ${mainConcern}: take a short deliberate mental break.`,
        'Engage in 5 minutes of mindful box breathing to ease tension.',
        scoring.region === 'RED'
          ? 'Reach out to a qualified counselor or tele-mental health professional.'
          : scoring.region === 'ORANGE'
          ? 'Consider speaking with an anonymous peer in our moderated support lounge.'
          : 'Maintain your healthy habits and balanced daily rhythm.'
      ]
    };
  }
}

class LocalMockAIProvider implements AIProvider {
  public async generateReply(
    _userMessage: string,
    _history: { sender: 'ai' | 'user'; text: string }[],
    currentQuestionIndex: number,
    _isFollowUp: boolean
  ): Promise<{ text: string; isFollowUp: boolean; advanceQuestion: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return getFixedAssessmentReply(currentQuestionIndex);
  }

  public async analyzeAssessment(
    answers: AssessmentAnswer[],
    speechSignals?: SpeechSignalAnalysis
  ): Promise<AssessmentResult> {
    await new Promise(r => setTimeout(r, 800));

    // Determine main concern
    const allAnswers = answers.map(a => `${a.userAnswer} ${a.followUpAnswer || ''}`).join(' ').toLowerCase();

    let mainConcern: ConcernCategory = 'Academic pressure';
    if (allAnswers.includes('exam') || allAnswers.includes('college') || allAnswers.includes('study') || allAnswers.includes('assignment') || allAnswers.includes('grades')) {
      mainConcern = 'Academic pressure';
    } else if (allAnswers.includes('career') || allAnswers.includes('job') || allAnswers.includes('work') || allAnswers.includes('interview') || allAnswers.includes('promotion')) {
      mainConcern = 'Career';
    } else if (allAnswers.includes('money') || allAnswers.includes('financial') || allAnswers.includes('debt') || allAnswers.includes('bills')) {
      mainConcern = 'Financial';
    } else if (allAnswers.includes('lonely') || allAnswers.includes('alone') || allAnswers.includes('isolated')) {
      mainConcern = 'Loneliness';
    } else if (allAnswers.includes('family') || allAnswers.includes('parents') || allAnswers.includes('sibling')) {
      mainConcern = 'Family';
    } else if (allAnswers.includes('relationship') || allAnswers.includes('partner') || allAnswers.includes('breakup')) {
      mainConcern = 'Relationship';
    } else if (allAnswers.includes('health') || allAnswers.includes('sick') || allAnswers.includes('pain') || allAnswers.includes('doctor')) {
      mainConcern = 'Health';
    }

    const scoring = calculateSVI(answers, mainConcern, speechSignals);

    const suggestions: string[] = [];
    if (mainConcern === 'Academic pressure') {
      suggestions.push('Break large study tasks into 20-minute micro-sessions to reduce immediate cognitive overwhelm.');
      suggestions.push('Take a 5-minute conscious breathing break between chapters.');
    } else if (mainConcern === 'Career') {
      suggestions.push('Map out only the next single achievable action step rather than trying to solve the 5-year plan today.');
      suggestions.push('Reach out to a peer or mentor for grounded perspective.');
    } else if (mainConcern === 'Loneliness') {
      suggestions.push('Join an anonymous 15-minute peer chat to share a friendly conversation.');
      suggestions.push('Schedule one low-pressure outdoor walk or community visit this week.');
    } else {
      suggestions.push('Practice 4-7-8 breathing to down-regulate nervous system tension.');
      suggestions.push('Jot down thoughts in a 3-minute evening journal to clear mental clutter.');
    }

    if (scoring.region === 'RED') {
      suggestions.unshift('Prompt consultation with a certified counselor or psychologist is strongly encouraged.');
    } else if (scoring.region === 'ORANGE') {
      suggestions.push('Connect with an anonymous peer facing similar concerns in our safe voice/text room.');
    }

    return {
      id: 'asmt_' + Date.now(),
      sessionId: 'sess_' + Date.now(),
      userId: 'user',
      timestamp: new Date().toISOString(),
      answers,
      generalChatCount: 1,
      mainConcern,
      secondaryConcerns: ['Emotional balance', 'Daily routine'],
      emotionalIndicators: {
        stress: scoring.totalSvi > 70 ? 'High' : scoring.totalSvi > 30 ? 'Moderate' : 'Low',
        worry: scoring.totalSvi > 60 ? 'High' : scoring.totalSvi > 30 ? 'Moderate' : 'Low',
        loneliness: scoring.socialSignalScore > 14 ? 'High' : scoring.socialSignalScore > 8 ? 'Moderate' : 'Low',
        fear: scoring.totalSvi > 75 ? 'High' : scoring.totalSvi > 45 ? 'Moderate' : 'Low',
        irritation: scoring.selfReportedStressScore > 18 ? 'Moderate' : 'Low',
        socialWithdrawal: scoring.socialSignalScore > 12 ? 'Moderate' : 'Low'
      },
      speechSignals,
      sviScore: scoring.totalSvi,
      supportRegion: scoring.region,
      screeningSummary: scoring.regionDescription,
      personalizedSuggestions: suggestions
    };
  }
}

class AIService {
  private activeProvider: AIProvider;
  private geminiProvider: GeminiAIProvider;
  private localProvider: LocalMockAIProvider;

  constructor() {
    this.geminiProvider = new GeminiAIProvider();
    this.localProvider = new LocalMockAIProvider();

    // Prefer Gemini if key is provided, otherwise local fallback
    if (this.geminiProvider.isConfigured()) {
      this.activeProvider = this.geminiProvider;
    } else {
      this.activeProvider = this.localProvider;
    }
  }

  public isUsingGemini(): boolean {
    return this.geminiProvider.isConfigured();
  }

  public setProvider(type: 'gemini' | 'local') {
    if (type === 'gemini' && this.geminiProvider.isConfigured()) {
      this.activeProvider = this.geminiProvider;
    } else {
      this.activeProvider = this.localProvider;
    }
  }

  public async getReply(
    userMessage: string,
    history: { sender: 'ai' | 'user'; text: string }[],
    currentQuestionIndex: number,
    isFollowUp: boolean
  ) {
    try {
      return await this.activeProvider.generateReply(userMessage, history, currentQuestionIndex, isFollowUp);
    } catch (err) {
      console.warn('Primary AI provider failed, using resilient local fallback', err);
      return await this.localProvider.generateReply(userMessage, history, currentQuestionIndex, isFollowUp);
    }
  }

  public async analyzeAssessment(
    answers: AssessmentAnswer[],
    speechSignals?: SpeechSignalAnalysis
  ): Promise<AssessmentResult> {
    try {
      return await this.activeProvider.analyzeAssessment(answers, speechSignals);
    } catch (err) {
      console.warn('AI analysis provider failed, using fallback', err);
      return await this.localProvider.analyzeAssessment(answers, speechSignals);
    }
  }
}

export const aiService = new AIService();
