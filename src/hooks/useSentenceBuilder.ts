import { useState, useEffect, useCallback, useRef } from 'react';
import type { WordItem } from '../types';

export interface SentenceGameState {
  currentRecordIndex: number;
  phase: 'word' | 'sentence';
  fullSentenceWords: string[];
  sentenceSteps: string[][];
  sentenceStepIndex: number;
  targetWords: string[];
  completedWords: string[];
  currentWordIndex: number;
  currentCharIndex: number;
  hasMistakeOnCurrentWord: boolean;
  totalScore: number;
  combo: number;
  maxCombo: number;
  status: 'idle' | 'playing' | 'finished';
  showHint: boolean;
}

function generateSentenceSteps(words: string[]): string[][] {
  if (words.length === 0) return [];
  if (words.length === 1) return [[words[0]]];

  const chunks: string[][] = [];
  let i = 0;
  // Intelligent chunking: grab pairs of 2 words (e.g. "to eat", "big park")
  while (i < words.length) {
    chunks.push(words.slice(i, i + 2));
    i += 2;
  }

  const steps: string[][] = [];
  let accumulated: string[] = [];
  
  for (let j = 0; j < chunks.length; j++) {
    const chunk = chunks[j];
    
    if (j === 0) {
       const pronouns = ['i', 'you', 'he', 'she', 'it', 'we', 'they'];
       if (chunk.length === 2 && pronouns.includes(chunk[0].toLowerCase())) {
         steps.push([chunk[0]]); // Smooth intro: "I" 
       }
       steps.push(chunk); // "I like"
       accumulated = [...chunk];
    } else {
       steps.push(chunk); // New chunk: "to eat"
       accumulated = [...accumulated, ...chunk];
       steps.push([...accumulated]); // Combo: "I like to eat"
    }
  }
  
  return steps;
}

export function useSentenceBuilder(
  words: WordItem[], 
  onTypeSuccess?: () => void, 
  onTypeError?: () => void,
  onStepComplete?: () => void,
  startIndex: number = 0,
  onProgressChange?: (currentIndex: number) => void
) {
  const [gameState, setGameState] = useState<SentenceGameState>(() => initGameState(startIndex, 'word'));
  const [typedInput, setTypedInput] = useState('');
  const [isErrorShake, setIsErrorShake] = useState(false);
  const voiceCache = useRef<SpeechSynthesisVoice | null>(null);

  // Initialize premium voice selection
  useEffect(() => {
     const setupVoice = () => {
         const voices = window.speechSynthesis.getVoices();
         // Attempt to pick a premium English voice
         const premium = voices.find(v => 
            (v.name.includes('Google US English') || v.name.includes('Microsoft Zira') || v.name.includes('Samantha') || v.name.includes('Karen')) 
            && v.lang.startsWith('en')
         );
         const fallback = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en'));
         voiceCache.current = premium || fallback || voices[0];
     };
     setupVoice();
     if (window.speechSynthesis.onvoiceschanged !== undefined) {
         window.speechSynthesis.onvoiceschanged = setupVoice;
     }
  }, []);

  function initGameState(index: number, phase: 'word' | 'sentence'): SentenceGameState {
    if (index >= words.length) {
      return {
        currentRecordIndex: index,
        phase: 'word',
        fullSentenceWords: [],
        sentenceSteps: [],
        sentenceStepIndex: 0,
        targetWords: [],
        completedWords: [],
        currentWordIndex: 0,
        currentCharIndex: 0,
        hasMistakeOnCurrentWord: false,
        totalScore: 0,
        combo: 0,
        maxCombo: 0,
        status: 'finished',
        showHint: false
      };
    }
    
    const record = words[index];
    
    let textToType = record.en;
    if (phase === 'sentence' && record.sentenceEn) {
      textToType = record.sentenceEn;
    } else if (phase === 'sentence' && !record.sentenceEn) {
       return initGameState(index + 1, 'word');
    }

    textToType = textToType.replace(/[.,?!;:"]/g, '');

    const fullSentenceWords = textToType.split(' ').filter(w => w);
    
    let steps: string[][] = [];
    if (phase === 'word') {
      steps = [fullSentenceWords]; 
    } else {
      steps = generateSentenceSteps(fullSentenceWords);
    }
    
    return {
      currentRecordIndex: index,
      phase,
      fullSentenceWords,
      sentenceSteps: steps,
      sentenceStepIndex: 0,
      targetWords: steps[0],
      completedWords: [],
      currentWordIndex: 0,
      currentCharIndex: 0,
      hasMistakeOnCurrentWord: false,
      totalScore: 0,
      combo: 0,
      maxCombo: 0,
      status: 'idle',
      showHint: false
    };
  }

  const jumpToIndex = useCallback((index: number) => {
    if (index >= 0 && index < words.length) {
       setGameState(initGameState(index, 'word'));
       setTypedInput('');
    }
  }, [words]);

  const resetGame = useCallback(() => {
    jumpToIndex(startIndex);
  }, [jumpToIndex, startIndex]);

  // Report progress changes for auto-save
  useEffect(() => {
    if (onProgressChange && gameState.currentRecordIndex !== undefined) {
      onProgressChange(gameState.currentRecordIndex);
    }
  }, [gameState.currentRecordIndex, onProgressChange]);

  const currentRecord = words[gameState.currentRecordIndex] as WordItem | undefined;
  const currentWordTarget = gameState.targetWords[gameState.currentWordIndex] || '';

  const playAudio = useCallback((text: string) => {
    if (!text || !window.speechSynthesis) return;
    
    // Safety: only play if component or logic is likely still relevant
    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceCache.current) utterance.voice = voiceCache.current;
    
    utterance.lang = 'en-US';
    utterance.rate = 1.0; 
    utterance.pitch = 1.05;
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopAudio = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Removed problematic useEffect auto-playback that was stepping on transitions.
  // Instead, manual triggers handle all step audios reliably.

  // Robustly dispatch audio whenever we land on a new step and are sitting at word 0
  useEffect(() => {
     if (gameState.status === 'idle' && gameState.currentWordIndex === 0 && gameState.targetWords.length > 0) {
        // Set brief timeout to ensure React DOM flush completes and visual blocks pop first
        const t = setTimeout(() => { playAudio(gameState.targetWords.join(' ')); }, 100);
        return () => clearTimeout(t);
     }
  }, [gameState.currentRecordIndex, gameState.sentenceStepIndex, gameState.phase, gameState.status, gameState.currentWordIndex, playAudio, gameState.targetWords]);

  const processCharacter = useCallback((key: string) => {
      if (gameState.status === 'finished' || !currentRecord) return;

      if (gameState.status === 'idle') {
        setGameState((prev) => ({ ...prev, status: 'playing' }));
      }

      const isLastWordInTarget = gameState.currentWordIndex === gameState.targetWords.length - 1;

      if (key === ' ' || key === 'Enter') {
        const isWordMatch = typedInput.toLowerCase() === currentWordTarget.toLowerCase();

        if (key === ' ' && !isLastWordInTarget) {
           if (!isWordMatch) {
             // Wrong word — silently reset input for this word
             setTypedInput('');
             setGameState(prev => ({
               ...prev,
               currentCharIndex: 0,
               hasMistakeOnCurrentWord: true
             }));
             return;
           }
           onTypeSuccess?.();
           setGameState(prev => {
               let nextCombo = prev.hasMistakeOnCurrentWord ? 0 : prev.combo + 1;
               let points = prev.hasMistakeOnCurrentWord ? 50 : 100 * (1 + nextCombo * 0.1);
               return {
                  ...prev,
                  completedWords: [...prev.completedWords, currentWordTarget],
                  currentWordIndex: prev.currentWordIndex + 1,
                  currentCharIndex: 0,
                  hasMistakeOnCurrentWord: false,
                  combo: nextCombo,
                  maxCombo: Math.max(prev.maxCombo, nextCombo),
                  totalScore: prev.totalScore + Math.floor(points),
                  showHint: false
               };
           });
           setTypedInput('');
           return;
        }
        
        if (key === 'Enter' || (key === ' ' && isLastWordInTarget)) {
           if (!isWordMatch) {
               // Wrong — silently reset input for this word
               setTypedInput('');
               setGameState(prev => ({
                 ...prev,
                 currentCharIndex: 0,
                 hasMistakeOnCurrentWord: true
               }));
               return;
           }

           // If Enter on non-last word, advance to next word (same as Space)
           if (!isLastWordInTarget) {
              onTypeSuccess?.();
              setGameState(prev => {
                  let nextCombo = prev.hasMistakeOnCurrentWord ? 0 : prev.combo + 1;
                  let points = prev.hasMistakeOnCurrentWord ? 50 : 100 * (1 + nextCombo * 0.1);
                  return {
                     ...prev,
                     completedWords: [...prev.completedWords, currentWordTarget],
                     currentWordIndex: prev.currentWordIndex + 1,
                     currentCharIndex: 0,
                     hasMistakeOnCurrentWord: false,
                     combo: nextCombo,
                     maxCombo: Math.max(prev.maxCombo, nextCombo),
                     totalScore: prev.totalScore + Math.floor(points),
                     showHint: false
                  };
              });
              setTypedInput('');
              return;
           }

           onStepComplete?.(); 
           setTypedInput('');
           setGameState((prev) => {
              let nextCombo = prev.hasMistakeOnCurrentWord ? 0 : prev.combo + 1;
              let points = prev.hasMistakeOnCurrentWord ? 50 : 100 * (1 + nextCombo * 0.1);
              
              if (prev.sentenceStepIndex < prev.sentenceSteps.length - 1) {
                const nextStep = prev.sentenceStepIndex + 1;
                return {
                  ...prev,
                  sentenceStepIndex: nextStep,
                  targetWords: prev.sentenceSteps[nextStep],
                  completedWords: [],
                  currentWordIndex: 0,
                  currentCharIndex: 0,
                  status: 'idle',
                  combo: nextCombo,
                  maxCombo: Math.max(prev.maxCombo, nextCombo),
                  totalScore: prev.totalScore + Math.floor(points),
                  showHint: false
                };
              } else {
                if (prev.phase === 'sentence') {
                  const nextRecordIdx = prev.currentRecordIndex + 1;
                  if (nextRecordIdx >= words.length) {
                    return { ...prev, status: 'finished', totalScore: prev.totalScore + Math.floor(points), showHint: false };
                  }
                  const nextState = initGameState(nextRecordIdx, 'word');
                  nextState.combo = nextCombo;
                  nextState.maxCombo = Math.max(prev.maxCombo, nextCombo);
                  nextState.totalScore = prev.totalScore + Math.floor(points);
                  return nextState;
                } else {
                  const hasSentence = !!currentRecord.sentenceEn;
                  if (hasSentence) {
                    const nextState = initGameState(prev.currentRecordIndex, 'sentence');
                    nextState.combo = nextCombo;
                    nextState.maxCombo = Math.max(prev.maxCombo, nextCombo);
                    nextState.totalScore = prev.totalScore + Math.floor(points);
                    return nextState;
                  } else {
                    const nextRecordIdx = prev.currentRecordIndex + 1;
                    if (nextRecordIdx >= words.length) {
                       return { ...prev, status: 'finished', totalScore: prev.totalScore + Math.floor(points), showHint: false };
                    }
                    const nextState = initGameState(nextRecordIdx, 'word');
                    nextState.combo = nextCombo;
                    nextState.maxCombo = Math.max(prev.maxCombo, nextCombo);
                    nextState.totalScore = prev.totalScore + Math.floor(points);
                    return nextState;
                  }
                }
              }
           });
           return;
        }
        return;
      }

      // Block input if already at target word length
      if (typedInput.length >= currentWordTarget.length) {
        return;
      }

      onTypeSuccess?.();
      setTypedInput((prev) => prev + key);
      setGameState((prev) => {
        return {
          ...prev,
          currentCharIndex: prev.currentCharIndex + 1,
        };
      });
  }, [gameState, currentRecord, currentWordTarget, typedInput, words, onTypeSuccess, onTypeError, onStepComplete]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameState.status === 'finished') return;
      if (!currentRecord) return;

      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) {
        if (e.key === 'Backspace') {
          e.preventDefault();
          onTypeSuccess?.();
          setTypedInput((prev) => prev.slice(0, -1));
          setGameState((prev) => {
            const newCharIdx = Math.max(0, prev.currentCharIndex - 1);
            const isMatch = currentWordTarget.toLowerCase().startsWith(typedInput.slice(0, -1).toLowerCase());
            return {
              ...prev,
              currentCharIndex: newCharIdx,
              hasMistakeOnCurrentWord: !isMatch && newCharIdx > 0
            };
          });
        } else if (e.key === "'" && e.ctrlKey) {
            e.preventDefault();
            playAudio(gameState.targetWords.join(' '));
        } else if (e.key === ';' && e.ctrlKey) {
            e.preventDefault();
            setGameState(prev => ({ ...prev, showHint: !prev.showHint }));
        }
        
        if (e.key !== 'Enter') return;
        e.preventDefault();
        processCharacter('Enter');
        return;
      }

      e.preventDefault();
      processCharacter(e.key);
    },
    [gameState, currentRecord, currentWordTarget, typedInput, playAudio, onTypeSuccess, processCharacter]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getWordStatus = () => {
    if (!typedInput) return 'pending';
    if (typedInput.toLowerCase() === currentWordTarget.toLowerCase()) return 'correct';
    if (currentWordTarget.toLowerCase().startsWith(typedInput.toLowerCase())) return 'typing';
    return 'error';
  };

  return {
    gameState,
    currentRecord,
    currentWordTarget,
    typedInput,
    isErrorShake,
    wordStatus: getWordStatus(),
    playCurrentAudio: () => playAudio(gameState.targetWords.join(' ')),
    stopAudio,
    toggleHint: () => setGameState(prev => ({ ...prev, showHint: !prev.showHint })),
    resetGame,
    handleInputChar: processCharacter,
    jumpToIndex
  };
}
