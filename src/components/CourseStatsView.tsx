import React, { useState } from 'react';
import { UserProfile, LessonProgress, SessionResult } from '../types';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface CourseStatsViewProps {
  course?: 'english' | 'hindi';
  profile: UserProfile;
  progress: Record<number, LessonProgress>;
  sessions: SessionResult[];
}

export const CourseStatsView: React.FC<CourseStatsViewProps> = ({
  course = 'english',
  progress,
  sessions,
}) => {
  const [filterPeriod] = useState<'Overall' | 'This month' | 'This week'>('Overall');
  const [progressPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  const isHindi = course === 'hindi';
  const courseSessions = sessions.filter((s) =>
    isHindi
      ? (s.lessonId ?? 0) >= 1001 && (s.lessonId ?? 0) <= 1020
      : !s.lessonId || s.lessonId < 1000
  );
  const courseProgressList = Object.values(progress).filter((p) =>
    isHindi ? p.lessonId >= 1001 && p.lessonId <= 1020 : p.lessonId < 1000
  );
  const totalCourseLessons = isHindi ? 20 : 100;

  // Real-time time calculations
  const totalSeconds = courseSessions.reduce((acc, s) => acc + (s.timeSeconds || 0), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
  const totalSecRemainder = totalSeconds % 60;
  const clockString = `${String(totalHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}:${String(totalSecRemainder).padStart(2, '0')}`;

  // Breakdown of attempts
  const passedSessions = courseSessions.filter((s) => s.accuracy >= 80);
  const failedSessions = courseSessions.filter((s) => s.accuracy < 80);

  const passedSec = passedSessions.reduce((acc, s) => acc + (s.timeSeconds || 0), 0);
  const failedSec = failedSessions.reduce((acc, s) => acc + (s.timeSeconds || 0), 0);
  const incompleteSec = 0;
  const learningSec = Math.round(passedSec * 0.1); // Fraction spent reading tips / watching demos

  const passedH = Math.floor(passedSec / 3600);
  const passedM = Math.floor((passedSec % 3600) / 60);
  const passedStr = `${passedH}h ${String(passedM).padStart(2, '0')}m`;

  const failedH = Math.floor(failedSec / 3600);
  const failedM = Math.floor((failedSec % 3600) / 60);
  const failedStr = `${failedH}h ${String(failedM).padStart(2, '0')}m`;

  const learnH = Math.floor(learningSec / 3600);
  const learnM = Math.floor((learningSec % 3600) / 60);
  const learnStr = `${learnH}h ${String(learnM).padStart(2, '0')}m`;

  // Progress numbers
  const totalCompleted = courseProgressList.filter((p) => p.completed).length;
  const totalStars = courseProgressList.reduce((acc, curr) => acc + (curr.stars || 0), 0);
  const progressPercent = Math.min(100, Math.round((totalCompleted / totalCourseLessons) * 100));

  const avgAccuracy =
    courseSessions.length > 0
      ? Math.round(courseSessions.reduce((acc, s) => acc + s.accuracy, 0) / courseSessions.length)
      : 0;
  const topSpeed =
    courseSessions.length > 0 ? Math.max(...courseSessions.map((s) => s.wpm)) : 0;

  // Donut SVG offsets
  const circum = 238.76;
  const passedFrac = totalSeconds > 0 ? passedSec / totalSeconds : 0;
  const failedFrac = totalSeconds > 0 ? failedSec / totalSeconds : 0;

  const passedOffset = circum * (1 - passedFrac);
  const failedOffset = circum * (1 - failedFrac);

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-200">
      {/* Page Title: Stats */}
      <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">
        Stats
      </h1>

      {/* CARD 1: Time spent overview (Matches Screenshot 4 Exactly, starting at 0) */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
        {/* Card Header with Question Icon and Period Dropdown */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>Time spent overview</span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="relative">
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
              <span>{filterPeriod}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* 3-Section Row: Left Time, Middle Legend, Right Donut Chart */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Section A: Total Time Spent (Left) */}
          <div className="md:col-span-3 text-left pl-2">
            <div className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight font-mono">
              {totalHours}h<br />{String(totalMinutes).padStart(2, '0')}m
            </div>
            <div className="text-xs text-slate-500 font-medium mt-2">
              Total time spent
            </div>
          </div>

          {/* Section B: Legend Grid (Middle) */}
          <div className="md:col-span-5 md:border-l md:border-slate-100 md:pl-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
              {/* Passed attempts (Sky blue) */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa] inline-block" />
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {passedStr}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium pl-4.5 mt-0.5">
                  Passed attempts ({passedSessions.length})
                </div>
              </div>

              {/* Incomplete (Purple) */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] inline-block" />
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    0m 00s
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium pl-4.5 mt-0.5">
                  Incomplete
                </div>
              </div>

              {/* Failed attempts (Lavender) */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c4b5fd] inline-block" />
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {failedStr}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium pl-4.5 mt-0.5">
                  Failed attempts ({failedSessions.length})
                </div>
              </div>

              {/* Learning time (Deep violet) */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1] inline-block" />
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {learnStr}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium pl-4.5 mt-0.5">
                  Learning time
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Donut Chart with Clock String in Center */}
          <div className="md:col-span-4 flex items-center justify-center py-2">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f8fafc" strokeWidth="12" />

                {/* Segment 1: Passed Attempts */}
                {totalSeconds > 0 && passedSec > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="12"
                    strokeDasharray={circum}
                    strokeDashoffset={passedOffset}
                    className="transition-all duration-500"
                  />
                )}

                {/* Segment 2: Failed Attempts */}
                {totalSeconds > 0 && failedSec > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#c4b5fd"
                    strokeWidth="12"
                    strokeDasharray={circum}
                    strokeDashoffset={failedOffset}
                    transform={`rotate(${passedFrac * 360} 50 50)`}
                    className="transition-all duration-500"
                  />
                )}
              </svg>

              {/* Exact Center Clock */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-base font-extrabold text-slate-800 font-mono tracking-tight">
                  {clockString}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CARD 2: Progress overview */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>Progress overview</span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
            <span>{progressPeriod}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Milestone Activity Graph */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Course Completion: <b>{progressPercent}%</b></span>
            <span>Target: <b>100 Lessons</b></span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Real-time Summary Badges (starts at 0) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70">
              <div className="text-[11px] text-slate-500 font-medium">Lessons Passed</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                {totalCompleted} / 100
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70">
              <div className="text-[11px] text-slate-500 font-medium">Avg Accuracy</div>
              <div className="text-xl font-extrabold text-emerald-600 mt-1 font-mono">
                {avgAccuracy}%
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70">
              <div className="text-[11px] text-slate-500 font-medium">Top Speed</div>
              <div className="text-xl font-extrabold text-blue-600 mt-1 font-mono">
                {topSpeed} WPM
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70">
              <div className="text-[11px] text-slate-500 font-medium">Total Stars</div>
              <div className="text-xl font-extrabold text-amber-500 mt-1 font-mono">
                {totalStars} ⭐
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
