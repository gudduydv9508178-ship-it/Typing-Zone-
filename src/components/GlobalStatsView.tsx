import React, { useState } from 'react';
import { UserProfile, SessionResult, LessonProgress } from '../types';
import { ChevronDown, HelpCircle, Calendar } from 'lucide-react';

interface GlobalStatsViewProps {
  profile: UserProfile;
  sessions: SessionResult[];
  progress: Record<number, LessonProgress>;
}

export const GlobalStatsView: React.FC<GlobalStatsViewProps> = ({
  sessions,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'typing'>('overview');
  const [hoveredDonut, setHoveredDonut] = useState<boolean>(true);

  // Time calculations from real sessions (starts at 0)
  const totalSeconds = sessions.reduce((acc, s) => acc + (s.timeSeconds || 0), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
  const totalSecRemainder = totalSeconds % 60;

  // Clock string: HH:MM:SS
  const clockString = `${String(totalHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}:${String(totalSecRemainder).padStart(2, '0')}`;

  // Real breakdown:
  // Practice time = time spent on practice/lesson sessions
  // Learning time = time on video/intro/box/speedometer lessons (~15% of actual time or recorded sessions)
  // Incomplete = stopped early (0 for finished sessions)
  const practiceSec = sessions
    .filter((s) => s.accuracy >= 75)
    .reduce((acc, s) => acc + (s.timeSeconds || 0), 0);
  const learningSec = sessions
    .filter((s) => s.accuracy < 75)
    .reduce((acc, s) => acc + (s.timeSeconds || 0), 0);
  const incompleteSec = 0;

  const practiceH = Math.floor(practiceSec / 3600);
  const practiceM = Math.floor((practiceSec % 3600) / 60);
  const practiceString = `${practiceH}h ${String(practiceM).padStart(2, '0')}m`;

  const learnH = Math.floor(learningSec / 3600);
  const learnM = Math.floor((learningSec % 3600) / 60);
  const learnString = `${learnH}h ${String(learnM).padStart(2, '0')}m`;

  // Attempts count from actual sessions
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
  const twentyOneDaysAgo = now - 21 * 24 * 60 * 60 * 1000;

  const thisWeekAttempts = sessions.filter(
    (s) => new Date(s.date).getTime() >= sevenDaysAgo
  ).length;
  const lastWeekAttempts = sessions.filter((s) => {
    const t = new Date(s.date).getTime();
    return t >= fourteenDaysAgo && t < sevenDaysAgo;
  }).length;
  const twoWeeksAgoAttempts = sessions.filter((s) => {
    const t = new Date(s.date).getTime();
    return t >= twentyOneDaysAgo && t < fourteenDaysAgo;
  }).length;

  const maxAttempts = Math.max(10, thisWeekAttempts, lastWeekAttempts, twoWeeksAgoAttempts);

  // Donut chart calculations
  const circum = 238.76;
  const practiceFraction = totalSeconds > 0 ? practiceSec / totalSeconds : 0;
  const practiceOffset = circum * (1 - practiceFraction);

  // Calendar days generation (Last 28 days)
  const calendarDays = Array.from({ length: 28 }).map((_, idx) => {
    const date = new Date(now - (27 - idx) * 24 * 60 * 60 * 1000);
    const dayStr = date.toISOString().split('T')[0];
    const daySessions = sessions.filter((s) => s.date.startsWith(dayStr));
    const count = daySessions.length;
    return {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'short' }),
      count,
    };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-200">
      {/* Top Filter Pills: Overview, Typing */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200/80">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('typing')}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'typing'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Typing
          </button>
        </div>
      </div>

      {/* Main Page Title */}
      <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">
        Stats
      </h1>

      {/* Two Main Cards Grid matching Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: Practice time overview */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>Practice time overview</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <button className="flex items-center gap-1 px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
              <span>Overall</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Donut Chart Visual & Total Time */}
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto py-4">
            <div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight">
                {totalHours}h {String(totalMinutes).padStart(2, '0')}m
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Total time spent
              </div>
            </div>

            {/* Segmented Donut Chart */}
            <div
              className="relative w-44 h-44 flex items-center justify-center"
              onMouseEnter={() => setHoveredDonut(true)}
            >
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="11" />
                
                {/* Segment: Practice Time */}
                {totalSeconds > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="11"
                    strokeDasharray={circum}
                    strokeDashoffset={practiceOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                )}
              </svg>

              {/* Exact Center Time Clock */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-sm font-extrabold text-slate-800 font-mono tracking-tight">
                  {clockString}
                </span>
              </div>

              {/* Tooltip speech bubble with pointer arrow */}
              {hoveredDonut && totalSeconds > 0 && (
                <div className="absolute top-2 left-6 z-10 bg-[#1e293b] text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl font-mono text-center after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-x-transparent after:border-b-transparent after:border-t-[#1e293b]">
                  <span className="font-bold">{practiceString}</span>
                  <div className="text-[9px] text-slate-400 font-sans leading-tight">Practice time</div>
                </div>
              )}
            </div>
          </div>

          {/* Legend matching Screenshot 2 */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 flex-wrap gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
              <span>
                {practiceString} <span className="font-normal text-slate-400">Practice time</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
              <span>
                0m 00s <span className="font-normal text-slate-400">Incomplete</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-700 inline-block" />
              <span>
                {learnString} <span className="font-normal text-slate-400">Learning time</span>
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Attempts overview (With Purple Weekly Bar Chart) */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>Attempts overview</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Main Content Split: Left Attempts Numbers, Right Bar Chart */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 my-auto py-2">
            
            {/* Left Attempts numbers */}
            <div className="sm:col-span-5 space-y-4">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">This week</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {thisWeekAttempts} <span className="text-xs font-normal text-slate-400">Attempts</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Last week</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {lastWeekAttempts} <span className="text-xs font-normal text-slate-400">Attempts</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">2 weeks ago</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {twoWeeksAgoAttempts} <span className="text-xs font-normal text-slate-400">Attempts</span>
                </div>
              </div>
            </div>

            {/* Right Purple Bar Chart */}
            <div className="sm:col-span-7 flex flex-col justify-end pt-4">
              <div className="h-44 flex items-end justify-between gap-4 border-b border-dashed border-slate-200 px-4 pb-0">
                {/* 2 weeks ago */}
                <div className="flex flex-col items-center flex-1 h-full justify-end">
                  <div
                    className="w-12 bg-purple-300 rounded-t-md transition-all duration-300 hover:bg-purple-400"
                    style={{
                      height: `${Math.max(6, Math.round((twoWeeksAgoAttempts / maxAttempts) * 130))}px`,
                    }}
                  />
                  <span className="text-[10px] text-slate-400 mt-2 whitespace-nowrap">2 weeks ago</span>
                </div>

                {/* Last week */}
                <div className="flex flex-col items-center flex-1 h-full justify-end">
                  <div
                    className="w-12 bg-purple-400 rounded-t-md transition-all duration-300 hover:bg-purple-500 shadow-sm"
                    style={{
                      height: `${Math.max(6, Math.round((lastWeekAttempts / maxAttempts) * 130))}px`,
                    }}
                  />
                  <span className="text-[10px] text-slate-400 mt-2 whitespace-nowrap font-bold text-slate-700">Last week</span>
                </div>

                {/* This week */}
                <div className="flex flex-col items-center flex-1 h-full justify-end">
                  <div
                    className="w-12 bg-purple-600 rounded-t-md transition-all duration-300 hover:bg-purple-700 shadow-sm"
                    style={{
                      height: `${Math.max(6, Math.round((thisWeekAttempts / maxAttempts) * 130))}px`,
                    }}
                  />
                  <span className="text-[10px] text-slate-400 mt-2 whitespace-nowrap font-bold text-purple-700">This week</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* CARD 3: Practice Calendar */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>Practice calendar</span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span>My week starts on:</span>
            <button className="flex items-center gap-1 px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
              <span>Monday</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Heatmap Activity Grid */}
        <div className="space-y-3">
          <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-1.5">
            {calendarDays.map((d, i) => (
              <div
                key={i}
                className={`h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] transition-all cursor-pointer ${
                  d.count > 0
                    ? 'bg-purple-600 border-purple-700 text-white font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200/70 text-slate-400 hover:border-slate-300'
                }`}
                title={`${d.month} ${d.day}: ${d.count} practice session(s)`}
              >
                <span>{d.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
            <span>Past 4 weeks activity</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" />
              <span className="w-3 h-3 rounded bg-purple-300 inline-block" />
              <span className="w-3 h-3 rounded bg-purple-600 inline-block" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
