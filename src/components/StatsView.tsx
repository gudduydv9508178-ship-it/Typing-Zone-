import React, { useState } from 'react';
import { SessionResult, UserProfile, LessonProgress } from '../types';
import { getKeyAccuracyStats } from '../utils/storage';
import { KEYBOARD_ROWS } from '../utils/keyboard';
import { Trophy, Zap, Target, Clock, Activity, BarChart3, Star, AlertCircle, RefreshCw } from 'lucide-react';

interface StatsViewProps {
  sessions: SessionResult[];
  progress: Record<number, LessonProgress>;
  profile: UserProfile;
  onClearStats: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  sessions,
  progress,
  profile,
  onClearStats,
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const keyStats = getKeyAccuracyStats();

  // Metrics calculations
  const totalCompleted = Object.values(progress).filter((p) => p.completed).length;
  const bestWpm = sessions.reduce((max, s) => Math.max(max, s.wpm), 0);
  const avgWpm = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.wpm, 0) / sessions.length)
    : 0;
  const avgAccuracy = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length)
    : 100;
  const totalPracticeSeconds = sessions.reduce((acc, s) => acc + s.timeSeconds, 0);
  const practiceMinutes = Math.round(totalPracticeSeconds / 60);

  // Level determination for 100 lessons
  const getLevel = () => {
    if (totalCompleted >= 80 && bestWpm >= 60) return { title: 'Keyboard Maestro 👑', level: 5 };
    if (totalCompleted >= 50 && bestWpm >= 45) return { title: 'Speed Artisan ⚡', level: 4 };
    if (totalCompleted >= 25 && bestWpm >= 30) return { title: 'Tactile Scout 🎯', level: 3 };
    if (totalCompleted >= 8 && bestWpm >= 20) return { title: 'Steady Apprentice 🌟', level: 2 };
    return { title: 'Novice Typist 🐣', level: 1 };
  };

  const levelInfo = getLevel();

  // Identify top 3 problem keys
  const problemKeysList = Object.values(keyStats)
    .filter((k) => k.totalHits >= 3 && k.accuracy < 90)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const getKeyColor = (keyChar: string) => {
    const stat = keyStats[keyChar.toLowerCase()];
    if (!stat || stat.totalHits === 0) return 'bg-slate-800 text-slate-400 border-slate-700';
    if (stat.accuracy >= 95) return 'bg-emerald-600/80 text-white border-emerald-400';
    if (stat.accuracy >= 88) return 'bg-emerald-800/80 text-emerald-100 border-emerald-600';
    if (stat.accuracy >= 75) return 'bg-amber-600/80 text-white border-amber-400';
    return 'bg-rose-600/80 text-white border-rose-400 animate-pulse';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      {/* Top Level Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl shadow-inner shrink-0">
            {profile.avatar}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">
              Typist Profile · Level {levelInfo.level}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {levelInfo.title}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-lg mt-0.5">
              Rank calculated from your accuracy consistency, completed lessons, and peak WPM.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl text-center">
            <div className="text-[10px] text-blue-200 uppercase font-bold">Total Lessons</div>
            <div className="text-2xl font-black font-mono text-white">{totalCompleted} / 100</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Best Speed</span>
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 tabular-nums">
            {bestWpm} <span className="text-sm font-bold text-slate-400">WPM</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Personal Record</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Average Speed</span>
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 tabular-nums">
            {avgWpm} <span className="text-sm font-bold text-slate-400">WPM</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Across all sessions</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Accuracy</span>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600 tabular-nums">
            {avgAccuracy}<span className="text-sm font-bold text-slate-400">%</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Keystroke precision</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Practice Time</span>
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 tabular-nums">
            {practiceMinutes} <span className="text-sm font-bold text-slate-400">min</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">{totalPracticeSeconds} seconds active</div>
        </div>
      </div>

      {/* Accuracy Heatmap Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Keyboard Accuracy Heatmap</span>
            </h2>
            <p className="text-xs text-slate-500">
              Visualizes your error rate on each key. Hover on any key for detailed stats.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> 95%+
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-700 inline-block" /> 88-94%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block" /> 75-87%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block" /> &lt;75% (Weak)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-slate-700 inline-block" /> Untested
            </span>
          </div>
        </div>

        {/* Heatmap Visual Board */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
          <div className="flex flex-col gap-1.5 min-w-[580px]">
            {KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-1.5 justify-center">
                {row.map((k, kIdx) => {
                  const keyChar = k.key;
                  const stat = keyStats[keyChar.toLowerCase()];
                  const color = getKeyColor(keyChar);
                  const isHovered = hoveredKey === keyChar.toLowerCase();

                  return (
                    <div
                      key={kIdx}
                      onMouseEnter={() => setHoveredKey(keyChar.toLowerCase())}
                      onMouseLeave={() => setHoveredKey(null)}
                      className={`relative flex items-center justify-center h-10 rounded-lg border font-mono text-xs font-bold transition-all ${
                        k.width || 'flex-1'
                      } ${color} ${isHovered ? 'scale-110 z-20 ring-2 ring-white shadow-lg' : ''}`}
                    >
                      <span className="uppercase">{k.display || k.key}</span>

                      {/* Tooltip on hover */}
                      {isHovered && stat && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg border border-slate-700 whitespace-nowrap z-30 font-sans">
                          {stat.accuracy}% acc · {stat.totalHits} hits ({stat.errors} err)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Problem keys callout if present */}
        {problemKeysList.length > 0 && (
          <div className="flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Keys needing attention: </span>
              <span>
                {problemKeysList.map((k) => `"${k.key}" (${k.accuracy}% accuracy)`).join(', ')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recent Sessions Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Sessions</h2>
          {sessions.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Reset all typing history and stats?')) {
                  onClearStats();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No typing sessions recorded yet. Complete a lesson to see your historical analytics!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Session</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Speed</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Stars</th>
                  <th className="py-2.5 px-3">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.slice(0, 10).map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{s.title}</td>
                    <td className="py-3 px-3 text-slate-500 text-xs">{s.date}</td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">{s.wpm} WPM</td>
                    <td className="py-3 px-3 font-mono font-semibold text-emerald-600">{s.accuracy}%</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3].map((starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-3.5 h-3.5 ${
                              starIdx <= s.stars ? 'fill-amber-400 stroke-amber-400' : 'text-slate-200 stroke-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-xs">{s.timeSeconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
