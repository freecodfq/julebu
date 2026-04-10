import { useState, useCallback } from 'react';

export interface CourseProgress {
  maxScore: number;
  maxCombo: number;
  completed: boolean;
  lastIndex?: number;  // Last practiced item index for resume
}

// Simple helper for localStorage
export function useLocalProgress() {
  const [progress, setProgress] = useState<Record<string, CourseProgress>>(() => {
    const saved = localStorage.getItem('julebu_progress');
    return saved ? JSON.parse(saved) : {};
  });

  const updateProgress = (courseId: string, score: number, combo: number, completed: boolean) => {
    setProgress((prev) => {
      const existing = prev[courseId] || { maxScore: 0, maxCombo: 0, completed: false };
      const updated = {
        ...prev,
        [courseId]: {
          ...existing,
          maxScore: Math.max(existing.maxScore, score),
          maxCombo: Math.max(existing.maxCombo, combo),
          completed: existing.completed || completed,
        }
      };
      localStorage.setItem('julebu_progress', JSON.stringify(updated));
      return updated;
    });
  };

  const saveLastIndex = useCallback((courseId: string, index: number) => {
    setProgress((prev) => {
      const existing = prev[courseId] || { maxScore: 0, maxCombo: 0, completed: false };
      const updated = {
        ...prev,
        [courseId]: {
          ...existing,
          lastIndex: index,
        }
      };
      localStorage.setItem('julebu_progress', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getLastIndex = useCallback((courseId: string): number => {
    return progress[courseId]?.lastIndex || 0;
  }, [progress]);

  return { progress, updateProgress, saveLastIndex, getLastIndex };
}
