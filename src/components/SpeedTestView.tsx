import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SessionResult, UserProfile } from '../types';
import { sounds } from '../utils/audio';
import { recordKeyHit } from '../utils/storage';
import { RotateCcw, Timer, Sparkles, Volume2, VolumeX, ShieldAlert, Code2, Quote, FileText, CheckCircle } from 'lucide-react';

interface SpeedTestViewProps {
  profile: UserProfile;
  onUpdateProfile: (p: Partial<UserProfile>) => void;
  onComplete: (result: SessionResult) => void;
}

const QUOTES = [
  "Simplicity is prerequisite for reliability. The greatest victory is that which requires no battle.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "First, solve the problem. Then, write the code. Experience is the name everyone gives to their mistakes.",
  "The only way to go fast, is to go well. Master the foundational habits and speed will naturally follow.",
  "Practice does not make perfect. Only perfect practice makes perfect.",
];

const CODE_SNIPPETS = [
  "function calculateSpeed(words, time) { return Math.round((words / 5) / (time / 60)); }",
  "const [wpm, setWpm] = useState(0); useEffect(() => { computeAccuracy(); }, [input]);",
  "interface TypingSession { id: string; score: number; accuracy: number; completed: boolean; }",
  "export default async function fetchData() { const res = await fetch('/api/stats'); return res.json(); }",
];

const WORD_BANKS = [
  "the quick brown fox jumps over the lazy dog while bright stars shine across the midnight sky and fresh mountain air flows calmly through quiet pine trees where ancient wisdom lives",
  "focus on continuous gentle keystrokes without looking down at the keyboard to build permanent muscle memory and effortless typing velocity",
  "computers are magnificent tools for expanding the human mind when guided by deliberate practice and curious exploration",
];

export const SpeedTestView: React.FC<SpeedTestViewProps> = ({
  profile,
  onUpdateProfile,
  onComplete,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(30); // 15, 30, 60
  const [selectedCategory, setSelectedCategory] = useState<'quotes' | 'code' | 'words' | 'custom'>('words');
  const [customInputText, setCustomInputText] = useState<string>('');
  const [activeText, setActiveText] = useState<string>('');

  const [cursorPos, setCursorPos] = useState<number>(0);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [charErrors, setCharErrors] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const [mistakeKeys, setMistakeKeys] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize text when category changes
  const pickNewText = useCallback(() => {
    let chosen = '';
    if (selectedCategory === 'quotes') {
      chosen = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    } else if (selectedCategory === 'code') {
      chosen = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
    } else if (selectedCategory === 'words') {
      chosen = WORD_BANKS[Math.floor(Math.random() * WORD_BANKS.length)];
    } else {
      chosen = customInputText.trim() || 'Type your custom prompt here to test your speed.';
    }
    setActiveText(chosen);
    setCursorPos(0);
    setUserInput([]);
    setCharErrors([]);
    setTimeLeft(selectedDuration);
    setIsActive(false);
    setTotalKeystrokes(0);
    setMistakeCount(0);
    setMistakeKeys([]);
    if (timerRef.current) clearInterval(timerRef.current);
    containerRef.current?.focus();
  }, [selectedCategory, customInputText, selectedDuration]);

  useEffect(() => {
    pickNewText();
  }, [selectedCategory, selectedDuration]);

  // Countdown timer
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // Finalize speed test
  const handleFinish = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsed = Math.max(1, selectedDuration - timeLeft);
    const mins = elapsed / 60;
    const finalWpm = Math.round((cursorPos / 5) / mins) || 0;
    const finalRawWpm = Math.round((totalKeystrokes / 5) / mins) || 0;
    const finalAccuracy = totalKeystrokes > 0
      ? Math.max(0, Math.round(((totalKeystrokes - mistakeCount) / totalKeystrokes) * 100))
      : 100;

    let stars = 1;
    if (finalAccuracy >= 95 && finalWpm >= 45) stars = 3;
    else if (finalAccuracy >= 88 && finalWpm >= 30) stars = 2;

    const result: SessionResult = {
      title: `Speed Test (${selectedDuration}s)`,
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAccuracy,
      timeSeconds: elapsed,
      charactersTyped: cursorPos,
      errorCount: mistakeCount,
      stars,
      problemKeys: Array.from(new Set(mistakeKeys)).slice(0, 5),
      date: new Date().toLocaleDateString(),
    };

    onComplete(result);
  }, [selectedDuration, timeLeft, cursorPos, totalKeystrokes, mistakeCount, mistakeKeys, onComplete]);

  // Keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      pickNewText();
      return;
    }

    if (
      e.key === 'Shift' ||
      e.key === 'CapsLock' ||
      e.key === 'Control' ||
      e.key === 'Alt' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight'
    ) {
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
    }

    if (!isActive && timeLeft > 0) {
      setIsActive(true);
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (cursorPos > 0) {
        setCursorPos((prev) => prev - 1);
        setUserInput((prev) => prev.slice(0, -1));
        setCharErrors((prev) => prev.slice(0, -1));
        sounds.playKeyClick();
      }
      return;
    }

    if (e.key.length === 1) {
      e.preventDefault();
      const expected = activeText[cursorPos];
      const isCorrect = e.key === expected;

      setTotalKeystrokes((prev) => prev + 1);

      if (isCorrect) {
        if (expected === ' ') sounds.playSpaceThud();
        else sounds.playKeyClick();
        recordKeyHit(expected, false);
      } else {
        sounds.playError();
        setMistakeCount((prev) => prev + 1);
        setMistakeKeys((prev) => [...prev, expected]);
        recordKeyHit(expected, true);
      }

      if (!isCorrect && profile.strictMode) {
        return;
      }

      const nextInput = [...userInput, e.key];
      const nextErrors = [...charErrors, !isCorrect];
      setUserInput(nextInput);
      setCharErrors(nextErrors);

      const nextCursor = cursorPos + 1;
      setCursorPos(nextCursor);

      // If user typed entire prompt before timer ends
      if (nextCursor >= activeText.length) {
        handleFinish();
      }
    }
  };

  const elapsedSoFar = Math.max(1, selectedDuration - timeLeft);
  const liveWpm = Math.round((cursorPos / 5) / (elapsedSoFar / 60)) || 0;
  const liveAccuracy = totalKeystrokes > 0
    ? Math.max(0, Math.round(((totalKeystrokes - mistakeCount) / totalKeystrokes) * 100))
    : 100;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="max-w-5xl mx-auto space-y-6 outline-none select-none"
    >
      {/* Configuration Header */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Timer className="w-6 h-6 text-blue-600" />
            <span>Speed Sprint & Free Practice</span>
          </h1>
          <p className="text-xs text-slate-500">
            Push your typing boundaries with timed sprints, famous quotes, or custom drills.
          </p>
        </div>

        {/* Duration Selectors */}
        <div className="flex items-center gap-2">
          {[15, 30, 60, 120].map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedDuration(sec)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                selectedDuration === sec
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>

      {/* Mode & Category Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setSelectedCategory('words')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedCategory === 'words' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Words</span>
          </button>

          <button
            onClick={() => setSelectedCategory('quotes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedCategory === 'quotes' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
            <span>Quotes</span>
          </button>

          <button
            onClick={() => setSelectedCategory('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedCategory === 'code' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>

          <button
            onClick={() => setSelectedCategory('custom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedCategory === 'custom' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Custom</span>
          </button>
        </div>

        {/* Sound & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextVal = !profile.soundEnabled;
              sounds.setEnabled(nextVal);
              onUpdateProfile({ soundEnabled: nextVal });
            }}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer text-xs"
            title="Toggle Sound"
          >
            {profile.soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={() => {
              onUpdateProfile({ strictMode: !profile.strictMode });
            }}
            className={`p-2 rounded-xl border text-xs cursor-pointer ${
              profile.strictMode ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-400'
            }`}
            title="Strict Mode"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

          <button
            onClick={pickNewText}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart (Esc)</span>
          </button>
        </div>
      </div>

      {/* Custom Text Dialog if selected */}
      {selectedCategory === 'custom' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
          <label className="text-xs font-bold text-slate-700">Paste or type custom practice text:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInputText}
              onChange={(e) => setCustomInputText(e.target.value)}
              placeholder="e.g. The quick brown fox jumps over the lazy dog..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500 font-mono"
            />
            <button
              onClick={pickNewText}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 cursor-pointer"
            >
              Apply Text
            </button>
          </div>
        </div>
      )}

      {/* Live Timer & Stats Card */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Time Left</div>
          <div className="text-3xl font-black font-mono text-blue-600 tabular-nums">
            {timeLeft}s
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Live Speed</div>
          <div className="text-3xl font-black font-mono text-emerald-600 tabular-nums">
            {liveWpm} <span className="text-xs font-bold text-slate-400">WPM</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Accuracy</div>
          <div className="text-3xl font-black font-mono text-indigo-600 tabular-nums">
            {liveAccuracy}%
          </div>
        </div>
      </div>

      {/* Interactive Typing Surface */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <div className="font-mono text-2xl sm:text-3xl tracking-wide leading-relaxed p-5 bg-slate-50 rounded-2xl border border-slate-200/80 min-h-[160px] flex items-center flex-wrap select-none">
          {activeText.split('').map((char, index) => {
            let style = 'text-slate-400';
            const isCursor = index === cursorPos;

            if (index < cursorPos) {
              const err = charErrors[index];
              if (err) {
                style = 'text-rose-600 bg-rose-100 rounded px-0.5 underline';
              } else {
                style = 'text-emerald-700 bg-emerald-100/70 rounded px-0.5';
              }
            } else if (isCursor) {
              style = 'text-slate-900 bg-blue-200 rounded px-0.5 ring-2 ring-blue-500 font-bold animate-pulse';
            }

            return (
              <span key={index} className={`transition-colors duration-75 ${style}`}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <div>
            {!isActive ? (
              <span className="text-blue-600 font-semibold animate-pulse">
                Click here and type any key to begin countdown!
              </span>
            ) : (
              <span>Timer active - maintain rhythm and posture!</span>
            )}
          </div>
          <span>Esc to restart test</span>
        </div>
      </div>
    </div>
  );
};
