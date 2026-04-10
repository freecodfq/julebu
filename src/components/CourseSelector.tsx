import React, { useState } from 'react';
import { useVoiceSettings } from '../hooks/useVoiceSettings';
import type { CourseGroup } from '../types';

interface Props {
  themeCourses: CourseGroup[];
  dictationCourses: CourseGroup[];
  xingrongCourses: CourseGroup[];
  onSelectCourse: (course: CourseGroup, mode: 'themes' | 'dictation' | 'xingrong') => void;
  progress: Record<string, { maxScore: number; maxCombo: number; completed: boolean; lastIndex?: number }>;
}

export const CourseSelector: React.FC<Props> = ({ themeCourses, dictationCourses, xingrongCourses, onSelectCourse, progress }) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'dictation' | 'xingrong'>('themes');
  const [activeLevel, setActiveLevel] = useState<string>('全部');
  const { voiceGender, toggleVoiceGender } = useVoiceSettings();

  const levels = ['全部', '初中大纲', '高中大纲', '四级精选'];

  const filteredDictation = activeLevel === '全部' 
    ? dictationCourses 
    : dictationCourses.filter(c => c.category === activeLevel);

  const courses = activeTab === 'themes' ? themeCourses : activeTab === 'xingrong' ? xingrongCourses : filteredDictation;

  return (
    <div className="container">
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>
        {/* Voice Toggle */}
        <div 
          onClick={toggleVoiceGender}
          style={{ 
            position: 'absolute', top: '0', right: '0', 
            background: 'var(--julebu-surface)', 
            border: '1px solid var(--julebu-border)',
            borderRadius: '20px', padding: '0.4rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--julebu-purple)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--julebu-border)'; }}
        >
          <span style={{ fontSize: '1.2rem' }}>{voiceGender === 'female' ? '👩' : '👨'}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--julebu-text-secondary)' }}>
            {voiceGender === 'female' ? '美式女声' : '美式男声'}
          </span>
        </div>

        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--julebu-text-main)', marginBottom: '0.5rem', letterSpacing: '-0.05em' }}>
          Julebu <span style={{ color: 'var(--julebu-purple)' }}>Engine</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
          <span style={{ height: '1px', width: '30px', background: 'var(--julebu-border)' }}></span>
          <p className="text-secondary" style={{ fontSize: '0.9rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--julebu-text-secondary)' }}>
            Deep Learning / Minimalism / Offline
          </p>
          <span style={{ height: '1px', width: '30px', background: 'var(--julebu-border)' }}></span>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn`}
          style={{ 
             background: activeTab === 'themes' ? 'var(--julebu-text-main)' : 'transparent',
             color: activeTab === 'themes' ? 'var(--julebu-bg)' : 'var(--julebu-text-secondary)',
             border: activeTab === 'themes' ? 'none' : '1px solid var(--julebu-border)',
             padding: '0.8rem 2.5rem',
             borderRadius: '12px',
             fontWeight: 700,
             transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={() => setActiveTab('themes')}
        >
          主题句式挑战
        </button>
        <button 
          className={`btn`}
          style={{ 
             background: activeTab === 'dictation' ? 'var(--julebu-text-main)' : 'transparent',
             color: activeTab === 'dictation' ? 'var(--julebu-bg)' : 'var(--julebu-text-secondary)',
             border: activeTab === 'dictation' ? 'none' : '1px solid var(--julebu-border)',
             padding: '0.8rem 2.5rem',
             borderRadius: '12px',
             fontWeight: 700,
             transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={() => setActiveTab('dictation')}
        >
          场景单词学习
        </button>
        <button 
          className={`btn`}
          style={{ 
             background: activeTab === 'xingrong' ? 'var(--julebu-text-main)' : 'transparent',
             color: activeTab === 'xingrong' ? 'var(--julebu-bg)' : 'var(--julebu-text-secondary)',
             border: activeTab === 'xingrong' ? 'none' : '1px solid var(--julebu-border)',
             padding: '0.8rem 2.5rem',
             borderRadius: '12px',
             fontWeight: 700,
             transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={() => setActiveTab('xingrong')}
        >
          星荣句式课程
        </button>
      </div>

      {/* Sub-Level Filter (Only for word learning) */}
      {activeTab === 'dictation' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          {levels.map(level => (
            <button
              key={level}
              style={{
                background: activeLevel === level ? '#27272a' : 'transparent',
                color: activeLevel === level ? 'var(--julebu-text-main)' : 'var(--julebu-text-secondary)',
                border: '1px solid',
                borderColor: activeLevel === level ? 'var(--julebu-text-secondary)' : 'var(--julebu-border)',
                padding: '0.4rem 1.2rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setActiveLevel(level)}
            >
              {level}
            </button>
          ))}
        </div>
      )}

      {/* Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        paddingBottom: '5rem'
      }}>
        {courses.map(course => {
          const stats = progress[course.id];
          return (
            <div 
              key={course.id} 
              className="card animate-pop"
              style={{ 
                padding: '1.8rem', 
                cursor: 'pointer', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderColor: 'var(--julebu-border)',
                background: 'var(--julebu-surface)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '180px'
              }}
              onClick={() => onSelectCourse(course, activeTab)}
              onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = 'var(--julebu-purple)';
                  e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(139, 92, 246, 0.15)';
              }}
              onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--julebu-border)';
                  e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--julebu-text-main)' }}>{course.title}</h3>
                  {stats?.completed && <span style={{ color: 'var(--word-correct)', fontSize: '1.2rem' }}>✓</span>}
                </div>
                <p className="text-secondary" style={{ fontSize: '0.875rem' }}>{course.words.length} 个练习项</p>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                {stats ? (
                  <div style={{ fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--julebu-text-secondary)', marginBottom: '0.4rem' }}>
                      <span>当前进度</span>
                      <span>{Math.min(course.words.length, (stats.lastIndex || 0) + 1)} / {course.words.length}</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--julebu-border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        background: 'var(--julebu-purple)', 
                        width: `${((stats.lastIndex || 0) / course.words.length) * 100}%` 
                      }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.7rem', color: '#3f3f46', fontWeight: 700 }}>开始学习 →</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Attribution Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '3rem 0 5rem 0', 
        borderTop: '1px solid var(--julebu-border)', 
        marginTop: '2rem' 
      }}>
        <div style={{ color: 'var(--julebu-text-secondary)', fontSize: '0.85rem' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            星荣句式课程内容参考自开源项目 
            <a 
              href="https://github.com/cuixueshe/earthworm" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--julebu-purple)', textDecoration: 'none', marginLeft: '0.5rem', fontWeight: 700 }}
            >
              Earthworm (地龙)
            </a>
          </p>
          <p>© 2026 Julebu Engine. Built with Minimalist Aesthetics.</p>
        </div>
      </footer>
    </div>
  );
};
