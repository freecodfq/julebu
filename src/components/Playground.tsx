import React, { useEffect, useRef, useState } from 'react';
import { useSentenceBuilder } from '../hooks/useSentenceBuilder';
import { useSoundEffect } from '../hooks/useSoundEffect';
import type { CourseGroup } from '../types';

interface Props {
  course: CourseGroup;
  onBack: () => void;
  onFinish: (score: number, combo: number) => void;
  startIndex?: number;
  onProgressUpdate?: (index: number) => void;
}

const getColorForWord = (word: string) => {
  const w = word.toLowerCase();
  const pronouns = ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'their', 'our'];
  const verbs = ['like', 'eat', 'feel', 'am', 'is', 'are', 'was', 'were', 'go', 'play', 'do', 'does', 'have', 'has'];
  
  if (pronouns.includes(w)) return '#f59e0b';
  if (verbs.includes(w)) return '#ec4899';
  return '#0ea5e9';
};

const getTranslationForWord = (word: string, record: any) => {
   const w = word.toLowerCase();
   // Always correctly match the master record word (handling basic plurals/verb forms)
   if (w === record.en.toLowerCase() || w === record.en.toLowerCase() + 's' || w === record.en.toLowerCase() + 'es' || w === record.en.toLowerCase() + 'd' || w === record.en.toLowerCase() + 'ed' || w === record.en.toLowerCase() + 'ing') {
       return record.zh;
   }
   
   // High-coverage offline dictionary for structural words
   const dict: Record<string, string> = {
      'i': '我', 'you': '你', 'he': '他', 'she': '她', 'it': '它', 'we': '我们', 'they': '他们',
      'my': '我的', 'your': '你的', 'his': '他的', 'her': '她的', 'our': '我们的', 'their': '他们的',
      'me': '我(宾格)', 'him': '他', 'them': '他们', 'us': '我们',
      'this': '这个', 'that': '那个', 'these': '这些', 'those': '那些',
      'am': '是', 'is': '是', 'are': '是', 'was': '是', 'were': '是', 'be': '是', 'been': '是',
      'do': '做', 'does': '做', 'did': '做', 'done': '做', 'doing': '做',
      'have': '有', 'has': '有', 'had': '有',
      'can': '能', 'could': '能', 'will': '将', 'would': '将', 'shall': '将', 'should': '应该', 'may': '可以', 'might': '可能', 'must': '必须',
      'a': '一个', 'an': '一个', 'the': '这', 'some': '一些', 'any': '任何',
      'to': '去/到', 'in': '在...里', 'on': '在...上', 'at': '在', 'with': '和', 'about': '关于', 'for': '因为/为了', 'of': '的', 'from': '来自', 'by': '被/由',
      'and': '和', 'but': '但是', 'or': '或者', 'so': '所以', 'because': '因为',
      'very': '非常', 'too': '太', 'really': '真的', 'just': '只/刚刚', 'always': '总是', 'never': '从不', 'often': '经常', 'sometimes': '有时',
      'not': '不', 'no': '不', 'yes': '是的',
      'what': '什么', 'who': '谁', 'where': '哪里', 'when': '何时', 'why': '为什么', 'how': '如何',
      'before': '在...之前', 'after': '在...之后', 'then': '然后', 'now': '现在',
      'like': '喜欢', 'eat': '吃', 'drink': '喝', 'play': '玩', 'go': '去', 'want': '想要', 'need': '需要', 'make': '制作', 'take': '拿取', 'see': '看见', 'look': '看',
      'good': '好', 'bad': '坏', 'big': '大', 'small': '小', 'new': '新', 'old': '老', 'high': '高', 'low': '低', 'long': '长', 'short': '短',
      'one': '一', 'two': '二', 'three': '三', 'four': '四', 'five': '五',
      'time': '时间', 'day': '天', 'year': '年', 'people': '人们', 'way': '方式', 'thing': '事物', 'man': '男人', 'woman': '女人', 'boy': '男孩', 'girl': '女孩',
      'exam': '考试', 'exams': '考试', 'nervous': '紧张', 'happy': '快乐', 'sad': '悲伤', 'angry': '生气',
      'today': '今天', 'tomorrow': '明天', 'yesterday': '昨天', 'morning': '早晨', 'afternoon': '下午', 'evening': '晚上', 'night': '夜晚', 'fresh': '新鲜的', 'apples': '苹果', 'apple': '苹果'
   };
   
   return dict[w] || '';
};

export const Playground: React.FC<Props> = ({ 
  course, 
  onBack, 
  onFinish, 
  startIndex, 
  onProgressUpdate 
}) => {
  const [showSectionSelector, setShowSectionSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { playClick, playError, playRight, initAudio } = useSoundEffect();
  
  const handleStepComplete = () => {
     playRight();
  };

  const {
    gameState,
    currentRecord,
    typedInput,
    playCurrentAudio,
    stopAudio,
    toggleHint,
    resetGame,
    handleInputChar,
    jumpToIndex
  } = useSentenceBuilder(
    course.words, 
    playClick, 
    playError, 
    handleStepComplete, 
    startIndex,
    onProgressUpdate
  );

  const inputRef = useRef<HTMLInputElement>(null);

  // Audio Cleanup on Exiting
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  // Keep input focused on iPad/Mobile
  useEffect(() => {
    const focusRef = () => inputRef.current?.focus();
    focusRef();
    window.addEventListener('touchstart', focusRef);
    return () => window.removeEventListener('touchstart', focusRef);
  }, []);

  if (gameState.status === 'finished') {
    window.setTimeout(() => onFinish(gameState.totalScore, gameState.maxCombo), 0);
    return (
      <div className="container">
        <div className="card text-center animate-pop">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--julebu-purple)', marginBottom: '1rem' }}>
            🎉 学习完成！
          </h2>
          <div style={{ fontSize: '4rem', fontWeight: '900', margin: '2rem 0' }}>
            {gameState.totalScore} <span style={{ fontSize: '1rem', color: 'var(--julebu-text-secondary)' }}>分</span>
          </div>
          <p style={{ marginBottom: '2rem', color: 'var(--julebu-text-secondary)' }}>
            最大连击数: <strong>{gameState.maxCombo}</strong>
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={onBack}>返回课程列表</button>
            <button className="btn btn-primary" onClick={resetGame}>再练一遍</button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRecord) return null;

    const renderBurgerBlock = (word: string, state: 0 | 1 | 2, blockKey: number) => {
    const color = getColorForWord(word);
    
    // Dynamic Translation Lookup!
    const translateWord = (targetWord: string) => {
        // 1. Try the structural/hardcoded offline dictionary + exact record match first
        let res = getTranslationForWord(targetWord, currentRecord);
        if (res) return res;

        // 2. Fall back to scanning the entire current lesson's vocabulary!
        const clean = targetWord.toLowerCase().replace(/[^a-z]/g, '');
        const found = course.words.find(cw => {
            const cwEn = cw.en.toLowerCase();
            return cwEn === clean || cwEn + 's' === clean || cwEn + 'd' === clean || cwEn + 'ed' === clean || cwEn + 'ing' === clean;
        });

        if (found) return found.zh;
        return ''; // If truly unknown
    };
    
    const translatedText = translateWord(word);

     if (state === 2) { // Completed
        return (
          <div key={blockKey} className="flex flex-col items-center justify-center min-w-[3rem]" style={{ margin: '0 0.25rem' }}>
              <div style={{ color, fontSize: '2.5rem', fontWeight: 700, padding: '0.2rem 0' }}>
                {word}
              </div>
              <div className="text-xs text-gray-500 font-medium tracking-wide" style={{ minHeight: '1rem', marginTop: '0.2rem' }}>
                {translatedText}
              </div>
          </div>
        );
     }
    
    // Active or Pending slot
    const chars = word.split('').map((char, index) => {
      let charColor = 'transparent';
      let backgroundColor = 'transparent';
      let textDecoration = 'none';

      let displayChar = gameState.showHint ? char : '_';

      if (state === 1 && index < typedInput.length) { // Active typed characters
        displayChar = typedInput[index];
        const isMatch = typedInput[index].toLowerCase() === char.toLowerCase();
        if (isMatch) {
          charColor = color;
          displayChar = char;
        } else {
          charColor = 'var(--word-error)';
          textDecoration = 'line-through';
          backgroundColor = '#fee2e2';
        }
      } else {
        if (gameState.showHint) charColor = 'var(--julebu-text-secondary)';
        else charColor = 'var(--julebu-border)';
      }

      return (
        <span
          key={index}
          style={{
            color: charColor,
            backgroundColor,
            textDecoration,
            margin: '0 2px',
            display: 'inline-block',
            textAlign: 'center',
            transition: 'color 0.2s',
          }}
        >
          {displayChar}
        </span>
      );
    });

    const isCurrentActive = state === 1;

     return (
        <div key={blockKey} className="flex flex-col items-center justify-center min-w-[3rem]" style={{ margin: '0 0.25rem' }}>
              <div 
                style={{ 
                  fontSize: '2.5rem', 
                 fontWeight: 700, 
                 padding: '0.2rem 0',
                 borderBottom: isCurrentActive ? '4px solid var(--julebu-purple)' : '4px solid transparent', 
                 position: 'relative',
                 opacity: isCurrentActive ? 1 : 0.6
               }}
             >
               {chars}
             </div>
             <div className="text-xs text-gray-500 font-medium tracking-wide" style={{ minHeight: '1rem', marginTop: '0.2rem' }}>
               {translatedText}
             </div>
       </div>
    );
  };

  return (
    <div className="container" onClick={() => { initAudio(); inputRef.current?.focus(); }}>
      {/* Hidden Input for iPad Virtual Keyboard */}
      <input
        ref={inputRef}
        type="text"
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          height: 0,
          width: 0,
          border: 'none',
          padding: 0
        }}
        autoFocus
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        value=""
        onChange={(e) => {
          const char = e.target.value.slice(-1);
          if (char) handleInputChar(char);
          e.target.value = ''; // Clear immediately
        }}
      />
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }} onClick={onBack}>
          ← 退出练习
        </button>
      </div>

      <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--julebu-border)', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            background: 'var(--word-correct)', 
            width: `${((gameState.currentRecordIndex) / course.words.length) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div 
            className="text-secondary font-medium tracking-wide" 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="点击选择小节"
            onClick={() => setShowSectionSelector(true)}
          >
            {gameState.currentRecordIndex + 1} / {course.words.length} 
            <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>[选择]</span>
          </div>
          <div className="font-bold tracking-wide" style={{ color: 'var(--julebu-purple)' }}>
            Score: {gameState.totalScore}
          </div>
        </div>

        {gameState.combo > 1 && (
          <div className="combo-text animate-pop" key={gameState.combo}>
            {gameState.combo >= 5 ? 'Perfect!' : 'Great!'} x{gameState.combo}
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center', paddingTop: '1rem' }}>
          
          <div className="text-2xl font-bold tracking-wider" style={{ marginBottom: '2rem', color: 'var(--julebu-text-main)' }}>
            {gameState.phase === 'sentence' ? currentRecord.sentenceZh || currentRecord.zh : currentRecord.zh}
          </div>

          {gameState.showHint && (
            <div className="animate-pop" style={{ 
              position: 'absolute', top: '4rem', background: '#fff', border: '1px solid #e2e8f0', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '0.5rem 2rem', borderRadius: '8px', zIndex: 10 
            }}>
               <span className="text-sm font-medium text-slate-500 tracking-widest">{gameState.targetWords.join(' ')}</span>
            </div>
          )}

          {/* Central Phonetic IPA */}
          <div className="text-sm text-gray-400 font-mono tracking-widest" style={{ marginBottom: '1.5rem', minHeight: '1.2rem' }}>
             {currentRecord.ipa || ''}
          </div>

          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '0.5rem',
            padding: '1rem'
          }}>
            {/* Map over the FULL sequence of target words instead of just completed + current */}
            {gameState.targetWords.map((word, idx) => {
                if (idx < gameState.currentWordIndex) {
                    return renderBurgerBlock(word, 2, idx); // Completed
                } else if (idx === gameState.currentWordIndex) {
                    return renderBurgerBlock(word, 1, idx); // Active
                } else {
                    return renderBurgerBlock(word, 0, idx); // Pending (Blanked)
                }
            })}
          </div>

          <div className="text-secondary text-sm" style={{ marginTop: '2rem', opacity: 0.7 }}>
            {'输入英文后按 Enter 或 Space 确认'}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '3rem', borderTop: '1px solid var(--julebu-border)', paddingTop: '1.5rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={playCurrentAudio}>
             <kbd style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Ctrl + '</kbd>
             <span className="text-secondary text-sm font-medium hover:text-purple">播放发音</span>
           </div>
           
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={toggleHint}>
             <kbd style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Ctrl + ;</kbd>
             <span className="text-secondary text-sm font-medium hover:text-purple">显示答案</span>
           </div>
           
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <kbd style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Space</kbd> / 
             <kbd style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Enter</kbd>
             <span className="text-secondary text-sm font-medium ml-1">确认</span>
           </div>
        </div>

      </div>

      {/* Section Selector Modal */}
      {showSectionSelector && (
        <div className="modal-overlay" onClick={() => setShowSectionSelector(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>选择学习小节</h2>
                <button 
                  className="btn btn-outline" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => setShowSectionSelector(false)}
                >
                  关闭
                </button>
              </div>
              <div className="search-container">
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="搜索英文或中文关键词..." 
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="section-list">
              {course.words
                .map((word, index) => ({ word, index }))
                .filter(item => 
                  item.word.en.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  item.word.zh.includes(searchTerm) ||
                  (item.index + 1).toString() === searchTerm
                )
                .map(({ word, index }) => (
                  <div 
                    key={index} 
                    className={`section-item ${index === gameState.currentRecordIndex ? 'active' : ''}`}
                    onClick={() => {
                      jumpToIndex(index);
                      setShowSectionSelector(false);
                      setSearchTerm('');
                    }}
                  >
                    <div className="section-index">#{index + 1}</div>
                    <div className="section-info">
                      <div className="section-en">{word.sentenceEn || word.en}</div>
                      <div className="section-zh">{word.sentenceZh || word.zh}</div>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="modal-footer">
              <div style={{ fontSize: '0.8rem', color: 'var(--julebu-text-secondary)' }}>
                共 {course.words.length} 个项目
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
