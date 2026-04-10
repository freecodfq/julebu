import { useState, useEffect, useCallback } from 'react';

export type VoiceGender = 'female' | 'male';

export function useVoiceSettings() {
  const [voiceGender, setVoiceGender] = useState<VoiceGender>(() => {
    return (localStorage.getItem('julebu_voice_gender') as VoiceGender) || 'female';
  });

  const [voiceRate, setVoiceRate] = useState<number>(() => {
    const saved = localStorage.getItem('julebu_voice_rate');
    return saved ? parseFloat(saved) : 0.8; // Default to 0.8 for beginners
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

  const updateVoiceRate = useCallback((rate: number) => {
    setVoiceRate(rate);
    localStorage.setItem('julebu_voice_rate', rate.toString());
  }, []);

  const getBestVoice = useCallback((gender: VoiceGender): SpeechSynthesisVoice | null => {
    const voices = availableVoices.filter(v => v.lang.startsWith('en-US') || v.lang.startsWith('en'));
    
    // Windows Default: David (Male) / Zira (Female)
    // Mac/iOS Default: Alex, Daniel (Male) / Samantha, Ava (Female)
    const femaleKeywords = ['Zira', 'Samantha', 'Ava', 'Google US English', 'Allison', 'Ava'];
    const maleKeywords = ['David', 'Alex', 'Daniel', 'Tom', 'Google US English Male', 'Nathan'];
    
    const keywords = gender === 'female' ? femaleKeywords : maleKeywords;
    
    // 1. Try exact matches from keyword list
    for (const kw of keywords) {
      const found = voices.find(v => v.name.includes(kw));
      if (found) return found;
    }

    // 2. Fallback: Check if name includes "Male" or "Female" explicitly
    const genderRegex = gender === 'male' ? /male/i : /female/i;
    const regexFound = voices.find(v => genderRegex.test(v.name));
    if (regexFound) return regexFound;

    // 3. Last resort: first available English voice
    return voices[0] || null;
  }, [availableVoices]);

  return {
    voiceGender,
    voiceRate,
    toggleVoiceGender,
    updateVoiceRate,
    getBestVoice: () => getBestVoice(voiceGender)
  };
}
