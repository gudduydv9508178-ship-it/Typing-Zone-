import React, { useState } from 'react';
import { Lesson, LessonProgress } from '../types';
import { LESSONS } from '../data/lessons';
import { HINDI_LESSONS } from '../data/hindiLessons';
import { Star, Play, Check, Lock, X } from 'lucide-react';

interface TypingJungleViewProps {
  course?: 'english' | 'hindi';
  progress: Record<number, LessonProgress>;
  onSelectLesson: (lesson: Lesson) => void;
  onLockedClick?: (lessonId: number) => void;
}

export const TypingJungleView: React.FC<TypingJungleViewProps> = ({
  course = 'english',
  progress,
  onSelectLesson,
  onLockedClick,
}) => {
  const [skipLesson, setSkipLesson] = useState<Lesson | null>(null);
  const isHindi = course === 'hindi';
  const activeLessons = isHindi ? HINDI_LESSONS : LESSONS;
  const firstLessonId = isHindi ? 1001 : 1;

  // Group lessons into official sections
  const sections = isHindi
    ? [
        {
          name: 'होम रो (Home Row)',
          subtitle: 'बुनियादी कुंजियाँ (लक्ष्य: 15-18 WPM)',
          lessons: activeLessons.filter((l) => l.id >= 1001 && l.id <= 1005),
        },
        {
          name: 'टॉप रो (Top Row)',
          subtitle: 'मात्राएँ और व्यंजन (लक्ष्य: 18-21 WPM)',
          lessons: activeLessons.filter((l) => l.id >= 1006 && l.id <= 1010),
        },
        {
          name: 'बॉटम रो (Bottom Row)',
          subtitle: 'निचली पंक्ति (लक्ष्य: 20-22 WPM)',
          lessons: activeLessons.filter((l) => l.id >= 1011 && l.id <= 1015),
        },
        {
          name: 'मात्राएँ और वाक्य (Matras & Sentences)',
          subtitle: 'पूर्ण हिंदी टाइपिंग (लक्ष्य: 22-26 WPM)',
          lessons: activeLessons.filter((l) => l.id >= 1016 && l.id <= 1020),
        },
      ]
    : [
        {
          name: 'Get started',
          subtitle: '',
          lessons: activeLessons.filter((l) => l.id >= 1 && l.id <= 23),
        },
        {
          name: 'Top Row',
          subtitle: '',
          lessons: activeLessons.filter((l) => l.id >= 24 && l.id <= 51),
        },
        {
          name: 'Bottom Row',
          subtitle: '',
          lessons: activeLessons.filter((l) => l.id >= 52 && l.id <= 88),
        },
        {
          name: 'Basic Level 1',
          subtitle: 'Basic Keys (Goal: 21 WPM)',
          lessons: activeLessons.filter((l) => l.id >= 89 && l.id <= 126),
        },
        {
          name: 'Tricky Words 1',
          subtitle: 'Tricky Words (Goal: 22 WPM)',
          lessons: activeLessons.filter((l) => l.id >= 127 && l.id <= 134),
        },
      ];

  // HD Vector illustration renderer for each lesson card
  const renderCardIllustration = (lesson: Lesson, isLocked: boolean) => {
    const id = lesson.id;
    const type = lesson.type || 'practice';
    const strokeClass = isLocked ? 'text-slate-300' : 'text-slate-400';

    // Speed-arc with "1" icon for Basic Level 1 lessons (89, 90, 91, 92, 95, 96, 97, 98)
    if (
      (id >= 89 && id <= 92) ||
      (id >= 95 && id <= 98) ||
      lesson.title.includes('Speed') ||
      lesson.title.includes('Using Ten Fingers')
    ) {
      return (
        <div className="flex flex-col items-center justify-center my-0.5">
          <svg className={`w-11 h-11 ${strokeClass}`} viewBox="0 0 44 44" fill="none">
            <line x1="8" y1="18" x2="16" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="6" y1="24" x2="14" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="9" y1="30" x2="15" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M 22 10 A 13 13 0 1 1 22 36"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <text
              x="25"
              y="28"
              fontFamily="sans-serif"
              fontSize="16"
              fontWeight="900"
              fill={isLocked ? '#94a3b8' : '#1e293b'}
              textAnchor="middle"
            >
              1
            </text>
          </svg>
        </div>
      );
    }

    // Alien Monster mascot for play levels (23, 82, 83, 94, 100)
    if (id === 23 || id === 82 || id === 83 || id === 94 || id === 100 || type === 'game') {
      return (
        <div className="flex flex-col items-center justify-center my-0.5">
          <svg className={`w-10 h-10 ${strokeClass}`} viewBox="0 0 36 36" fill="none">
            <rect x="9" y="11" width="18" height="17" rx="5" fill="#f8fafc" stroke="currentColor" strokeWidth="2" />
            <circle cx="14" cy="18" r="2.5" fill={isLocked ? '#94a3b8' : '#1e293b'} />
            <circle cx="22" cy="18" r="2.5" fill={isLocked ? '#94a3b8' : '#1e293b'} />
            <circle cx="14.8" cy="17.2" r="0.8" fill="#ffffff" />
            <circle cx="22.8" cy="17.2" r="0.8" fill="#ffffff" />
            <path d="M 15 23 Q 18 25 21 23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="13" y1="11" x2="10" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="23" y1="11" x2="26" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="6" r="1.5" fill="currentColor" />
            <circle cx="26" cy="6" r="1.5" fill="currentColor" />
          </svg>
        </div>
      );
    }

    // Hot air balloon for play levels (08, 15, 62, 74)
    if (id === 8 || id === 15 || id === 62 || id === 74 || type === 'play') {
      return (
        <div className="flex items-center justify-center my-0.5">
          <svg className={`w-10 h-11 ${strokeClass}`} viewBox="0 0 36 38" fill="none">
            <path
              d="M 10 14 C 10 7 26 7 26 14 C 26 19.5 21.5 24 18 26 C 14.5 24 10 19.5 10 14 Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="#f8fafc"
            />
            <line x1="15" y1="10" x2="15" y2="25" stroke="currentColor" strokeWidth="1.2" />
            <line x1="21" y1="10" x2="21" y2="25" stroke="currentColor" strokeWidth="1.2" />
            <rect x="15" y="29" width="6" height="4" rx="1" fill={isLocked ? '#94a3b8' : '#64748b'} />
            <line x1="16" y1="26" x2="16" y2="29" stroke="currentColor" strokeWidth="1" />
            <line x1="20" y1="26" x2="20" y2="29" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      );
    }

    // Video / Intro lesson (01, 16, 125)
    if (id === 1 || id === 16 || id === 125 || type === 'intro') {
      if (id === 16) {
        return (
          <div className="relative w-12 h-11 flex items-center justify-center">
            <svg className={`w-10 h-10 ${strokeClass}`} viewBox="0 0 36 36" fill="none">
              <path d="M 6 16 L 18 6 L 30 16 L 27 16 L 27 30 L 9 30 L 9 16 Z" stroke="currentColor" strokeWidth="2" fill="#f8fafc" />
              <rect x="14" y="20" width="8" height="10" fill="#e2e8f0" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-slate-300 shadow-xs flex items-center justify-center">
              <Play className="w-2.5 h-2.5 fill-slate-500 text-slate-500 ml-0.5" />
            </div>
          </div>
        );
      }
      return (
        <div className="relative w-12 h-11 flex items-center justify-center">
          <svg className={`w-11 h-11 ${strokeClass}`} viewBox="0 0 40 40" fill="none">
            <rect x="7" y="6" width="26" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="#f8fafc" />
            <path d="M 14 14 L 26 14 M 20 14 L 20 25" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 10 9 L 11 11 L 13 12 L 11 13 L 10 15 L 9 13 L 7 12 L 9 11 Z" fill="#94a3b8" />
          </svg>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-slate-300 shadow-xs flex items-center justify-center">
            <Play className="w-2.5 h-2.5 fill-slate-500 text-slate-500 ml-0.5" />
          </div>
        </div>
      );
    }

    // Cardboard Box keys
    if (type === 'box') {
      return (
        <div className="flex flex-col items-center justify-center">
          <span
            className={`font-extrabold text-sm sm:text-base tracking-tight font-mono -mb-1 ${
              isLocked ? 'text-slate-400' : 'text-slate-700'
            }`}
          >
            {lesson.boxKeys || '␣'}
          </span>
          <svg className={`w-12 h-10 ${strokeClass}`} viewBox="0 0 44 36" fill="none">
            <path d="M 9 14 L 22 8 L 35 14 L 22 20 Z" stroke="currentColor" strokeWidth="1.8" fill="#f8fafc" />
            <path d="M 9 14 L 9 27 L 22 33 L 22 20 Z" stroke="currentColor" strokeWidth="1.8" fill="#f1f5f9" />
            <path d="M 35 14 L 35 27 L 22 33 L 22 20 Z" stroke="currentColor" strokeWidth="1.8" fill="#e2e8f0" />
            <path d="M 9 14 L 4 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 35 14 L 40 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      );
    }

    // Hand practice lessons
    if (type === 'hand' || id === 17 || id === 18 || id === 79 || id === 80 || id === 93 || id === 99) {
      return (
        <div className="flex items-center justify-center my-0.5">
          <svg className={`w-10 h-10 ${strokeClass}`} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path
              d="M 10 29 L 10 20 C 10 18 12 18 12 20 L 12 15 C 12 13 14 13 14 15 L 14 13 C 14 11 16 11 16 13 L 16 14 C 16 12 18 12 18 14 L 18 17 C 18 16 20 16 20 18 L 20 23 C 20 27 18 30 15 30 L 10 30 Z"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#f8fafc"
            />
          </svg>
        </div>
      );
    }

    // Travel directional arrows
    if (type === 'travel') {
      return (
        <div className="flex items-center justify-center my-0.5">
          <div className="w-9 h-9 rounded-md border border-slate-300 bg-slate-50 flex items-center justify-center p-1.5 shadow-xs">
            <svg className={`w-full h-full ${strokeClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M 6 18 L 18 6 M 18 6 H 12 M 18 6 V 12" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 18 18 L 6 6 M 6 6 H 12 M 6 6 V 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      );
    }

    // Review lessons (magnifying glass)
    if (type === 'review' || lesson.title.toLowerCase().startsWith('review')) {
      return (
        <div className="flex items-center justify-center my-0.5">
          <svg className={`w-10 h-10 ${strokeClass}`} viewBox="0 0 36 36" fill="none">
            <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="2.5" fill="#f8fafc" />
            <line x1="23" y1="23" x2="31" y2="31" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M 12 13 A 5 5 0 0 1 17 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );
    }

    // Stopwatch / Timer practice lessons
    return (
      <div className="flex items-center justify-center my-0.5">
        <svg className={`w-10 h-10 ${strokeClass}`} viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="19" r="11" stroke="currentColor" strokeWidth="2.2" fill="#f8fafc" />
          <line x1="18" y1="4" x2="18" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="15" y1="4" x2="21" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="18" y1="19" x2="18" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="18" cy="19" r="1.8" fill="currentColor" />
          <line x1="11" y1="19" x2="13" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="23" y1="19" x2="25" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  };

  return (
    <div className="relative pb-24 select-none animate-in fade-in duration-200">
      
      {/* 
        3D FLOATING ISLAND BACKGROUND (Matching TypingClub aesthetics)
      */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden flex items-center justify-center opacity-65">
        <svg className="w-[850px] h-[950px]" viewBox="0 0 600 700" fill="none">
          {/* Distant soft clouds */}
          <path d="M 50 180 C 70 150 140 150 160 180 C 180 180 200 200 190 220 C 180 240 60 240 50 220 Z" fill="#e0f2fe" opacity="0.6" />
          <path d="M 400 320 C 420 290 490 290 510 320 C 530 320 550 340 540 360 C 530 380 410 380 400 360 Z" fill="#e0f2fe" opacity="0.5" />

          {/* Floating Crystal Island Facets */}
          <polygon points="180,240 420,240 460,300 300,340 140,290" fill="#06b6d4" opacity="0.85" />
          <ellipse cx="280" cy="225" rx="45" ry="18" fill="#10b981" />
          <ellipse cx="320" cy="220" rx="35" ry="14" fill="#059669" />
          <ellipse cx="250" cy="230" rx="30" ry="12" fill="#047857" />
          <path d="M 280 240 Q 285 230 295 225" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />

          <polygon points="140,290 300,340 280,480 160,420" fill="#0891b2" />
          <polygon points="300,340 460,300 420,440 280,480" fill="#0e7490" />
          <polygon points="160,420 280,480 290,560 210,510" fill="#155e75" />
          <polygon points="280,480 420,440 370,530 290,560" fill="#164e63" />
          <polygon points="210,510 290,560 285,640 230,580" fill="#1e3a8a" />
          <polygon points="290,560 370,530 310,610 285,640" fill="#0f172a" />

          <line x1="300" y1="340" x2="280" y2="480" stroke="#67e8f9" strokeWidth="2" opacity="0.7" />
          <line x1="280" y1="480" x2="290" y2="560" stroke="#67e8f9" strokeWidth="1.5" opacity="0.8" />
          <line x1="140" y1="290" x2="300" y2="340" stroke="#a5f3fc" strokeWidth="2.5" opacity="0.9" />
        </svg>
      </div>

      {/* 
        PROMINENT "GET STARTED" BUTTON (Top of course map)
      */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => {
            const nextLesson = activeLessons.find((l) => !progress[l.id]?.completed) || activeLessons[0];
            onSelectLesson(nextLesson);
          }}
          className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base tracking-wide shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center gap-2.5"
        >
          <Play className="w-4 h-4 fill-white stroke-none" />
          <span>{isHindi ? 'शुरू करें (Get started)' : 'Get started'}</span>
        </button>
      </div>

      {/* 
        SECTIONS LIST:
        1. Get started (01 - 23)
        2. Top Row (24 - 51)
        3. Bottom Row (52 - 88)
        4. Basic Level 1 (89 - 100)
      */}
      <div className="space-y-12">
        {sections.map((section) => (
          <div key={section.name} className="space-y-5">
            
            {/* Section speech-bubble pill */}
            <div className="flex justify-center my-6">
              <div className="relative px-7 py-3 rounded-2xl bg-[#1e293b] text-white text-center shadow-md after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[7px] after:border-x-transparent after:border-b-transparent after:border-t-[#1e293b]">
                <div className="font-extrabold text-sm sm:text-base tracking-wide">
                  {section.name}
                </div>
                {section.subtitle && (
                  <div className="text-[11px] text-slate-300 font-normal mt-0.5">
                    {section.subtitle}
                  </div>
                )}
              </div>
            </div>

            {/* 6-Column HD Grid on Desktop, 3-Column on Mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4.5">
              {section.lessons.map((lesson) => {
                const itemProgress = progress[lesson.id];
                const isCompleted = !!itemProgress?.completed;
                const earnedStars = itemProgress?.stars || 0;

                // RULE: Only first lesson of course is unlocked initially!
                // Subsequent lessons unlock ONLY after the previous lesson is completed!
                const isUnlocked = lesson.id === firstLessonId || !!progress[lesson.id - 1]?.completed;
                const isLocked = !isUnlocked;
                const displayNumber = isHindi ? lesson.id - 1000 : lesson.id;

                const isCheckCard =
                  lesson.type === 'intro' ||
                  lesson.type === 'box' ||
                  lesson.id === 1 ||
                  lesson.id === 2 ||
                  lesson.id === 3 ||
                  lesson.id === 5 ||
                  lesson.id === 9 ||
                  lesson.id === 12 ||
                  lesson.id === 16;

                const handleCardClick = () => {
                  if (isLocked) {
                    setSkipLesson(lesson);
                    if (onLockedClick) onLockedClick(displayNumber);
                    return;
                  }
                  onSelectLesson(lesson);
                };

                return (
                  <div
                    key={lesson.id}
                    onClick={handleCardClick}
                    className={`group relative rounded-2xl border transition-all duration-150 flex flex-col justify-between overflow-hidden min-h-[148px] cursor-pointer ${
                      isLocked
                        ? 'bg-white/95 border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5'
                        : isCompleted
                        ? 'bg-white border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-400 hover:-translate-y-1'
                        : 'bg-white border-blue-400 ring-2 ring-blue-500/20 shadow-md hover:shadow-xl hover:-translate-y-1'
                    }`}
                    title={
                      isLocked
                        ? `Lesson ${displayNumber}: ${lesson.title} (Locked - Click to Skip Ahead)`
                        : isCompleted
                        ? `Lesson ${displayNumber}: ${lesson.title} (Completed - ${earnedStars} Stars)`
                        : `Lesson ${displayNumber}: ${lesson.title} (Ready to Play)`
                    }
                  >
                    {/* TOP HEADER: Lesson Number left (Dark Blue 3D), Lock / Play indicator right */}
                    <div className="px-3.5 pt-3 flex items-center justify-between w-full">
                      <span
                        className={`text-xs sm:text-sm font-black font-sans tracking-tight ${
                          isLocked ? 'text-[#334155]' : 'text-[#1e3a8a]'
                        }`}
                      >
                        {String(displayNumber).padStart(2, '0')}
                      </span>

                      {/* Right Indicator: small lock icon if locked */}
                      {isLocked ? (
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400" title="Locked - Click to unlock">
                          <Lock className="w-3 h-3 text-slate-400" />
                        </div>
                      ) : isCompleted ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Done
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded animate-pulse">
                          Play
                        </span>
                      )}
                    </div>

                    {/* CARD BODY: Checkmark style vs Dark Ribbon 5-Star style */}
                    {isCompleted ? (
                      /* COMPLETED STATE */
                      isCheckCard ? (
                        <div className="flex flex-col items-center justify-between flex-1 px-3 pb-3 pt-1">
                          <div className="my-auto">{renderCardIllustration(lesson, false)}</div>
                          <div className="my-1.5 w-6 h-6 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <div className="text-[11px] font-bold text-slate-700 truncate w-full text-center">
                            {lesson.title}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-between flex-1">
                          <div className="my-auto py-1">{renderCardIllustration(lesson, false)}</div>
                          <div className="w-full bg-[#334155] group-hover:bg-[#1e293b] text-white pt-2 pb-2.5 px-2 flex flex-col items-center transition-colors">
                            {/* Dynamically earned stars */}
                            <div className="flex items-center gap-0.5 mb-1">
                              {[1, 2, 3, 4, 5].map((starIdx) => (
                                <Star
                                  key={starIdx}
                                  className={`w-3 h-3 ${
                                    starIdx <= earnedStars
                                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_1px_2px_rgba(251,191,36,0.6)]'
                                      : 'fill-slate-600 text-slate-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-[10px] sm:text-[11px] font-medium text-slate-100 truncate w-full text-center">
                              {lesson.title}
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      /* UNCOMPLETED STATE (Locked or Next Up) - NO STARS DISPLAYED */
                      <div className="flex flex-col items-center justify-between flex-1 px-3 pb-3 pt-1">
                        <div className="my-auto">{renderCardIllustration(lesson, isLocked)}</div>
                        <div className="w-full pt-1 text-center">
                          <div
                            className={`text-[11px] font-semibold truncate w-full ${
                              isLocked ? 'text-slate-600' : 'text-slate-700 group-hover:text-blue-600'
                            }`}
                          >
                            {lesson.title}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

      {/* 
        SKIP AHEAD MODAL FOR LOCKED LESSONS
        Exact specifications:
        - Lock icon
        - "Skip ahead?"
        - "We highly recommend completing lessons in order for the best learning experience."
        - Cancel and Skip anyways buttons
        - ✕ close button
      */}
      {skipLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-100 text-slate-800 text-center animate-in zoom-in-95 duration-150">
            {/* Close button X */}
            <button
              onClick={() => setSkipLesson(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Lock Icon Circle */}
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 shadow-xs">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Skip ahead?
            </h3>

            {/* Message */}
            <p className="text-sm text-slate-600 leading-relaxed mb-6 px-3">
              We highly recommend completing lessons in order for the best learning experience.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setSkipLesson(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = skipLesson;
                  setSkipLesson(null);
                  onSelectLesson(target);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer"
              >
                Skip anyways
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
