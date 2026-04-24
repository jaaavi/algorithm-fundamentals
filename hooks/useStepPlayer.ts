'use client';

import { useState, useEffect, useRef } from 'react';

const SPEED_MS: Record<string, number> = {
  '0.5×': 2400,
  '1×':   1200,
  '1.5×':  800,
  '2×':    500,
};

export const SPEED_KEYS = Object.keys(SPEED_MS);

export function useStepPlayer(totalSteps: number) {
  const [step, setStep]         = useState(0);
  const [playing, setPlaying]   = useState(false);
  const [speedKey, setSpeedKey] = useState('1×');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!playing) return;

    timerRef.current = setInterval(() => {
      setStep(s => {
        if (s >= totalSteps - 1) { setPlaying(false); return s; }
        return s + 1;
      });
    }, SPEED_MS[speedKey]);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, speedKey, totalSteps]);

  function prev() { setPlaying(false); setStep(s => Math.max(0, s - 1)); }
  function next() { setPlaying(false); setStep(s => Math.min(totalSteps - 1, s + 1)); }
  function reset() { setPlaying(false); setStep(0); }
  function togglePlay() {
    if (step >= totalSteps - 1) { setStep(0); setPlaying(true); }
    else setPlaying(v => !v);
  }

  return { step, playing, speedKey, setSpeedKey, prev, next, reset, togglePlay };
}
