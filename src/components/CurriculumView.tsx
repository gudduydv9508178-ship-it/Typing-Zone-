import React, { useState } from 'react';
import { LESSONS } from '../data/lessons';
import { Lesson, LessonProgress, UserProfile } from '../types';
import { Star, Play } from 'lucide-react';

interface CurriculumViewProps {
  progress: Record<number, LessonProgress>;
  profile: UserProfile;
  onSelectLesson: (lesson: Lesson) => void;
  onOpenNameModal: () => void;
  onStartPlacementTest?: () => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  progress,
  profile,
  onSelectLesson,
  onOpenNameModal,
  onStartPlacementTest,
}) => {
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('All');

  // Groups of lessons matching the screenshots
  const sections = [
    'All',
    'Get started',
    'Top Row',
    'Bottom Row',
    'Basic Level 1',
  ];

  const totalCompleted = Object.values(progress).filter((p) => p.completed).length;
  const totalStars = Object.values(progress).reduce((acc, curr) => acc + (curr.stars || 0), 0);
  const totalScore = Object.values(progress).reduce(
    (acc, curr) => acc + (curr.bestWpm ? curr.bestWpm * 10 : 0),
    0
  );
  const progressPercent = Math.min(100, Math.round((totalCompleted / LESSONS.length) * 100));

  // Determine next unlocked lesson
  const nextLessonIndex = LESSONS.findIndex((l) => !progress[l.id]?.completed);
  const nextLesson = nextLessonIndex !== -1 ? LESSONS[nextLessonIndex] : LESSONS[0];

  // All 100 lessons are completely unlocked and playable anytime without restrictions
  const isUnlocked = (_index: number) => true;

  // Group lessons by section for structured course map
  const groupedSections: { sectionName: string; lessons: Lesson[] }[] = [];
  ['Get started', 'Top Row', 'Bottom Row', 'Basic Level 1'].forEach((sec) => {
    const list = LESSONS.filter((l) => l.section === sec);
    if (list.length > 0) {
      groupedSections.push({ sectionName: sec, lessons: list });
    }
  });

  // Filtered view if user clicks a section tab
  const displaySections = activeSectionFilter === 'All'
    ? groupedSections
    : groupedSections.filter((g) => g.sectionName === activeSectionFilter);

  // Custom Icon Renderer matching the screenshots with precision
  const renderCardIcon = (lesson: Lesson) => {
    const type = lesson.type || 'practice';

    switch (type) {
      case 'box':
        return (
          <div className="flex flex-col items-center justify-center">
            {/* Box package with letters above */}
            <span className="font-mono font-bold text-xs sm:text-sm text-slate-700 -mb-0.5 tracking-tight">
              {lesson.boxKeys || 'k'}
            </span>
            <svg className="w-8 h-8 text-slate-400" viewBox="0 0 32 32" fill="none" stroke="currentColor">
              {/* Cardboard box with open flaps */}
              <path d="M 6 12 L 16 7 L 26 12 L 16 17 Z" strokeWidth="1.5" fill="#f8fafc" />
              <path d="M 6 12 L 6 23 L 16 28 L 16 17 Z" strokeWidth="1.5" fill="#f1f5f9" />
              <path d="M 26 12 L 26 23 L 16 28 L 16 17 Z" strokeWidth="1.5" fill="#e2e8f0" />
              {/* Open flaps */}
              <path d="M 6 12 L 2 8" strokeWidth="1.5" />
              <path d="M 26 12 L 30 8" strokeWidth="1.5" />
            </svg>
          </div>
        );

      case 'review':
        return (
          <svg className="w-8 h-8 text-slate-500" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="14" cy="14" r="8" />
            <line x1="20" y1="20" x2="28" y2="28" strokeLinecap="round" />
          </svg>
        );

      case 'practice':
        return (
          <svg className="w-8 h-8 text-slate-500" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="16" cy="17" r="10" />
            <line x1="16" y1="3" x2="16" y2="7" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="3" x2="18" y2="3" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="17" x2="16" y2="12" strokeLinecap="round" />
            <line x1="16" y1="17" x2="20" y2="17" strokeLinecap="round" />
            <circle cx="16" cy="17" r="1.5" fill="currentColor" />
          </svg>
        );

      case 'travel':
        return (
          <div className="w-8 h-8 rounded border border-slate-400/80 flex items-center justify-center p-1">
            <svg className="w-full h-full text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M 7 17 L 17 7 M 17 7 H 11 M 17 7 V 13" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 17 17 L 7 7 M 7 7 H 13 M 7 7 V 13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );

      case 'play':
        return (
          <svg className="w-8 h-8 text-slate-500" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
            {/* Hot air balloon */}
            <path d="M 10 13 C 10 7 22 7 22 13 C 22 18 18 21 16 23 C 14 21 10 18 10 13 Z" fill="#f8fafc" />
            <line x1="14" y1="10" x2="14" y2="22" strokeWidth="1" />
            <line x1="18" y1="10" x2="18" y2="22" strokeWidth="1" />
            <rect x="14" y="24" width="4" height="3" rx="0.5" fill="currentColor" />
            <line x1="14.5" y1="23" x2="14.5" y2="24" />
            <line x1="17.5" y1="23" x2="17.5" y2="24" />
          </svg>
        );

      case 'hand':
        return (
          <svg className="w-8 h-8 text-slate-500" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
            {/* Outline Hand */}
            <path d="M 9 26 L 9 18 C 9 16 11 16 11 18 L 11 14 C 11 12 13 12 13 14 L 13 12 C 13 10 15 10 15 12 L 15 13 C 15 11 17 11 17 13 L 17 16 C 17 15 19 15 19 17 L 19 21 C 19 25 17 28 14 28 L 9 28 Z" strokeLinecap="round" strokeLinejoin="round" fill="#f8fafc" />
          </svg>
        );

      case 'game':
        return (
          <div className="flex flex-col items-center">
            {/* Cute TypingClub Alien Monster */}
            <svg className="w-8 h-8 text-slate-600" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="8" y="10" width="16" height="14" rx="4" fill="#f1f5f9" />
              <circle cx="12" cy="16" r="2" fill="currentColor" />
              <circle cx="20" cy="16" r="2" fill="currentColor" />
              <path d="M 13 20 Q 16 22 19 20" strokeLinecap="round" />
              {/* Antennae */}
              <line x1="11" y1="10" x2="9" y2="6" strokeLinecap="round" />
              <line x1="21" y1="10" x2="23" y2="6" strokeLinecap="round" />
            </svg>
          </div>
        );

      case 'speedometer':
        return (
          <svg className="w-8 h-8 text-slate-500" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M 7 22 A 10 10 0 1 1 25 22" strokeLinecap="round" />
            <line x1="16" y1="18" x2="21" y2="13" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="18" r="2" fill="currentColor" />
            {/* Speed tick trails */}
            <line x1="11" y1="24" x2="21" y2="24" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
        );

      case 'intro':
        return (
          <svg className="w-8 h-8 text-slate-500" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="6" y="8" width="20" height="15" rx="2" fill="#f8fafc" />
            <polygon points="14,12 19,15.5 14,19" fill="currentColor" />
            <line x1="12" y1="26" x2="20" y2="26" strokeLinecap="round" />
            <line x1="16" y1="23" x2="16" y2="26" />
          </svg>
        );

      case 'article':
        return (
          <svg className="w-8 h-8 text-slate-500" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M 8 6 L 20 6 L 24 10 L 24 26 L 8 26 Z" fill="#f8fafc" />
            <line x1="12" y1="14" x2="20" y2="14" />
            <line x1="12" y1="18" x2="18" y2="18" />
            <line x1="12" y1="22" x2="16" y2="22" />
          </svg>
        );

      case 'break':
        return (
          <svg className="w-8 h-8 text-slate-500" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="15" cy="17" r="9" />
            <polyline points="15,12 15,17 19,17" strokeLinecap="round" />
            <path d="M 24 14 C 26 14 27 15 27 17 C 27 19 26 20 24 20" strokeLinecap="round" />
          </svg>
        );

      default:
        return <span className="text-2xl">{lesson.icon || '🎯'}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none relative pb-16">
      
      {/* 
        TOP HEADER BAR (Matches Screenshot 1 & 2)
        - Typing Jungle / Typing Zone header
        - 0 Score · 0% Progress
        - Placement test recommendation banner
      */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Typing Zone</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Course Map
            </span>
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 font-medium">
            <span>Score: <b className="text-slate-800 font-mono">{totalScore}</b></span>
            <span>·</span>
            <span>Progress: <b className="text-slate-800 font-mono">{progressPercent}%</b></span>
            <span>·</span>
            <span>Completed: <b className="text-blue-600 font-mono">{totalCompleted}/100</b></span>
          </div>
        </div>

        {/* Global Summary & Unlocked Badge */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold shadow-2xs">
            <span>🔓</span>
            <span>All 100 Lessons Unlocked</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold font-mono">
              {totalStars} / {LESSONS.length * 5} Stars
            </span>
          </div>
        </div>
      </div>

      {/* 
        PLACEMENT TEST BANNER (Matches Screenshot 1 Exactly)
        - "Take the placement test to find out where to start."
        - [Start placement test]
      */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
            🗺️
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Take the placement test to find out where to start.
            </h2>
            <p className="text-xs text-slate-500">
              Already know how to type? Test your speed and unlock advanced lessons instantly.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onStartPlacementTest) onStartPlacementTest();
            else onSelectLesson(LESSONS[10]);
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
        >
          Start placement test
        </button>
      </div>

      {/* Quick Section Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {sections.map((sec) => (
          <button
            key={sec}
            onClick={() => setActiveSectionFilter(sec)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSectionFilter === sec
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {sec === 'All' ? 'All (100 Lessons)' : sec}
          </button>
        ))}
      </div>

      {/* 
        THE 3-COLUMN FLOATING ISLAND LESSONS GRID
        Matches all 4 uploaded screenshots!
      */}
      <div className="relative">
        {/* Floating Polygon Island Art Backdrop (Subtle low-poly geometric shading) */}
        <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden -z-10 flex flex-col items-center justify-around">
          <div className="w-80 h-80 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="w-96 h-96 rounded-full bg-blue-200/30 blur-3xl" />
        </div>

        <div className="space-y-12">
          {displaySections.map((secGroup) => (
            <div key={secGroup.sectionName} className="space-y-4">
              
              {/* 
                SECTION HEADER BANNER
                Matches the dark blue rounded pill header in the screenshots
              */}
              <div className="flex justify-center my-6">
                <div className="px-6 py-2.5 rounded-2xl bg-[#1e293b] text-white text-xs sm:text-sm font-extrabold tracking-wide shadow-md flex items-center gap-2">
                  <span>{secGroup.sectionName}</span>
                  {secGroup.sectionName.includes('Goal') ? null : (
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({secGroup.lessons.length} Lessons)
                    </span>
                  )}
                </div>
              </div>

              {/* 
                3-COLUMN LESSON CARDS GRID
                Matches Screenshots 1, 2, 3, and 4
              */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
                {secGroup.lessons.map((lesson) => {
                  const itemProgress = progress[lesson.id];
                  const isDone = itemProgress?.completed;
                  const starsEarned = itemProgress?.stars || 0;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson)}
                      className="group relative bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 transition-all duration-150 flex flex-col justify-between items-center text-center min-h-[120px] sm:min-h-[135px] cursor-pointer hover:-translate-y-1 hover:shadow-md hover:border-blue-300"
                      style={{
                        boxShadow: isDone
                          ? '0 4px 0 #bbf7d0, 0 6px 14px rgba(34, 197, 94, 0.09)'
                          : '0 4px 0 #e2e8f0, 0 6px 12px rgba(15, 23, 42, 0.05)',
                      }}
                      title={`Click to open Lesson ${lesson.id}: ${lesson.title}`}
                    >
                      {/* Top: Lesson Number (left) & Completed Stars or Play Arrow (right) */}
                      <div className="w-full flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-700 font-mono">
                          {String(lesson.id).padStart(2, '0')}
                        </span>

                        {isDone ? (
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-2.5 h-2.5 ${
                                  s <= starsEarned
                                    ? 'fill-amber-400 stroke-amber-400'
                                    : 'text-slate-200 stroke-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <Play className="w-3 h-3 text-slate-300 group-hover:text-blue-500 fill-slate-300/40 group-hover:fill-blue-500 transition-colors" />
                        )}
                      </div>

                      {/* Center: Iconic Card Graphic */}
                      <div className="my-1 flex items-center justify-center h-10">
                        {renderCardIcon(lesson)}
                      </div>

                      {/* Bottom: Lesson Label */}
                      <div className="w-full pt-1">
                        <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 truncate w-full">
                          {lesson.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
