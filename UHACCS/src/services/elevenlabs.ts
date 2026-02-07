// ElevenLabs text-to-speech client.
// This is a lightweight wrapper that expects an ELEVENLABS_API_KEY to be configured.
// For MVP we return null and let the speech.ts module fall back to Expo Speech.

export const generateSpeech = async (_text: string): Promise<string | null> => {
  // TODO: Implement ElevenLabs streaming TTS.
  // Outline:
  //  - Read API key from env/config
  //  - POST to ElevenLabs /text-to-speech with streaming or standard audio
  //  - Save or stream in-memory audio and return URI
  return null;
};

