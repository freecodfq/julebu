import React, { useState, useEffect, useRef } from 'react';
import type { CourseGroup, WordItem } from '../types';
import { useSoundEffect } from '../hooks/useSoundEffect';

interface Props {
  course: CourseGroup;
  onBack: () => void;
}

export const WordDashboard: React.FC<Props> = ({ course, onBack }) => {
  const [learningWordIdx, setLearningWordIdx] = useState<number | null>(null);
  const { playClick, playError, initAudio } = useSoundEffect();

  return (
    <div className="container" onClick={initAudio}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }} onClick={onBack}>
          ← 返回全部分类
        </button>
        <div style={{ textAlign: 'right' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--julebu-text-main)', letterSpacing: '0.05em' }}>
            {course.title}
          </h2>
          <div className="text-sm text-secondary" style={{ color: 'var(--julebu-text-secondary)' }}>
            总计 {course.words.length} <span style={{ opacity: 0.5 }}>词条</span>
          </div>
        </div>
      </div>

      {/* Grid of Words */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        paddingBottom: '4rem'
      }}>
        {course.words.map((item, idx) => (
          <div 
             key={idx}
             className="card"
             style={{ 
               padding: '1rem', 
               cursor: 'pointer',
               borderColor: 'var(--julebu-border)',
               transition: 'all 0.2s',
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               justifyContent: 'center',
               minHeight: '120px'
             }}
             onClick={() => setLearningWordIdx(idx)}
             onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--julebu-text-secondary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
             onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--julebu-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
             <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--julebu-text-main)', marginBottom: '0.5rem' }}>
               {item.en}
             </div>
             <div style={{ fontSize: '0.8rem', color: 'var(--julebu-text-secondary)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
               {item.zh.split(';')[0]}
             </div>
          </div>
        ))}
      </div>

      {/* Modal Overlay for specific word learning */}
      {learningWordIdx !== null && (
         <WordLearningModal 
           words={course.words}
           initialIdx={learningWordIdx}
           onClose={() => setLearningWordIdx(null)}
           playClick={playClick}
           playError={playError}
         />
      )}
    </div>
  );
};

// ----------------------------------------------------
// Inner Component: The Flashcard & Typing Modal
// ----------------------------------------------------
const WordLearningModal: React.FC<{
  words: WordItem[], 
  initialIdx: number, 
  onClose: () => void,
  playClick: () => void,
  playError: () => void
}> = ({ words, initialIdx, onClose, playClick, playError }) => {
  const [idx, setIdx] = useState(initialIdx);
  const [typedInput, setTypedInput] = useState('');
  const [isShake, setIsShake] = useState(false);
  const voiceCache = useRef<SpeechSynthesisVoice | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const word = words[idx];

  // Voice Setup
  useEffect(() => {
     const setupVoice = () => {
         const vs = window.speechSynthesis.getVoices();
         const premium = vs.find(v => 
            (v.name.includes('Google US English') || v.name.includes('Microsoft Zira') || v.name.includes('Samantha') || v.name.includes('Karen')) 
            && v.lang.startsWith('en')
         );
         const fallback = vs.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en'));
         voiceCache.current = premium || fallback || vs[0];
     };
     setupVoice();
     if (window.speechSynthesis.onvoiceschanged !== undefined) window.speechSynthesis.onvoiceschanged = setupVoice;
     
     return () => {
        window.speechSynthesis.cancel();
     };
  }, []);

  const playAudio = (en: string, zh: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // 1. Clean Chinese text: Remove punctuation like ";", ",", "(", ")", " " etc. to avoid mechanical pauses
    const cleanZh = zh.replace(/[;；,，()（）\s]/g, ' ');

    // 2. Select English Voice
    const enUtterance = new SpeechSynthesisUtterance(en);
    if (voiceCache.current) enUtterance.voice = voiceCache.current;
    enUtterance.lang = 'en-US';
    enUtterance.rate = 1.0;
    enUtterance.pitch = 1.05;

    // 3. Select Premium Chinese Voice
    const zhUtterance = new SpeechSynthesisUtterance(cleanZh);
    const voices = window.speechSynthesis.getVoices();
    
    // Expanded search for natural sounding Chinese voices
    const premiumZh = voices.find(v => 
      (v.name.includes('Xiaoxiao') || v.name.includes('Huihui') || v.name.includes('Yaoyao') || 
       v.name.includes('Kangkang') || v.name.includes('Yunxi') || v.name.includes('Google 普通话') ||
       v.name.includes('Zhiyu') || v.name.includes('Lili')) 
      && (v.lang.includes('zh-CN') || v.lang.includes('zh-HK') || v.lang.includes('zh-TW'))
    );
    
    const fallbackZh = voices.find(v => v.lang.includes('zh-CN') || v.lang.includes('zh-TW') || v.lang.includes('zh'));
    
    if (premiumZh) {
      zhUtterance.voice = premiumZh;
    } else if (fallbackZh) {
      zhUtterance.voice = fallbackZh;
    }
    
    zhUtterance.lang = 'zh-CN';
    zhUtterance.rate = 0.95; // Slightly slower feels more instructional/natural
    zhUtterance.pitch = 1.1; // Slightly higher pitch often sounds less robotic in synthesis

    window.speechSynthesis.speak(enUtterance);
    window.speechSynthesis.speak(zhUtterance);
  };

  // Auto-play on mount or word change
  useEffect(() => {
     setTypedInput('');
     setTimeout(() => playAudio(words[idx].en, words[idx].zh), 50);
  }, [idx, words]);

  // Handle typing mechanics
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape to close
      if (e.key === 'Escape') {
         e.preventDefault();
         onClose();
         return;
      }
      // Arrow keys to navigate
      if (e.key === 'ArrowRight') {
         setIdx(prev => Math.min(words.length - 1, prev + 1));
         return;
      }
      if (e.key === 'ArrowLeft') {
         setIdx(prev => Math.max(0, prev - 1));
         return;
      }

      // CTRL + ' for Audio Playback
      if (e.ctrlKey && e.key === "'") {
         e.preventDefault();
         playAudio(word.en, word.zh);
         return;
      }

      // Enter to check answer
      if (e.key === 'Enter') {
         e.preventDefault();
         if (typedInput.toLowerCase() === word.en.toLowerCase()) {
            playClick();
            // Correct — advance
            setTimeout(() => {
               if (idx < words.length - 1) {
                  setIdx(prev => prev + 1);
               } else {
                  onClose();
               }
            }, 300);
         } else {
            // Wrong — silently reset input
            setTypedInput('');
         }
         return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) {
        if (e.key === 'Backspace') {
          playClick();
          setTypedInput(prev => prev.slice(0, -1));
        }
        return;
      }

      e.preventDefault();

      // Block input if already at target word length
      if (typedInput.length >= word.en.length) {
        return;
      }

      // Allow free typing — no character-level validation
      playClick();
      setTypedInput(prev => prev + e.key);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [typedInput, idx, word.en, onClose, playClick, playError, words.length]);

  // Keep focus for iPad/Mobile
  useEffect(() => {
    const focusRef = () => inputRef.current?.focus();
    focusRef();
    window.addEventListener('touchstart', focusRef);
    return () => window.removeEventListener('touchstart', focusRef);
  }, []);


  return (
    <div style={{
       position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
       background: 'rgba(0, 0, 0, 0.85)',
       backdropFilter: 'blur(8px)',
       zIndex: 100,
       display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }} onClick={() => inputRef.current?.focus()}>
      {/* Hidden Input for iPad Keyboard */}
      <input
        ref={inputRef}
        type="text"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        autoFocus
        autoCapitalize="off"
        value=""
        onChange={(e) => {
          const char = e.target.value.slice(-1);
          if (char) {
             window.dispatchEvent(new KeyboardEvent('keydown', { key: char }));
          }
          e.target.value = '';
        }}
      />
      {/* Background click listener to close */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} onClick={(e) => { e.stopPropagation(); onClose(); }} />
      
      {/* Upper Action Bar */}
      <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', gap: '1rem' }}>
        <button className="btn btn-outline" style={{ borderColor: '#3f3f46', color: '#a1a1aa' }} onClick={onClose}>
          关闭 (ESC)
        </button>
      </div>

      <div className={`card ${isShake ? 'animate-shake' : 'animate-pop'}`} style={{
         width: '100%', maxWidth: '600px',
         background: 'var(--julebu-surface)',
         border: '1px solid #3f3f46',
         boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
         padding: '4rem 2rem',
         display: 'flex', flexDirection: 'column', alignItems: 'center',
         position: 'relative'
      }}>
         
         {/* Counter / Progress */}
         <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', color: 'var(--julebu-text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>
            {idx + 1} / {words.length}
         </div>

         {/* Audio Button */}
         <div 
           style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', cursor: 'pointer', padding: '0.5rem', background: '#27272a', borderRadius: '50%' }}
           onClick={() => playAudio(word.en, word.zh)}
           title="播放语音 (Ctrl+')"
         >
           🔊
         </div>

         {/* The Big Card Text */}
         <div style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '0.025em', color: 'var(--julebu-text-main)', marginBottom: '0.5rem', textAlign: 'center' }}>
            {word.en}
         </div>
         
         <div style={{ fontSize: '1rem', color: 'var(--julebu-purple)', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
            {word.ipa}
         </div>

         <div style={{ fontSize: '1.25rem', color: 'var(--julebu-text-secondary)', marginBottom: '3rem', textAlign: 'center', maxWidth: '80%' }}>
            {word.zh}
         </div>

         {/* The Input Slots */}
         <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {word.en.split('').map((char, i) => {
               const isTyped = i < typedInput.length;
               const isNext = i === typedInput.length;
               return (
                  <div key={i} style={{
                     width: '2.5rem', height: '3.5rem',
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     fontSize: '1.75rem', fontWeight: 700,
                     borderBottom: isNext ? '4px solid var(--julebu-purple)' : '4px solid #3f3f46',
                     color: isTyped ? 'var(--julebu-text-main)' : 'transparent',
                     transition: 'all 0.1s'
                  }}>
                     {isTyped ? typedInput[i] : char}
                  </div>
               );
            })}
         </div>

         <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#52525b', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span><kbd style={{ padding: '2px 4px', background: '#27272a', borderRadius: '4px', border: '1px solid #3f3f46' }}>←</kbd> 上一个</span>
            <span><kbd style={{ padding: '2px 4px', background: '#27272a', borderRadius: '4px', border: '1px solid #3f3f46' }}>Enter</kbd> 确认</span>
            <span><kbd style={{ padding: '2px 4px', background: '#27272a', borderRadius: '4px', border: '1px solid #3f3f46' }}>Ctrl + '</kbd> 听音</span>
            <span><kbd style={{ padding: '2px 4px', background: '#27272a', borderRadius: '4px', border: '1px solid #3f3f46' }}>→</kbd> 下一个</span>
         </div>
      </div>
    </div>
  );
};
