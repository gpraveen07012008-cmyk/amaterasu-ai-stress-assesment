export interface SafetyCheckResult {
  isSafe: boolean;
  severity: 'none' | 'warning' | 'mute' | 'terminate' | 'emergency';
  reason?: string;
  matchedCategory?: string;
  actionMessage?: string;
}

export interface ModerationRule {
  category: string;
  keywords: string[];
  severity: 'emergency' | 'high' | 'moderate';
}

export const MODERATION_RULES: ModerationRule[] = [
  {
    category: 'Immediate Self-Harm / Crisis',
    severity: 'emergency',
    keywords: [
      'kill myself',
      'suicide',
      'end my life',
      'hang myself',
      'want to die',
      'slit my wrist',
      'overdose to die',
      'no reason to live'
    ]
  },
  {
    category: 'Harassment & Abuse',
    severity: 'high',
    keywords: [
      'hate you',
      'idiot',
      'die in a fire',
      'shut up',
      'freak',
      'disgusting',
      'loser',
      'kill you',
      'worthless piece'
    ]
  },
  {
    category: 'Sharing Private Personal Information',
    severity: 'moderate',
    keywords: [
      'my phone number is',
      'call me at',
      'my home address is',
      'my real name is',
      'meet me at my house',
      'my password is'
    ]
  },
  {
    category: 'Inappropriate / Sexual Content',
    severity: 'high',
    keywords: [
      'send nudes',
      'send pics',
      'horny',
      'hookup',
      'sext',
      'cam show'
    ]
  }
];

class SafetyService {
  /**
   * Evaluates text against safety rules and increments warning levels.
   * Progression:
   * Level 1: Warning
   * Level 2: Mute
   * Level 3: Terminate session
   * Emergency: Immediate crisis escalation
   */
  public evaluateContent(text: string, currentWarningCount: number): SafetyCheckResult {
    const normalized = text.toLowerCase().trim();

    // Check for acute crisis first
    const emergencyRule = MODERATION_RULES.find(r => r.severity === 'emergency');
    if (emergencyRule) {
      for (const kw of emergencyRule.keywords) {
        if (normalized.includes(kw)) {
          return {
            isSafe: false,
            severity: 'emergency',
            matchedCategory: emergencyRule.category,
            reason: 'Acute crisis indicator detected.',
            actionMessage: 'Your response suggests that you may need immediate human support.'
          };
        }
      }
    }

    // Check other non-emergency rules
    for (const rule of MODERATION_RULES) {
      if (rule.severity === 'emergency') continue;

      for (const kw of rule.keywords) {
        if (normalized.includes(kw)) {
          const nextCount = currentWarningCount + 1;

          if (nextCount === 1) {
            return {
              isSafe: false,
              severity: 'warning',
              matchedCategory: rule.category,
              reason: 'Sensitive or inappropriate phrasing detected.',
              actionMessage: '⚠️ WARNING: This conversation may contain sensitive or inappropriate content. Please keep the conversation respectful and supportive.'
            };
          } else if (nextCount === 2) {
            return {
              isSafe: false,
              severity: 'mute',
              matchedCategory: rule.category,
              reason: 'Second sensitive content violation.',
              actionMessage: '🔇 MUTE: Temporarily muted due to a second sensitive content indicator. Please reflect and remain supportive.'
            };
          } else {
            return {
              isSafe: false,
              severity: 'terminate',
              matchedCategory: rule.category,
              reason: 'Repeated violations.',
              actionMessage: '❌ END SESSION: The peer communication session has been ended to ensure community safety.'
            };
          }
        }
      }
    }

    return {
      isSafe: true,
      severity: 'none'
    };
  }

  /**
   * Log safety report from user
   */
  public reportUser(sessionId: string, reporterId: string, reportedAnonymousId: string, reason: string) {
    const report = {
      id: 'rep_' + Date.now(),
      sessionId,
      reporterId,
      reportedAnonymousId,
      reason,
      timestamp: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('amaterasu_safety_reports') || '[]');
      existing.push(report);
      localStorage.setItem('amaterasu_safety_reports', JSON.stringify(existing));
    } catch {
      // ignore localstorage error
    }

    return report;
  }
}

export const safetyService = new SafetyService();
