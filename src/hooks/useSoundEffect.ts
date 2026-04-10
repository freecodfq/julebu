import { useCallback, useEffect, useRef } from 'react';

export function useSoundEffect() {
  const typingAudio = useRef<HTMLAudioElement | null>(null);
  const errorAudio = useRef<HTMLAudioElement | null>(null);
  const rightAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    typingAudio.current = new Audio('/julebu/sounds/typing.mp3');
    errorAudio.current = new Audio('/julebu/sounds/error.mp3');
    rightAudio.current = new Audio('/julebu/sounds/right.mp3');
    
    // Pre-load
    typingAudio.current.load();
    errorAudio.current.load();
    rightAudio.current.load();
  }, []);

  const initAudio = () => {
    // No-op for HTML5 Audio as they are pre-loaded in useEffect
  };

  const playClick = useCallback(() => {
    if (typingAudio.current) {
      typingAudio.current.currentTime = 0;
      typingAudio.current.play().catch(() => {});
    }
  }, []);

  const playError = useCallback(() => {
    if (errorAudio.current) {
      errorAudio.current.currentTime = 0;
      errorAudio.current.play().catch(() => {});
    }
  }, []);

  const playRight = useCallback(() => {
    if (rightAudio.current) {
      rightAudio.current.currentTime = 0;
      rightAudio.current.play().catch(() => {});
    }
  }, []);

  return { playClick, playError, playRight, initAudio };
}
