import { useState, useEffect, useCallback } from 'react';
import type { WordItem, GameState } from '../types';

export function useTypingGame(words: WordItem[]) {
  const [gameState, setGameState] = useState<GameState>({
    currentWordIndex: 0,
    currentCharIndex: 0,
    totalScore: 0,
    combo: 0,
    maxCombo: 0,
    status: 'idle',
    hasMistakeOnCurrentWord: false,
  });

  const [typedInput, setTypedInput] = useState('');
  const [isErrorShake, setIsErrorShake] = useState(false);

  const currentWordRecord = words[gameState.currentWordIndex];
  const targetText = currentWordRecord ? currentWordRecord.en : '';

  const resetGame = useCallback(() => {
    setGameState({
      currentWordIndex: 0,
      currentCharIndex: 0,
      totalScore: 0,
      combo: 0,
      maxCombo: 0,
      status: 'idle',
      hasMistakeOnCurrentWord: false,
    });
    setTypedInput('');
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameState.status === 'finished') return;
      if (!currentWordRecord) return;

      if (gameState.status === 'idle') {
        setGameState((prev) => ({ ...prev, status: 'playing' }));
      }

      // Ignore meta keys
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) {
        if (e.key === 'Backspace') {
          e.preventDefault();
          setTypedInput((prev) => prev.slice(0, -1));
          setGameState((prev) => {
            const newCharIdx = Math.max(0, prev.currentCharIndex - 1);
            const isMatch = targetText.startsWith(typedInput.slice(0, -1));
            return {
              ...prev,
              currentCharIndex: newCharIdx,
              hasMistakeOnCurrentWord: !isMatch && newCharIdx > 0
            };
          });
        } else if (e.key === 'Enter') {
            // Can use Enter to skip or complete if necessary
        }
        return;
      }

      e.preventDefault();

      // Handle Space to submit the word if fully typed correctly
      if (e.key === ' ') {
        if (typedInput === targetText) {
          // Success! Advance to next word
          setGameState((prev) => {
            const newCombo = prev.hasMistakeOnCurrentWord ? 0 : prev.combo + 1;
            const points = prev.hasMistakeOnCurrentWord ? 50 : 100 * (1 + newCombo * 0.1);
            
            const nextIndex = prev.currentWordIndex + 1;
            const nextStatus = nextIndex >= words.length ? 'finished' : 'playing';

            return {
              ...prev,
              currentWordIndex: nextIndex,
              currentCharIndex: 0,
              combo: newCombo,
              maxCombo: Math.max(prev.maxCombo, newCombo),
              totalScore: prev.totalScore + Math.floor(points),
              status: nextStatus,
              hasMistakeOnCurrentWord: false,
            };
          });
          setTypedInput('');
        } else {
          // Pressed space early or with wrong input
          setIsErrorShake(true);
          setTimeout(() => setIsErrorShake(false), 500);
        }
        return;
      }

      // Typed a character
      setTypedInput((prev) => {
        const nextInput = prev + e.key;
        return nextInput;
      });

      setGameState((prev) => {
        const nextInput = typedInput + e.key;
        const isMatch = targetText.startsWith(nextInput);
        
        if (!isMatch) {
            setIsErrorShake(true);
            setTimeout(() => setIsErrorShake(false), 400);
        }

        return {
          ...prev,
          currentCharIndex: prev.currentCharIndex + 1,
          hasMistakeOnCurrentWord: prev.hasMistakeOnCurrentWord || !isMatch
        };
      });
    },
    [gameState, currentWordRecord, targetText, typedInput, words.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getWordStatus = () => {
    if (!typedInput) return 'pending';
    if (typedInput === targetText) return 'correct';
    if (targetText.startsWith(typedInput)) return 'typing';
    return 'error';
  };

  return {
    gameState,
    currentWordRecord,
    typedInput,
    isErrorShake,
    wordStatus: getWordStatus(),
    targetText,
    resetGame
  };
}
