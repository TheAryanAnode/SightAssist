import { useCallback, useRef, useState } from 'react';
import type { CameraCapturedPicture } from 'expo-camera';
import { detectObjects, DetectionResult, estimateDistance } from '@services/detection';
import { useSpeech } from '@contexts/SpeechContext';

const IMPORTANT_CLASSES = ['car', 'stairs', 'person', 'crosswalk', 'obstacles', 'door'];

export const useLiveDetection = () => {
  const { speak } = useSpeech();
  const lastSpokenRef = useRef<string | null>(null);
  const lastSpokenAtRef = useRef<number>(0);
  const [lastSpokenSummary, setLastSpokenSummary] = useState<string | null>(null);

  const summarizeDetections = (detections: DetectionResult[]): string | null => {
    if (!detections.length) return null;

    const prioritized = detections.sort((a, b) => {
      const aImportant = IMPORTANT_CLASSES.includes(a.label);
      const bImportant = IMPORTANT_CLASSES.includes(b.label);
      if (aImportant === bImportant) {
        return (a.distance ?? Infinity) - (b.distance ?? Infinity);
      }
      return aImportant ? -1 : 1;
    });

    const top = prioritized.slice(0, 3);

    const phrases = top.map((d) => {
      const distance = estimateDistance(d);
      const distPhrase = distance ? `${Math.round(distance)} feet` : 'ahead';
      const side = d.position ?? '';
      return `${d.label} ${distPhrase}${side ? ` ${side}` : ''}`;
    });

    return phrases.join('. ');
  };

  const handleFrame = useCallback(
    async (_frame: unknown | CameraCapturedPicture) => {
      const now = Date.now();
      if (now - lastSpokenAtRef.current < 1500) {
        return;
      }

      const detections = await detectObjects(_frame);
      const summary = summarizeDetections(detections);
      if (!summary) return;

      if (summary === lastSpokenRef.current) return;

      lastSpokenRef.current = summary;
      lastSpokenAtRef.current = now;
      setLastSpokenSummary(summary);
      await speak(summary, { interrupt: true });
    },
    [speak]
  );

  return { handleFrame, lastSpokenSummary };
};

