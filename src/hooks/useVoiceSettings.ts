import { useState, useEffect, useCallback, useRef } from 'react';

export type VoiceGender = 'female' | 'male';

export function useVoiceSettings() {
  const [voiceGender, setVoiceGender] = useState<VoiceGender>(() => {
    return (localStorage.getItem('julebu_voice_gender') as VoiceGender) || 'female';
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const updateVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const toggleVoiceGender = useCallback(() => {
    setVoiceGender(prev => {
      const next = prev === 'female' ? 'male' : 'female';
      localStorage.setItem('julebu_voice_gender', next);
      return next;
    });
  }, []);

  const getBestVoice = useCallback((gender: VoiceGender): SpeechSynthesisVoice | null => {
    const voices = availableVoices.filter(v => v.lang.startsWith('en-US') || v.lang.startsWith('en'));
    
    const femaleKeywords = ['Google US English', 'Samantha', 'Zira', 'Ava', 'Allison', 'Karen'];
    const maleKeywords = ['Google US English Male', 'David', 'Tom', 'Nathan', 'Alex', 'Daniel'];
    
    const keywords = gender === 'female' ? femaleKeywords : maleKeywords;
    
    // 1. Try exact matches from keyword list in order
    for (const kw of keywords) {
      const found = voices.find(v => v.name.includes(kw));
      if (found) return found;
    }

    // 2. Fallback: browser gender detection if available (rare in standard API)
    // 3. Last resort: first available English voice
    return voices[0] || null;
  }, [availableVoices]);

  return {
    voiceGender,
    toggleVoiceGender,
    getBestVoice: () => getBestVoice(voiceGender)
  };
}
