import { SpeechSignalAnalysis } from '../types';

// Declare types for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type SpeechStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

class SpeechService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  public isSpeechRecognitionSupported: boolean = false;
  public isSpeechSynthesisSupported: boolean = false;

  private speechStartTime: number = 0;
  private speechWordCount: number = 0;
  private pauseCount: number = 0;
  private lastSoundTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        this.isSpeechRecognitionSupported = true;
        try {
          this.recognition = new SpeechRecognitionClass();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-US';
        } catch (e) {
          console.warn('SpeechRecognition init error', e);
          this.isSpeechRecognitionSupported = false;
        }
      }

      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
        this.isSpeechSynthesisSupported = true;
        this.loadVoices();
        if (this.synthesis.onvoiceschanged !== undefined) {
          this.synthesis.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  private loadVoices() {
    if (!this.synthesis) return;
    const voices = this.synthesis.getVoices();
    // Prefer soothing English voices (Google US English, Samantha, Natural, etc.)
    const preferred = voices.find(
      v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Ava'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    
    if (preferred) {
      this.selectedVoice = preferred;
    }
  }

  public setLanguage(langCode: string) {
    if (this.recognition) {
      const mapping: Record<string, string> = {
        en: 'en-US',
        ta: 'ta-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ml: 'ml-IN',
        kn: 'kn-IN',
        bn: 'bn-IN',
        mr: 'mr-IN'
      };
      this.recognition.lang = mapping[langCode] || 'en-US';
    }
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ) {
    if (!this.isSpeechRecognitionSupported || !this.recognition) {
      onError('Speech recognition is not supported in this browser. Please use text input fallback.');
      return;
    }

    this.speechStartTime = Date.now();
    this.speechWordCount = 0;
    this.pauseCount = 0;
    this.lastSoundTime = Date.now();

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      const current = final || interim;
      const words = current.trim().split(/\s+/).filter(Boolean);
      this.speechWordCount = words.length;

      const now = Date.now();
      if (now - this.lastSoundTime > 1200) {
        this.pauseCount++;
      }
      this.lastSoundTime = now;

      onResult(final || interim, Boolean(final));
    };

    this.recognition.onerror = (event: any) => {
      let msg = 'Speech recognition error';
      if (event.error === 'not-allowed') {
        msg = 'Microphone access denied. You can continue seamlessly using text input.';
      } else if (event.error === 'no-speech') {
        msg = 'No speech was detected. Please try speaking again or type your message.';
      }
      onError(msg);
    };

    this.recognition.onend = () => {
      onEnd();
    };

    try {
      this.recognition.start();
    } catch {
      // If already started, restart
      try {
        this.recognition.stop();
        setTimeout(() => this.recognition.start(), 150);
      } catch (err) {
        onError('Could not start microphone.');
      }
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }

  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isSpeechSynthesisSupported || !this.synthesis) {
        resolve();
        return;
      }

      this.synthesis.cancel(); // Stop any previous speech

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      // Warm, calming cadence
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 0.95;

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        onEnd?.();
        resolve();
      };

      utterance.onerror = () => {
        onEnd?.();
        resolve();
      };

      this.synthesis.speak(utterance);
    });
  }

  public stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Generates a non-clinical signal approximation based on speech duration,
   * pause count, and word pace. Marked strictly as supporting context only.
   */
  public getSpeechSignalAnalysis(overrideTextLength?: number): SpeechSignalAnalysis {
    const elapsedSeconds = Math.max(1, (Date.now() - this.speechStartTime) / 1000);
    const words = overrideTextLength || this.speechWordCount || 10;
    const wpm = (words / elapsedSeconds) * 60;

    let speechRate: 'slow' | 'normal' | 'fast' = 'normal';
    if (wpm < 85) speechRate = 'slow';
    else if (wpm > 155) speechRate = 'fast';

    let pauses: 'frequent' | 'normal' | 'rare' = 'normal';
    if (this.pauseCount >= 3) pauses = 'frequent';
    else if (this.pauseCount === 0) pauses = 'rare';

    return {
      speechRate,
      pauses,
      voiceEnergy: speechRate === 'fast' ? 'elevated' : speechRate === 'slow' ? 'subdued' : 'moderate',
      pitchVariation: 'natural',
      isEstimated: true
    };
  }
}

export const speechService = new SpeechService();
