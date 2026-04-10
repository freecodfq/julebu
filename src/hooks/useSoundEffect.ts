import { useCallback, useRef } from 'react';

export function useSoundEffect() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playClick = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    // Create a "Swish" / "Chua" sound using White Noise
    // 1. Create empty buffer for 0.05 seconds of noise
    const bufferSize = ctx.sampleRate * 0.05; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // 2. Fill with white noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // 3. Filter the noise to sound like paper/brush (bandpass)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 3000; // focusing on mid-high frequency for friction
    bandpass.Q.value = 0.5;

    // 4. Shape the volume (envelope)
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    noiseSource.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(ctx.currentTime);
  }, []);

  const playError = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    // Sharp electronic thud for error
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }, []);

  return { playClick, playError, initAudio };
}
