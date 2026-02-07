import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { speakWithFallback, stopSpeech } from '@services/speech';

type SpeechContextValue = {
  speaking: boolean;
  speak: (text: string, options?: { interrupt?: boolean }) => Promise<void>;
  stop: () => void;
};

const SpeechContext = createContext<SpeechContextValue | undefined>(undefined);

export const SpeechProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [speaking, setSpeaking] = useState(false);
  const speakingRef = useRef(false);

  /**
   * Speak text aloud with optional interrupt.
   *
   * - interrupt: true  → stops any current speech, speaks immediately
   * - interrupt: false → waits for current speech to finish (rare in this app)
   *
   * Returns a Promise that resolves when the utterance finishes.
   */
  const speak = useCallback(async (text: string, options?: { interrupt?: boolean }) => {
    const shouldInterrupt = options?.interrupt ?? false;

    // If already speaking and interrupt requested, stop first
    if (shouldInterrupt && speakingRef.current) {
      stopSpeech();
      // Small yield to let ExpoSpeech.stop() trigger onStopped callback
      await new Promise<void>((r) => setTimeout(r, 50));
    }

    speakingRef.current = true;
    setSpeaking(true);

    try {
      // Haptic feedback on every spoken action
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Actually speak — this now awaits until speech finishes
      await speakWithFallback(text);
    } catch {
      // Speech error — don't crash the app
    } finally {
      speakingRef.current = false;
      setSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    stopSpeech();
    speakingRef.current = false;
    setSpeaking(false);
  }, []);

  return (
    <SpeechContext.Provider value={{ speaking, speak, stop }}>
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeech = (): SpeechContextValue => {
  const ctx = useContext(SpeechContext);
  if (!ctx) {
    throw new Error('useSpeech must be used within SpeechProvider');
  }
  return ctx;
};
