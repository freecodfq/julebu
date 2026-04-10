import { useState, useCallback } from 'react';
import { CourseSelector } from './components/CourseSelector';
import { Playground } from './components/Playground';
import { WordDashboard } from './components/WordDashboard';
import type { CourseGroup } from './types';
import courseData from './assets/courses.json';
import dictationData from './assets/dictation_courses.json';
import xingrongData from './assets/xingrong_courses.json';
import { useLocalProgress } from './hooks/useLocalProgress';

function App() {
  const [activeState, setActiveState] = useState<{
    course: CourseGroup, 
    mode: 'themes' | 'dictation' | 'xingrong',
    startIndex: number
  } | null>(null);
  const { progress, updateProgress, saveLastIndex, getLastIndex } = useLocalProgress();

  const themeCourses: CourseGroup[] = courseData as CourseGroup[];
  const dictationCourses: CourseGroup[] = dictationData as CourseGroup[];
  const xingrongCourses: CourseGroup[] = xingrongData as CourseGroup[];

  const handleSelectCourse = useCallback((course: CourseGroup, mode: 'themes' | 'dictation' | 'xingrong') => {
    const lastIdx = getLastIndex(course.id);
    setActiveState({ course, mode, startIndex: lastIdx });
  }, [getLastIndex]);

  const handleBack = useCallback(() => {
    setActiveState(null);
  }, []);

  const handleProgressUpdate = useCallback((idx: number) => {
    if (activeState?.course.id) {
       saveLastIndex(activeState.course.id, idx);
    }
  }, [activeState?.course.id, saveLastIndex]);

  const handleFinish = useCallback((score: number, combo: number) => {
    if (activeState?.course.id) {
       updateProgress(activeState.course.id, score, combo, true);
    }
  }, [activeState?.course.id, updateProgress]);

  return (
    <div style={{ minHeight: '100vh', width: '100vw', padding: '2rem 0', background: 'var(--julebu-bg)' }}>
      {!activeState ? (
        <CourseSelector 
          themeCourses={themeCourses}
          dictationCourses={dictationCourses}
          xingrongCourses={xingrongCourses}
          progress={progress}
          onSelectCourse={handleSelectCourse} 
        />
      ) : activeState.mode === 'themes' || activeState.mode === 'xingrong' ? (
        <Playground 
          course={activeState.course} 
          onBack={handleBack} 
          onFinish={handleFinish}
          startIndex={activeState.startIndex}
          onProgressUpdate={handleProgressUpdate}
        />
      ) : (
        <WordDashboard 
          course={activeState.course}
          onBack={handleBack}
          startIndex={activeState.startIndex}
          onProgressUpdate={handleProgressUpdate}
        />
      )}
    </div>
  );
}

export default App;
