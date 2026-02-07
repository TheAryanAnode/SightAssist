import * as ExpoSpeech from 'expo-speech';
import { generateSpeech } from './elevenlabs';

// Maximum time to wait for speech to finish before resolving anyway
const SPEECH_TIMEOUT_MS = 10000;

/**
 * Speak text aloud. Returns a Promise that resolves when speech finishes
 * (or is interrupted, or times out after 10s as a safety net).
 */
export const speakWithFallback = async (text: string): Promise<void> => {
  // Try ElevenLabs first
  try {
    const uri = await generateSpeech(text);
    if (uri) {
      // TODO: play audio from URI via expo-av when ElevenLabs is implemented.
      // For now, fall through to Expo Speech.
    }
  } catch {
    // ElevenLabs failed, fall through to Expo Speech
  }

  // Use Expo Speech — wrap in a Promise with a timeout safety net
  return new Promise<void>((resolve) => {
    let resolved = false;
    const done = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };

    // Safety timeout — if callbacks never fire, resolve anyway
    const timer = setTimeout(done, SPEECH_TIMEOUT_MS);

    ExpoSpeech.speak(text, {
      rate: 0.95,
      pitch: 1.0,
      onDone: () => { clearTimeout(timer); done(); },
      onStopped: () => { clearTimeout(timer); done(); },
      onError: () => { clearTimeout(timer); done(); },
    });
  });
};

/**
 * Immediately stop any speech in progress.
 */
export const stopSpeech = () => {
  ExpoSpeech.stop();
};

/**
 * Check if the speech engine is currently speaking.
 */
export const isSpeaking = async (): Promise<boolean> => {
  return ExpoSpeech.isSpeakingAsync();
};
