import { useCallback, useEffect, useRef } from 'react';

// Shared AudioContext to avoid multiple instances issues
const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
const globalCtx = new AudioContextClass();

export function useSoundEffect() {
  const buffers = useRef<Record<string, AudioBuffer>>({});

  useEffect(() => {
    const loadSound = async (name: string, url: string) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await globalCtx.decodeAudioData(arrayBuffer);
        buffers.current[name] = audioBuffer;
      } catch (e) {
        console.error(`Failed to load sound: ${name}`, e);
      }
    };

    loadSound('typing', '/julebu/sounds/typing.mp3');
    loadSound('error', '/julebu/sounds/error.mp3');
    loadSound('right', '/julebu/sounds/right.mp3');
  }, []);

  const initAudio = useCallback(async () => {
    if (globalCtx.state === 'suspended') {
      await globalCtx.resume();
    }
  }, []);

  const playBufferSource = useCallback((name: string) => {
    const buffer = buffers.current[name];
    if (!buffer) return;

    // Ensure context is running (especially for mobile/iPad Safari)
    if (globalCtx.state === 'suspended') {
       globalCtx.resume();
    }

    const source = globalCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(globalCtx.destination);
    source.start(0);
  }, []);

  const playClick = useCallback(() => {
    playBufferSource('typing');
  }, [playBufferSource]);

  const playError = useCallback(() => {
    playBufferSource('error');
  }, [playBufferSource]);

  const playRight = useCallback(() => {
    playBufferSource('right');
  }, [playBufferSource]);

  return { playClick, playError, playRight, initAudio };
}
