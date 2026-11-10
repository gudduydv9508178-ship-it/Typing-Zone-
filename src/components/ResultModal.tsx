import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { SessionResult } from '../types';
import { RotateCcw, ArrowRight, Star, CheckCircle, Award } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ResultModalProps {
  result: SessionResult;
  isNewHighScore?: boolean;
  previousBestScore?: number;
  onRetry: () => void;
  onNext?: () => void;
  onCurriculum: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  result,
  isNewHighScore = false,
  previousBestScore,
  onRetry,
  onNext,
  onCurriculum,
}) => {
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const targetScore = Math.round(result.wpm * 10 * (result.accuracy / 100)) + result.stars * 50;

  const isAccuracyPassed = result.accuracy >= 80;
  const isSpeedPassed = result.lessonId && result.lessonId >= 89 && result.lessonId < 1000 ? result.wpm >= 10 : true;
  const isPassed = isAccuracyPassed && isSpeedPassed && result.stars > 0;

  useEffect(() => {
    if (isPassed) {
      sounds.playSuccess();

      // Double celebratory confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.25, y: 0.5 },
        colors: ['#38bdf8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffd700'],
      });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.75, y: 0.5 },
        colors: ['#38bdf8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffd700'],
      });

      // Sequential star pop sound effects
      const timers: NodeJS.Timeout[] = [];
      for (let s = 1; s <= result.stars; s++) {
        const timer = setTimeout(() => {
          sounds.playStarPop(s);
        }, (0.2 + s * 0.18) * 1000);
        timers.push(timer);
      }

      // Stamp sound if high score
      if (isNewHighScore) {
        const stampTimer = setTimeout(() => {
          sounds.playStamp();
        }, 900);
        timers.push(stampTimer);
      }

      return () => {
        timers.forEach((t) => clearTimeout(t));
      };
    } else {
      sounds.playFailure();
    }
  }, [isPassed, result.stars, isNewHighScore]);

  useEffect(() => {
    // Score counter animation
    const duration = 1200;
    const steps = 30;
    const increment = targetScore / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [targetScore]);

  // Pressing Enter automatically triggers Next lesson (if passed) or Retry (if failed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isPassed) {
          if (onNext) onNext();
          else onCurriculum();
        } else {
          onRetry();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPassed, onNext, onCurriculum, onRetry]);

  // Arc angles and vertical translation for 5 stars in an arc
  const arcOffsets = [
    { rotate: -24, y: 14 },
    { rotate: -12, y: 4 },
    { rotate: 0, y: 0 },
    { rotate: 12, y: 4 },
    { rotate: 24, y: 14 },
  ];

  const durationMin = Math.floor(result.timeSeconds / 60);
  const durationSec = result.timeSeconds % 60;
  const durationStr = `${durationMin}:${String(durationSec).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050b1d]/85 backdrop-blur-md overflow-y-auto select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
        className="relative w-full max-w-xl bg-gradient-to-b from-[#111e48] via-[#0b1638] to-[#070e28] rounded-[36px] p-7 sm:p-9 text-white shadow-2xl border border-blue-400/25 overflow-hidden text-center"
      >
        {/* Ambient starburst glow behind the stars */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-80 h-52 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Optional "NEW HIGH SCORE" Stamp if high score */}
        {isNewHighScore && (
          <div className="absolute top-6 right-6 z-20 transform rotate-12 animate-in zoom-in duration-300">
            <span className="px-3.5 py-1 rounded-lg border-2 border-amber-400 bg-amber-500/20 text-amber-300 font-black text-[11px] tracking-widest shadow-[0_0_15px_rgba(251,191,36,0.5)]">
              NEW HIGH SCORE
            </span>
          </div>
        )}

        {/* 1. FIVE GOLDEN 3D STARS IN AN ARC */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 pt-2 pb-5 relative z-10">
          {[1, 2, 3, 4, 5].map((starIdx) => {
            const isEarned = starIdx <= result.stars;
            const arc = arcOffsets[starIdx - 1];

            return (
              <motion.div
                key={starIdx}
                initial={{ scale: 0, rotate: -40, y: -20 }}
                animate={{
                  scale: isEarned ? 1.08 : 0.95,
                  rotate: arc.rotate,
                  y: arc.y,
                }}
                transition={{
                  type: 'spring',
                  damping: 11,
                  stiffness: 240,
                  delay: 0.15 + starIdx * 0.12,
                }}
                className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border transition-all ${
                  isEarned
                    ? 'bg-gradient-to-tr from-[#f59e0b] via-[#fbbf24] to-[#fef08a] border-yellow-200 text-white shadow-[0_0_24px_rgba(245,158,11,0.65)]'
                    : 'bg-[#15234d]/60 border-blue-900/40 text-slate-600'
                }`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 ${
                    isEarned ? 'fill-white stroke-white drop-shadow-md' : 'stroke-slate-600 fill-transparent'
                  }`}
                />
              </motion.div>
            );
          })}
        </div>

        {/* 2. BIG ANIMATED COUNTING SCORE */}
        <div className="relative z-10 mb-2">
          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-md">
            {animatedScore.toLocaleString()}
          </div>
          <div className="text-xs uppercase tracking-widest font-semibold text-blue-300/80 mt-0.5">
            Total Score
          </div>
          {previousBestScore !== undefined && previousBestScore > 0 && (
            <div className="text-[11px] font-mono text-blue-300/60 mt-1">
              Previous best: {previousBestScore.toLocaleString()}
            </div>
          )}
        </div>

        {/* 3. ENCOURAGING / PASS-FAIL MESSAGE */}
        <div className="relative z-10 mb-6">
          {isPassed ? (
            <p className="text-sm sm:text-base font-bold text-blue-100">
              {result.accuracy >= 98
                ? 'Flawless performance! Time to move on to the next lesson.'
                : result.accuracy >= 90
                ? 'Nice job! Time to move on to the next lesson.'
                : 'Great effort! Ready for the next challenge.'}
            </p>
          ) : (
            <div className="bg-rose-500/20 border border-rose-500/40 rounded-2xl py-2 px-4 inline-block">
              <p className="text-sm font-bold text-rose-200">
                Lesson not passed. Minimum 80% accuracy {result.lessonId && result.lessonId >= 89 ? 'and 10 WPM' : ''} required to advance.
              </p>
            </div>
          )}
        </div>

        {/* 4. THREE GLASSMORPHIC METRIC BOXES */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 relative z-10">
          
          {/* Box 1: Duration */}
          <div className="bg-[#162557]/60 backdrop-blur-md border border-blue-400/20 rounded-2xl p-3.5 sm:p-4 text-center">
            <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-1">
              Duration
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">
              {durationStr}
            </div>
          </div>

          {/* Box 2: Speed + Green Checkmark Badge */}
          <div className="relative bg-[#162557]/60 backdrop-blur-md border border-blue-400/20 rounded-2xl p-3.5 sm:p-4 text-center">
            {isSpeedPassed && (
              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
            <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-1">
              Speed
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">
              {result.wpm} <span className="text-xs font-normal text-blue-200">wpm</span>
            </div>
          </div>

          {/* Box 3: Accuracy + Green Checkmark Badge */}
          <div className="relative bg-[#162557]/60 backdrop-blur-md border border-blue-400/20 rounded-2xl p-3.5 sm:p-4 text-center">
            {isAccuracyPassed && (
              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
            <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-1">
              Accuracy
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">
              {result.accuracy}<span className="text-sm font-normal text-blue-200">%</span>
            </div>
          </div>

        </div>

        {/* 5. REQUIREMENTS SUB-LINE (Exact Match to user specification) */}
        <div className="text-[11px] text-blue-200/70 font-medium mb-7 relative z-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>Real accuracy: <b>{result.accuracy}%</b></span>
          <span>·</span>
          <span>Required accuracy: <b>80%</b></span>
          <span>·</span>
          <span>Required speed: <b>10 wpm</b></span>
          <span>·</span>
          <span>Goal speed: <b>20 wpm</b></span>
        </div>

        {/* 6. ACTION BUTTONS: Try again always present; Next ONLY if passed */}
        <div className="flex items-center justify-end gap-3.5 relative z-10 pt-2 border-t border-blue-500/20">
          <button
            onClick={onRetry}
            className={`flex items-center gap-2 py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
              isPassed
                ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-lg shadow-blue-600/40'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try again</span>
            {!isPassed && <span className="text-[10px] opacity-75 font-normal ml-0.5">(↵)</span>}
          </button>

          {isPassed && (
            onNext ? (
              <button
                onClick={onNext}
                className="flex items-center gap-2 py-3 px-7 rounded-2xl bg-[#2563eb] hover:bg-blue-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-600/40 hover:shadow-xl transition-all cursor-pointer ring-2 ring-blue-400/30 active:scale-95"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
                <span className="text-[10px] opacity-75 font-normal ml-0.5">(↵)</span>
              </button>
            ) : (
              <button
                onClick={onCurriculum}
                className="flex items-center gap-2 py-3 px-7 rounded-2xl bg-[#2563eb] hover:bg-blue-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-600/40 hover:shadow-xl transition-all cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
                <span className="text-[10px] opacity-75 font-normal ml-0.5">(↵)</span>
              </button>
            )
          )}
        </div>

      </motion.div>
    </div>
  );
};
