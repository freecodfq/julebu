export interface WordItem {
  en: string;
  zh: string;
  ipa?: string;
  sentenceEn?: string;
  sentenceZh?: string;
}

export interface CourseGroup {
  id: string;
  category: string;
  title: string;
  words: WordItem[];
}

export type WordStatus = 'pending' | 'typing' | 'correct' | 'error';

export interface GameState {
  currentWordIndex: number;
  currentCharIndex: number;
  totalScore: number;
  combo: number;
  maxCombo: number;
  status: 'idle' | 'playing' | 'finished';
  hasMistakeOnCurrentWord: boolean;
}
