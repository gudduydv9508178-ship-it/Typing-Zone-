import React from 'react';
import { UserProfile, LessonProgress, SessionResult } from '../types';
import { LESSONS } from '../data/lessons';
import { HINDI_LESSONS } from '../data/hindiLessons';
import { MoreHorizontal, ArrowUp, Sparkles, TrendingUp } from 'lucide-react';

interface HomeDashboardProps {
  profile: UserProfile;
  progress: Record<number, LessonProgress>;
  sessions: SessionResult[];
  onOpenTypingJungle: () => void;
  onOpenTypingJungleHindi: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  progress,
  sessions,
  onOpenTypingJungle,
  onOpenTypingJungleHindi,
}) => {
  // Real-time calculation from user's actual progress (100 Lessons curriculum)
  const completedLessons = LESSONS.filter((l) => l.id <= 100 && progress[l.id]?.completed);
  const totalCompleted = completedLessons.length;
  const totalStars = Object.values(progress).reduce(
    (acc, curr) => acc + (curr.lessonId <= 100 ? (curr.stars || 0) : 0),
    0
  );
  const totalScore = Object.values(progress).reduce(
    (acc, curr) =>
      acc + (curr.lessonId <= 100 && curr.bestWpm ? Math.round(curr.bestWpm * 10 * (curr.bestAccuracy / 100)) : 0),
    0
  );
  const progressPercent = Math.min(100, Math.round((totalCompleted / 100) * 100));

  // Real-time calculation for Typing Jungle Hindi (20 Lessons)
  const completedHindiLessons = HINDI_LESSONS.filter((l) => progress[l.id]?.completed);
  const totalHindiCompleted = completedHindiLessons.length;
  const totalHindiStars = HINDI_LESSONS.reduce(
    (acc, l) => acc + (progress[l.id]?.stars || 0),
    0
  );
  const totalHindiScore = HINDI_LESSONS.reduce((acc, l) => {
    const p = progress[l.id];
    return acc + (p?.bestWpm ? Math.round(p.bestWpm * 10 * (p.bestAccuracy / 100)) : 0);
  }, 0);
  const hindiProgressPercent = Math.min(100, Math.round((totalHindiCompleted / HINDI_LESSONS.length) * 100));

  // Time calculations from real sessions (starts at 0 for new users)
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const totalSeconds = sessions.reduce((acc, s) => acc + (s.timeSeconds || 0), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);

  const todaySec = sessions
    .filter((s) => new Date(s.date).getTime() >= oneDayAgo)
    .reduce((acc, s) => acc + (s.timeSeconds || 0), 0);
  const thisWeekSec = sessions
    .filter((s) => new Date(s.date).getTime() >= sevenDaysAgo)
    .reduce((acc, s) => acc + (s.timeSeconds || 0), 0);
  const lastWeekSec = sessions
    .filter((s) => {
      const t = new Date(s.date).getTime();
      return t >= fourteenDaysAgo && t < sevenDaysAgo;
    })
    .reduce((acc, s) => acc + (s.timeSeconds || 0), 0);

  // Speed calculations from real sessions
  const thisWeekSessions = sessions.filter((s) => new Date(s.date).getTime() >= sevenDaysAgo);
  const thisWeekWpm =
    thisWeekSessions.length > 0
      ? Math.round(thisWeekSessions.reduce((a, s) => a + s.wpm, 0) / thisWeekSessions.length)
      : 0;

  const lastWeekSessions = sessions.filter((s) => {
    const t = new Date(s.date).getTime();
    return t >= fourteenDaysAgo && t < sevenDaysAgo;
  });
  const lastWeekWpm =
    lastWeekSessions.length > 0
      ? Math.round(lastWeekSessions.reduce((a, s) => a + s.wpm, 0) / lastWeekSessions.length)
      : 0;

  const lastMonthSessions = sessions.filter((s) => {
    const t = new Date(s.date).getTime();
    return t >= thirtyDaysAgo && t < fourteenDaysAgo;
  });
  const lastMonthWpm =
    lastMonthSessions.length > 0
      ? Math.round(lastMonthSessions.reduce((a, s) => a + s.wpm, 0) / lastMonthSessions.length)
      : 0;

  const maxSpeedScale = Math.max(40, thisWeekWpm, lastWeekWpm, lastMonthWpm);

  // Performance calculations
  const overallAccuracy =
    sessions.length > 0
      ? Math.round(sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length)
      : 0;

  // Keyboard coverage: distinct keys introduced in completed lessons
  const uniqueKeysPracticed = new Set(completedLessons.flatMap((l) => l.targetKeys)).size;
  const keyboardCoveragePercent = Math.min(100, Math.round((uniqueKeysPracticed / 45) * 100));

  // Gauge offsets
  const todayGoalSec = 3600; // 1h
  const weekGoalSec = 18000; // 5h
  const todayOffset = 88 * (1 - Math.min(1, todaySec / todayGoalSec));
  const thisWeekOffset = 88 * (1 - Math.min(1, thisWeekSec / weekGoalSec));
  const lastWeekOffset = 88 * (1 - Math.min(1, lastWeekSec / weekGoalSec));

  return (
    <div className="max-w-7xl mx-auto space-y-7 select-none animate-in fade-in duration-200">
      {/* Header: Dynamic greeting "Hello, [Username]." */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] tracking-tight">
          Hello, {profile.name || 'Guddu'}.
        </h1>
      </div>

      {/* Section Indicator: "● Typing" */}
      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
        <span>Typing</span>
      </div>

      {/* Main Grid: Left Course Card (Typing Jungle only), Right Dashboard Analytics Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Course Cards (Typing Jungle + Typing Jungle Hindi) */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Card 1: Typing Jungle (English) */}
          <div
            onClick={onOpenTypingJungle}
            className="group bg-white rounded-2xl border-2 border-blue-500/30 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between relative ring-2 ring-blue-500/10"
          >
            {/* Card Hero Graphic */}
            <div className="relative h-44 bg-gradient-to-tr from-[#0284c7] via-[#2563eb] to-[#4f46e5] p-4 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-end relative z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenTypingJungle();
                  }}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white bg-black/15 hover:bg-black/25 backdrop-blur-xs transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* F G H Colorful 3D Blocks */}
              <div className="relative z-10 flex items-center justify-center gap-2 my-auto">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-900 font-black text-lg flex items-center justify-center shadow-lg rotate-[-6deg] border border-amber-300">
                  F
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-lg -translate-y-1 border border-emerald-400">
                  G
                </div>
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white font-black text-lg flex items-center justify-center shadow-lg rotate-[6deg] border border-rose-400">
                  H
                </div>
              </div>

              {/* Hands & Keyboard Graphic */}
              <div className="relative z-10 flex justify-center -mb-2 opacity-95">
                <svg viewBox="0 0 200 65" className="w-44 h-auto">
                  <rect x="25" y="10" width="150" height="40" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                  <rect x="35" y="15" width="130" height="8" rx="1" fill="#e2e8f0" />
                  <rect x="35" y="26" width="130" height="8" rx="1" fill="#e2e8f0" />
                  <path d="M 40 65 C 40 45 55 40 65 42 L 75 65 Z" fill="#fed7aa" opacity="0.9" />
                  <path d="M 160 65 C 160 45 145 40 135 42 L 125 65 Z" fill="#fed7aa" opacity="0.9" />
                </svg>
              </div>
            </div>

            {/* Card Footer Info */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3 gap-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5 flex-wrap">
                  <span>Typing Jungle</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                    100 Lessons
                  </span>
                </h3>
              </div>

              {/* Real-time points & stars (starts at 0) */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
                <span>
                  <b className="text-slate-900 font-mono">{totalScore.toLocaleString()}</b> points
                </span>
                <span>
                  <b className="text-slate-900 font-mono">{totalStars.toLocaleString()}</b> Stars
                </span>
              </div>

              {/* Real-time progress bar (starts at 0%) */}
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Progress</span>
                  <span className="font-bold text-slate-700">{progressPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Typing Jungle Hindi (20 Lessons) */}
          <div
            onClick={onOpenTypingJungleHindi}
            className="group bg-white rounded-2xl border-2 border-orange-500/30 hover:border-orange-500 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between relative ring-2 ring-orange-500/10"
          >
            {/* Card Hero Graphic */}
            <div className="relative h-44 bg-gradient-to-tr from-[#ea580c] via-[#f97316] to-[#db2777] p-4 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center relative z-10">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                  हिन्दी InScript
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenTypingJungleHindi();
                  }}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white bg-black/15 hover:bg-black/25 backdrop-blur-xs transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* क ख ग Colorful 3D Blocks */}
              <div className="relative z-10 flex items-center justify-center gap-2 my-auto">
                <div className="w-9 h-9 rounded-xl bg-amber-300 text-slate-900 font-black text-lg flex items-center justify-center shadow-lg rotate-[-6deg] border border-amber-200">
                  क
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-lg -translate-y-1 border border-emerald-400">
                  ख
                </div>
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white font-black text-lg flex items-center justify-center shadow-lg rotate-[6deg] border border-sky-400">
                  ग
                </div>
              </div>

              {/* Hands & Keyboard Graphic */}
              <div className="relative z-10 flex justify-center -mb-2 opacity-95">
                <svg viewBox="0 0 200 65" className="w-44 h-auto">
                  <rect x="25" y="10" width="150" height="40" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                  <rect x="35" y="15" width="130" height="8" rx="1" fill="#e2e8f0" />
                  <rect x="35" y="26" width="130" height="8" rx="1" fill="#e2e8f0" />
                  <path d="M 40 65 C 40 45 55 40 65 42 L 75 65 Z" fill="#fed7aa" opacity="0.9" />
                  <path d="M 160 65 C 160 45 145 40 135 42 L 125 65 Z" fill="#fed7aa" opacity="0.9" />
                </svg>
              </div>
            </div>

            {/* Card Footer Info */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3 gap-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-1.5 flex-wrap">
                  <span>Typing Jungle Hindi</span>
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                    20 Lessons
                  </span>
                </h3>
              </div>

              {/* Real-time points & stars (starts at 0) */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
                <span>
                  <b className="text-slate-900 font-mono">{totalHindiScore.toLocaleString()}</b> points
                </span>
                <span>
                  <b className="text-slate-900 font-mono">{totalHindiStars.toLocaleString()}</b> Stars
                </span>
              </div>

              {/* Real-time progress bar (starts at 0%) */}
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${hindiProgressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Progress</span>
                  <span className="font-bold text-slate-700">{hindiProgressPercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Dashboard Analytics Widgets (Real-Time Only) */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* WIDGET 1: TIME SPENT (With circular donut rings) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Time spent
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center pb-4 border-b border-slate-100">
              {/* Today */}
              <div className="flex flex-col items-center">
                <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1 mb-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  <span>
                    {Math.floor(todaySec / 60)}m {String(todaySec % 60).padStart(2, '0')}s
                  </span>
                </div>
                {/* Donut ring */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="3.5"
                      strokeDasharray="88"
                      strokeDashoffset={todayOffset}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[9px] leading-tight text-slate-400 font-medium">
                    <span>Goal</span>
                    <span className="font-bold text-slate-700">1h 00m</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2">Today</span>
              </div>

              {/* This week */}
              <div className="flex flex-col items-center">
                <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1 mb-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                  <span>
                    {Math.floor(thisWeekSec / 3600)}h {String(Math.floor((thisWeekSec % 3600) / 60)).padStart(2, '0')}m
                  </span>
                </div>
                {/* Donut ring */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="3.5"
                      strokeDasharray="88"
                      strokeDashoffset={thisWeekOffset}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[9px] leading-tight text-slate-400 font-medium">
                    <span>Goal</span>
                    <span className="font-bold text-slate-700">5h 00m</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2">This week</span>
              </div>

              {/* Last week */}
              <div className="flex flex-col items-center">
                <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1 mb-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                  <span>
                    {Math.floor(lastWeekSec / 3600)}h {String(Math.floor((lastWeekSec % 3600) / 60)).padStart(2, '0')}m
                  </span>
                </div>
                {/* Donut ring */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="3.5"
                      strokeDasharray="88"
                      strokeDashoffset={lastWeekOffset}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[9px] leading-tight text-slate-400 font-medium">
                    <span>Goal</span>
                    <span className="font-bold text-slate-700">5h 00m</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2">Last week</span>
              </div>
            </div>

            {/* Bottom: Total Time Summary */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {totalHours}h {String(totalMinutes).padStart(2, '0')}m
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Overall active practice time
                </div>
              </div>
            </div>
          </div>

          {/* TWO BOTTOM WIDGETS: SPEED & PERFORMANCE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* WIDGET 2: SPEED (Bar chart) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Speed
              </h3>

              <div className="h-32 flex items-end justify-between gap-3 border-b border-dashed border-slate-100 px-2 pb-0">
                {/* This week */}
                <div className="flex flex-col items-center flex-1 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-700 mb-1 font-mono">
                    {thisWeekWpm} <span className="text-[8px] font-normal text-slate-400">wpm</span>
                  </span>
                  <div
                    className="w-full max-w-[36px] bg-sky-400 rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max(4, Math.round((thisWeekWpm / maxSpeedScale) * 85))}px`,
                    }}
                  />
                  <span className="text-[10px] text-slate-400 mt-2 whitespace-nowrap">This week</span>
                </div>

                {/* Last week */}
                <div className="flex flex-col items-center flex-1 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-700 mb-1 font-mono">
                    {lastWeekWpm} <span className="text-[8px] font-normal text-slate-400">wpm</span>
                  </span>
                  <div
                    className="w-full max-w-[36px] bg-blue-600 rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max(4, Math.round((lastWeekWpm / maxSpeedScale) * 85))}px`,
                    }}
                  />
                  <span className="text-[10px] text-slate-400 mt-2 whitespace-nowrap">Last week</span>
                </div>

                {/* Last month */}
                <div className="flex flex-col items-center flex-1 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-700 mb-1 font-mono">
                    {lastMonthWpm} <span className="text-[8px] font-normal text-slate-400">wpm</span>
                  </span>
                  <div
                    className="w-full max-w-[36px] bg-slate-200 rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max(4, Math.round((lastMonthWpm / maxSpeedScale) * 85))}px`,
                    }}
                  />
                  <span className="text-[10px] text-slate-400 mt-2 whitespace-nowrap">Last month</span>
                </div>
              </div>
            </div>

            {/* WIDGET 3: PERFORMANCE (Accuracy & Coverage) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Performance
              </h3>

              <div className="space-y-4 my-auto">
                {/* Accuracy */}
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Accuracy</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {overallAccuracy}%
                    </span>
                    {overallAccuracy > 0 && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center">
                        <ArrowUp className="w-3 h-3 stroke-[3]" />
                        <span>Real-time</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Keyboard Coverage */}
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Keyboard Coverage</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {keyboardCoveragePercent}%
                    </span>
                    {keyboardCoveragePercent > 0 && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center">
                        <ArrowUp className="w-3 h-3 stroke-[3]" />
                        <span>{uniqueKeysPracticed} keys</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
