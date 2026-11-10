import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lesson, SessionResult, UserProfile, TypingTheme, FontSize, FontFamily, KeyboardStyle, HandGuideMode } from '../types';
import { TypingKeyboard } from './TypingKeyboard';
import { sounds } from '../utils/audio';
import { recordKeyHit } from '../utils/storage';
import { HINDI_INSCRIPT_MAP } from '../utils/hindiKeyboard';
import {
  ChevronLeft,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Hand,
  Keyboard,
  Type,
  Check,
} from 'lucide-react';

interface WordSpeed {
  wordIndex: number;
  wpm: number;
  label?: string;
}

interface LessonPracticeProps {
  lesson: Lesson;
  profile: UserProfile;
  onUpdateProfile: (p: Partial<UserProfile>) => void;
  onBack: () => void;
  onComplete: (result: SessionResult) => void;
}

export const LessonPractice: React.FC<LessonPracticeProps> = ({
  lesson,
  profile,
  onUpdateProfile,
  onBack,
  onComplete,
}) => {
  const text = lesson.text;
  const isHindi = lesson.course === 'hindi';
  const displayLessonNum = isHindi ? lesson.id - 1000 : lesson.id;
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [charErrors, setCharErrors] = useState<boolean[]>([]);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const [mistakeKeys, setMistakeKeys] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isVibrating, setIsVibrating] = useState<boolean>(false);
  const [lastWrongPrompt, setLastWrongPrompt] = useState<string | null>(null);

  // Settings & Toggles from Profile or defaults
  const [showLiveStats, setShowLiveStats] = useState<boolean>(profile.showLiveStats ?? true);
  const [showSpeedOnWord, setShowSpeedOnWord] = useState<boolean>(profile.showSpeedOnWord ?? true);
  const [blockOnError, setBlockOnError] = useState<boolean>(profile.strictMode ?? false);
  const [keyboardSound, setKeyboardSound] = useState<boolean>(profile.soundEnabled ?? true);
  const [voiceOver, setVoiceOver] = useState<boolean>(profile.voiceOverEnabled ?? false);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(profile.showKeyboard ?? true);
  const [handGuideMode, setHandGuideMode] = useState<HandGuideMode>(profile.handGuideMode ?? 'both');
  const [keyboardStyle, setKeyboardStyle] = useState<KeyboardStyle>(profile.keyboardStyle ?? 'default');
  const [theme, setTheme] = useState<TypingTheme>(profile.theme ?? 'clean');
  const [fontSize, setFontSize] = useState<FontSize>(profile.fontSize ?? 'default');
  const [fontFamily, setFontFamily] = useState<FontFamily>(profile.fontFamily ?? 'droid-sans-mono');
  const [accessibleFont, setAccessibleFont] = useState<boolean>(profile.fontSize === 'accessible');

  // Word speeds
  const [wordSpeeds, setWordSpeeds] = useState<Record<number, WordSpeed>>({});
  const lastWordEndTimeRef = useRef<number | null>(null);

  // Active dropdown modal: 'settings' | 'sound' | 'hand' | 'keyboard' | 'font' | null
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus container on mount
  useEffect(() => {
    containerRef.current?.focus();
  }, [lesson]);

  // Voice over: speak current key
  const speakCurrentKey = useCallback((char: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const speakText =
        char === ' ' ? 'Space' :
        char === '\n' ? 'Enter' :
        char === ':' ? 'Colon' :
        char === ';' ? 'Semicolon' :
        char === ',' ? 'Comma' :
        char === '.' ? 'Period' :
        char === '/' ? 'Slash' :
        char === '-' ? 'Hyphen' :
        char;
      const utterance = new SpeechSynthesisUtterance(speakText);
      utterance.rate = 1.35;
      utterance.volume = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (voiceOver && cursorPos < text.length) {
      speakCurrentKey(text[cursorPos]);
    }
  }, [cursorPos, voiceOver, text, speakCurrentKey]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleWindowClick = () => {
      setActiveDropdown(null);
    };
    if (activeDropdown) {
      window.addEventListener('click', handleWindowClick);
      return () => window.removeEventListener('click', handleWindowClick);
    }
  }, [activeDropdown]);

  // Timer updater
  useEffect(() => {
    if (hasStarted && startTime) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(Math.max(1, Math.floor((Date.now() - startTime) / 1000)));
      }, 300);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, startTime]);

  // Restart lesson immediately
  const handleReset = useCallback(() => {
    setCursorPos(0);
    setUserInput([]);
    setCharErrors([]);
    setPressedKeys(new Set());
    setStartTime(null);
    setElapsedSeconds(0);
    setTotalKeystrokes(0);
    setMistakeCount(0);
    setMistakeKeys([]);
    setHasStarted(false);
    setWordSpeeds({});
    setLastWrongPrompt(null);
    lastWordEndTimeRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    containerRef.current?.focus();
  }, []);

  // Compute live metrics starting at 0 WPM and 100%
  const correctCount = userInput.filter((char, idx) => char === text[idx]).length;
  const minutes = Math.max(0.01, elapsedSeconds / 60);
  const currentWpm = hasStarted ? Math.round((correctCount / 5) / minutes) || 0 : 0;
  const currentAccuracy = totalKeystrokes > 0
    ? Math.max(0, Math.round(((totalKeystrokes - mistakeCount) / totalKeystrokes) * 100))
    : 100;

  const currentTargetChar = cursorPos < text.length ? text[cursorPos] : '';
  const progressPercent = Math.min(100, Math.round((cursorPos / text.length) * 100));

  // Finish lesson handler
  const finishLesson = useCallback(
    (finalKeystrokes: number, finalMistakes: number, finalMistakeKeys: string[], finalElapsed: number) => {
      if (timerRef.current) clearInterval(timerRef.current);

      const finalMinutes = Math.max(0.01, finalElapsed / 60);
      const finalWpm = Math.round((text.length / 5) / finalMinutes) || 0;
      const finalRawWpm = Math.round((finalKeystrokes / 5) / finalMinutes) || 0;
      const finalAccuracy = finalKeystrokes > 0
        ? Math.max(0, Math.round(((finalKeystrokes - finalMistakes) / finalKeystrokes) * 100))
        : 100;

      // Passing criteria:
      // Minimum 80% accuracy for all lessons
      // For lessons >= 89 (Basic Level 1 & up), also require >= 10 WPM
      const isAccuracyPassed = finalAccuracy >= 80;
      const isSpeedPassed = lesson.id >= 89 && lesson.id < 1000 ? finalWpm >= 10 : true;
      const isPassed = isAccuracyPassed && isSpeedPassed;

      // 5-Star Calculation based on actual WPM and accuracy (0 stars if not passed)
      let stars = 0;
      if (isPassed) {
        if (finalAccuracy >= 98 && finalWpm >= 20) {
          stars = 5;
        } else if (finalAccuracy >= 95 && finalWpm >= 15) {
          stars = 4;
        } else if (finalAccuracy >= 90) {
          stars = 3;
        } else if (finalAccuracy >= 85) {
          stars = 2;
        } else {
          stars = 1;
        }
      }

      const problemKeys = Array.from(new Set(finalMistakeKeys)).slice(0, 5);

      const result: SessionResult = {
        lessonId: lesson.id,
        title: lesson.title,
        wpm: finalWpm,
        rawWpm: finalRawWpm,
        accuracy: finalAccuracy,
        timeSeconds: Math.max(1, finalElapsed),
        charactersTyped: text.length,
        errorCount: finalMistakes,
        stars,
        problemKeys,
        date: new Date().toISOString(),
      };

      onComplete(result);
    },
    [lesson, text.length, onComplete]
  );

  // Key Down Handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!e.key || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        handleReset();
        return;
      }

      if (cursorPos >= text.length) {
        return;
      }

      setPressedKeys((prev) => new Set(prev).add(e.key.toLowerCase()));

      if (
        e.key === 'Shift' ||
        e.key === 'CapsLock' ||
        e.key === 'Control' ||
        e.key === 'Alt' ||
        e.key === 'Meta' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown'
      ) {
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
      }

      let currentStartTime = startTime;
      const now = Date.now();
      if (!hasStarted) {
        setHasStarted(true);
        currentStartTime = now;
        setStartTime(currentStartTime);
        lastWordEndTimeRef.current = now;
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (cursorPos > 0) {
          setCursorPos((prev) => prev - 1);
          setUserInput((prev) => prev.slice(0, -1));
          setCharErrors((prev) => prev.slice(0, -1));
          setLastWrongPrompt(null);
          if (keyboardSound) sounds.playKeyClick();
        }
        return;
      }

      // Check character input
      if (e.key.length === 1 || e.key === 'Enter') {
        e.preventDefault();
        const expected = text[cursorPos];
        if (!expected) return;
        const rawInputChar = e.key === 'Enter' ? '\n' : e.key;
        const inputChar =
          isHindi && rawInputChar !== '\n' && HINDI_INSCRIPT_MAP[rawInputChar]
            ? HINDI_INSCRIPT_MAP[rawInputChar]
            : rawInputChar;
        const isCorrect = inputChar === expected;

        setTotalKeystrokes((prev) => prev + 1);

        if (isCorrect) {
          setLastWrongPrompt(null);
          if (keyboardSound) {
            if (expected === ' ') sounds.playSpaceThud();
            else sounds.playKeyClick();
          }
          recordKeyHit(expected, false);

          // If space or end of word, compute word speed
          if (expected === ' ' || cursorPos === text.length - 1) {
            const wordStart = lastWordEndTimeRef.current || currentStartTime || now;
            const diffSeconds = Math.max(0.18, (now - wordStart) / 1000);
            const wordWpm = Math.min(100, Math.max(10, Math.round((5 / 5) / (diffSeconds / 60))));
            lastWordEndTimeRef.current = now;

            setWordSpeeds((prev) => ({
              ...prev,
              [cursorPos]: {
                wordIndex: cursorPos,
                wpm: wordWpm,
                label: wordWpm >= 30 ? 'Good' : undefined,
              },
            }));
          }

          const nextInput = [...userInput, inputChar];
          const nextErrors = [...charErrors, false];
          setUserInput(nextInput);
          setCharErrors(nextErrors);

          const nextCursor = cursorPos + 1;
          setCursorPos(nextCursor);

          // Lesson finished
          if (nextCursor >= text.length) {
            const finalDuration = currentStartTime
              ? Math.max(1, Math.round((now - currentStartTime) / 1000))
              : elapsedSeconds;
            finishLesson(totalKeystrokes + 1, mistakeCount, mistakeKeys, finalDuration);
          }
        } else {
          // Wrong key hit
          if (keyboardSound) sounds.playError();
          setIsVibrating(true);
          setTimeout(() => setIsVibrating(false), 180);

          const promptKey = expected === ' ' ? 'Space' : expected === '\n' ? 'Enter' : expected.toUpperCase();
          setLastWrongPrompt(`Press ${promptKey}`);

          setMistakeCount((prev) => prev + 1);
          setMistakeKeys((prev) => [...prev, expected]);
          recordKeyHit(expected, true);

          if (blockOnError) {
            // Block on error: do not advance cursor until correct key is typed
            return;
          } else {
            // Record error and advance
            const nextInput = [...userInput, inputChar];
            const nextErrors = [...charErrors, true];
            setUserInput(nextInput);
            setCharErrors(nextErrors);

            const nextCursor = cursorPos + 1;
            setCursorPos(nextCursor);

            if (nextCursor >= text.length) {
              const finalDuration = currentStartTime
                ? Math.max(1, Math.round((now - currentStartTime) / 1000))
                : elapsedSeconds;
              finishLesson(totalKeystrokes + 1, mistakeCount + 1, [...mistakeKeys, expected], finalDuration);
            }
          }
        }
      }
    },
    [
      startTime,
      hasStarted,
      cursorPos,
      text,
      keyboardSound,
      blockOnError,
      userInput,
      charErrors,
      totalKeystrokes,
      mistakeCount,
      mistakeKeys,
      handleReset,
      finishLesson,
      elapsedSeconds,
    ]
  );

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(e.key.toLowerCase());
      return next;
    });
  }, []);

  // Split text into lines of ~32-38 characters breaking cleanly on spaces or explicit newlines
  const lines = React.useMemo(() => {
    const result: {
      lineIndex: number;
      startIndex: number;
      endIndex: number;
      text: string;
      words: { word: string; startIndex: number; endIndex: number }[];
    }[] = [];

    const rawWords: { word: string; startIndex: number; endIndex: number }[] = [];
    let curWord = '';
    let curStart = 0;

    for (let i = 0; i < text.length; i++) {
      curWord += text[i];
      if (text[i] === ' ' || text[i] === '\n' || i === text.length - 1) {
        rawWords.push({
          word: curWord,
          startIndex: curStart,
          endIndex: i,
        });
        curWord = '';
        curStart = i + 1;
      }
    }

    let lineWords: { word: string; startIndex: number; endIndex: number }[] = [];
    let lineCharCount = 0;
    const maxLineChars = fontSize === 'small' ? 44 : fontSize === 'large' ? 32 : 36;

    for (let i = 0; i < rawWords.length; i++) {
      const w = rawWords[i];
      const wordLen = w.word.length;

      if (lineWords.length > 0 && (lineCharCount + wordLen > maxLineChars || w.word.includes('\n'))) {
        const firstW = lineWords[0];
        const lastW = lineWords[lineWords.length - 1];
        result.push({
          lineIndex: result.length,
          startIndex: firstW.startIndex,
          endIndex: lastW.endIndex,
          text: text.slice(firstW.startIndex, lastW.endIndex + 1),
          words: lineWords,
        });
        lineWords = [w];
        lineCharCount = wordLen;
      } else {
        lineWords.push(w);
        lineCharCount += wordLen;
      }
    }

    if (lineWords.length > 0) {
      const firstW = lineWords[0];
      const lastW = lineWords[lineWords.length - 1];
      result.push({
        lineIndex: result.length,
        startIndex: firstW.startIndex,
        endIndex: lastW.endIndex,
        text: text.slice(firstW.startIndex, lastW.endIndex + 1),
        words: lineWords,
      });
    }

    return result;
  }, [text, fontSize]);

  // Find active line index
  const activeLineIndex = Math.max(
    0,
    lines.findIndex((l) => cursorPos >= l.startIndex && cursorPos <= l.endIndex)
  );

  // Visible lines window (3 lines at a time, smooth line transitions)
  const visibleLinesCount = fontSize === 'small' ? 4 : 3;
  const startLineIdx = Math.max(0, activeLineIndex - 0);
  const visibleLines = lines.slice(startLineIdx, startLineIdx + visibleLinesCount);

  // Visual background theme styling
  const getThemeBackgroundClass = () => {
    switch (theme) {
      case 'dark':
        return 'bg-[#0f172a] text-slate-100';
      case 'beach':
        return 'bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#fed7aa] text-slate-900';
      case 'space':
        return 'bg-gradient-to-b from-[#030712] via-[#0b132b] to-[#1c2541] text-white';
      case 'nature':
        return 'bg-gradient-to-b from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0] text-emerald-950';
      case 'car':
        return 'bg-[#fff9e6] text-slate-900';
      case 'clean':
      default:
        return 'bg-white text-slate-900';
    }
  };

  // Font size classes
  const getFontSizeClass = () => {
    if (accessibleFont || fontSize === 'accessible') {
      return 'text-4xl sm:text-5xl leading-relaxed tracking-wide';
    }
    switch (fontSize) {
      case 'small':
        return 'text-2xl sm:text-3xl leading-normal tracking-wide';
      case 'large':
        return 'text-4xl sm:text-[42px] leading-relaxed tracking-wide';
      case 'extra-large':
        return 'text-4xl sm:text-5xl leading-relaxed tracking-wide';
      case 'default':
      default:
        return 'text-3xl sm:text-4xl leading-relaxed tracking-wide';
    }
  };

  // Font family inline or class
  const getFontFamilyStyle = () => {
    if (isHindi) {
      return { fontFamily: "'Noto Sans Devanagari', 'Mangal', 'Nirmala UI', sans-serif" };
    }
    switch (fontFamily) {
      case 'roboto-mono':
        return { fontFamily: "'Roboto Mono', monospace" };
      case 'jetbrains-mono':
        return { fontFamily: "'JetBrains Mono', monospace" };
      case 'droid-sans-mono':
      default:
        return { fontFamily: "'Droid Sans Mono', monospace" };
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      className={`h-screen max-h-screen overflow-hidden outline-none select-none flex flex-col justify-between transition-colors duration-300 relative ${getThemeBackgroundClass()} ${
        isVibrating ? 'animate-pulse' : ''
      }`}
    >
      {/* ============================================================== */}
      {/* 1. CLEAN TOP HEADER BAR (Exact TypingClub UI)                  */}
      {/* Left: < {lesson.id}. {lesson.title}                            */}
      {/* Right Action Icons in exact order:                             */}
      {/* 1. Restart Icon                                                */}
      {/* 2. Settings Gear Icon                                          */}
      {/* 3. Sound/Speaker Icon                                          */}
      {/* 4. Hand Guide Icon                                             */}
      {/* 5. Keyboard Icon                                               */}
      {/* 6. Font & Theme Icon (A)                                       */}
      {/* ============================================================== */}
      <header className="w-full px-5 py-3 flex items-center justify-between border-b border-slate-200/80 bg-white/70 backdrop-blur-md relative z-40 shadow-2xs">
        
        {/* Left Side: Back Arrow (<) + Lesson Number and Name */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-800 hover:text-blue-600 font-bold text-sm sm:text-base tracking-tight transition-colors cursor-pointer"
          title="Back to Lesson Map"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          <span>
            {displayLessonNum}. {lesson.title}
          </span>
        </button>

        {/* Right Side Action Icons in EXACT requested order */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-slate-700">
          
          {/* 1. RESTART ICON: Immediately restarts current lesson */}
          <button
            onClick={handleReset}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-700 hover:text-slate-900"
            title="Restart Lesson"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* 2. SETTINGS GEAR ICON */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'settings' ? null : 'settings');
              }}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                activeDropdown === 'settings' ? 'bg-slate-200 text-blue-600' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4 stroke-[2]" />
            </button>

            {activeDropdown === 'settings' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 text-xs font-semibold z-50 text-slate-800 space-y-3 animate-in fade-in zoom-in-95"
              >
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Settings
                </div>
                <label className="flex items-center justify-between cursor-pointer py-1 hover:text-blue-600">
                  <span>Show live WPM and accuracy</span>
                  <input
                    type="checkbox"
                    checked={showLiveStats}
                    onChange={(e) => {
                      setShowLiveStats(e.target.checked);
                      onUpdateProfile({ showLiveStats: e.target.checked });
                    }}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer py-1 hover:text-blue-600">
                  <span>Show speed on each word</span>
                  <input
                    type="checkbox"
                    checked={showSpeedOnWord}
                    onChange={(e) => {
                      setShowSpeedOnWord(e.target.checked);
                      onUpdateProfile({ showSpeedOnWord: e.target.checked });
                    }}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer py-1 hover:text-blue-600">
                  <span>Block on error(s)</span>
                  <input
                    type="checkbox"
                    checked={blockOnError}
                    onChange={(e) => {
                      setBlockOnError(e.target.checked);
                      onUpdateProfile({ strictMode: e.target.checked });
                    }}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>

          {/* 3. SOUND/SPEAKER ICON */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'sound' ? null : 'sound');
              }}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                activeDropdown === 'sound' ? 'bg-slate-200 text-blue-600' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Sound Options"
            >
              {keyboardSound ? <Volume2 className="w-4 h-4 stroke-[2]" /> : <VolumeX className="w-4 h-4 stroke-[2]" />}
            </button>

            {activeDropdown === 'sound' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 text-xs font-semibold z-50 text-slate-800 space-y-3 animate-in fade-in zoom-in-95"
              >
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Audio & Voice
                </div>
                <label className="flex items-center justify-between cursor-pointer py-1 hover:text-blue-600">
                  <span>Keyboard sound</span>
                  <input
                    type="checkbox"
                    checked={keyboardSound}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setKeyboardSound(next);
                      sounds.setEnabled(next);
                      onUpdateProfile({ soundEnabled: next });
                    }}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer py-1 hover:text-blue-600">
                  <span>Voice over (speaks keys)</span>
                  <input
                    type="checkbox"
                    checked={voiceOver}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setVoiceOver(next);
                      onUpdateProfile({ voiceOverEnabled: next });
                    }}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>

          {/* 4. HAND GUIDE ICON */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'hand' ? null : 'hand');
              }}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                activeDropdown === 'hand' ? 'bg-slate-200 text-blue-600' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Hand Guide"
            >
              <Hand className="w-4 h-4 stroke-[2]" />
            </button>

            {activeDropdown === 'hand' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 text-xs font-semibold z-50 text-slate-800 space-y-3 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Hand Guide
                  </span>
                  <input
                    type="checkbox"
                    checked={handGuideMode !== 'off'}
                    onChange={(e) => {
                      const mode = e.target.checked ? 'both' : 'off';
                      setHandGuideMode(mode);
                      onUpdateProfile({ handGuideMode: mode });
                    }}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-100">
                  {[
                    { id: 'both', label: 'Both hands' },
                    { id: 'left', label: 'Left hand' },
                    { id: 'right', label: 'Right hand' },
                  ].map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        setHandGuideMode(h.id as HandGuideMode);
                        onUpdateProfile({ handGuideMode: h.id as HandGuideMode });
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-between ${
                        handGuideMode === h.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{h.label}</span>
                      {handGuideMode === h.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. KEYBOARD ICON */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'keyboard' ? null : 'keyboard');
              }}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                activeDropdown === 'keyboard' ? 'bg-slate-200 text-blue-600' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Keyboard Options"
            >
              <Keyboard className="w-4 h-4 stroke-[2]" />
            </button>

            {activeDropdown === 'keyboard' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 text-xs font-semibold z-50 text-slate-800 space-y-3 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    On-Screen Keyboard
                  </span>
                  <input
                    type="checkbox"
                    checked={showKeyboard}
                    onChange={(e) => {
                      setShowKeyboard(e.target.checked);
                      onUpdateProfile({ showKeyboard: e.target.checked });
                    }}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100">
                  Keyboard Style
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'default', label: 'Default' },
                    { id: 'minimal', label: 'Minimal' },
                    { id: 'cartoon', label: 'Cartoon' },
                    { id: 'classic', label: 'Classic' },
                    { id: 'modern', label: 'Modern' },
                    { id: 'colorful', label: 'Colorful' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        setKeyboardStyle(style.id as KeyboardStyle);
                        onUpdateProfile({ keyboardStyle: style.id as KeyboardStyle });
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-between ${
                        keyboardStyle === style.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{style.label}</span>
                      {keyboardStyle === style.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. FONT & THEME ICON (A) */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'font' ? null : 'font');
              }}
              className={`p-2 rounded-xl transition-colors cursor-pointer font-serif font-black text-base ${
                activeDropdown === 'font' ? 'bg-slate-200 text-blue-600' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Font & Visual Themes"
            >
              A
            </button>

            {activeDropdown === 'font' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 text-xs font-semibold z-50 text-slate-800 space-y-4 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto"
              >
                {/* Font Size Selector */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Font Size
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
                    {(['small', 'default', 'large', 'extra-large'] as FontSize[]).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => {
                          setFontSize(sz);
                          setAccessibleFont(false);
                          onUpdateProfile({ fontSize: sz });
                        }}
                        className={`py-1.5 rounded-lg text-center font-bold capitalize cursor-pointer transition-all ${
                          fontSize === sz && !accessibleFont
                            ? 'bg-white text-blue-600 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {sz === 'extra-large' ? 'XL' : sz}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center justify-between cursor-pointer mt-2 pt-2 border-t border-slate-100">
                    <span className="text-slate-600">Accessible font size (Extra extra large)</span>
                    <input
                      type="checkbox"
                      checked={accessibleFont}
                      onChange={(e) => {
                        setAccessibleFont(e.target.checked);
                        if (e.target.checked) {
                          setFontSize('accessible');
                          onUpdateProfile({ fontSize: 'accessible' });
                        } else {
                          setFontSize('default');
                          onUpdateProfile({ fontSize: 'default' });
                        }
                      }}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Font Face Selector */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Font Face
                  </div>
                  <div className="space-y-1">
                    {[
                      { id: 'droid-sans-mono', label: 'Droid Sans Mono' },
                      { id: 'roboto-mono', label: 'Roboto Mono' },
                      { id: 'jetbrains-mono', label: 'JetBrains Mono' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setFontFamily(f.id as FontFamily);
                          onUpdateProfile({ fontFamily: f.id as FontFamily });
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-between ${
                          fontFamily === f.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span style={{ fontFamily: f.label }}>{f.label}</span>
                        {fontFamily === f.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clickable Theme Thumbnails */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Visual Themes
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'clean', label: 'Clean White (Default)', bg: 'bg-white border-slate-200' },
                      { id: 'dark', label: 'Dark Mode', bg: 'bg-slate-900 border-slate-800 text-white' },
                      { id: 'car', label: 'Yellow Car / Road', bg: 'bg-[#fff9e6] border-[#ebdcb8]' },
                      { id: 'beach', label: 'Beach', bg: 'bg-gradient-to-br from-sky-200 to-amber-200 border-sky-300' },
                      { id: 'space', label: 'Space', bg: 'bg-gradient-to-br from-slate-950 to-indigo-950 border-slate-800 text-white' },
                      { id: 'nature', label: 'Nature', bg: 'bg-emerald-100 border-emerald-300' },
                    ].map((th) => (
                      <button
                        key={th.id}
                        onClick={() => {
                          setTheme(th.id as TypingTheme);
                          onUpdateProfile({ theme: th.id as TypingTheme });
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between h-16 ${th.bg} ${
                          theme === th.id ? 'ring-2 ring-blue-500 font-bold shadow-sm' : 'hover:opacity-90'
                        }`}
                      >
                        <span className="text-[11px] truncate">{th.label}</span>
                        {theme === th.id && (
                          <div className="self-end w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* User Profile Pill on right */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 text-xs font-bold text-slate-800">
            <span>{profile.avatar || '🐼'}</span>
            <span className="hidden sm:inline">{profile.name}</span>
          </div>

        </div>

      </header>

      {/* ============================================================== */}
      {/* 2. BORDERLESS TYPING AREA (Center Top)                         */}
      {/* Centered rows without surrounding box borders                  */}
      {/* Blue "Start Typing" badge; correct soft green/blue; mistakes red */}
      {/* Small "Press [Key]" prompt above wrong key                     */}
      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* 2. AUTHENTIC NO-SCROLL TYPING AREA (Center Viewport)           */}
      {/* 3 lines displayed at once, auto-scrolls line by line           */}
      {/* Soft white keycap boxes on completed letters (Screenshot 98)   */}
      {/* Blue "Start Typing" bubble, word speed badges, progress bar    */}
      {/* ============================================================== */}
      <main className="flex-1 min-h-0 flex flex-col justify-center items-center py-2 px-4 sm:px-8 relative z-30 overflow-hidden">
        
        {/* 3-Line Typing Container with smooth vertical line sliding */}
        <div
          style={getFontFamilyStyle()}
          className={`w-full max-w-4xl flex flex-col gap-y-6 sm:gap-y-8 justify-center items-start ${getFontSizeClass()} select-none`}
        >
          {visibleLines.map((line) => {
            return (
              <div
                key={line.lineIndex}
                className="w-full flex flex-wrap items-end transition-transform duration-200"
              >
                {line.words.map((w, wIdxInLine) => {
                  const wordSpeedItem = wordSpeeds[w.endIndex];

                  return (
                    <div
                      key={w.startIndex}
                      className="relative inline-flex items-center mr-3 sm:mr-4 mb-1"
                    >
                      {/* Floating Real-time Word Speed Badge (e.g. "30 wpm Good", "40 wpm Nice!") */}
                      {showSpeedOnWord && wordSpeedItem && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] sm:text-[11px] font-sans font-bold text-slate-700 whitespace-nowrap bg-white/95 px-1.5 py-0.5 rounded shadow-xs pointer-events-none z-20 border border-slate-200">
                          <span>{wordSpeedItem.wpm}</span>
                          <span className="text-[9px] text-slate-400 ml-0.5 font-normal">wpm</span>
                          {wordSpeedItem.label && (
                            <span className="text-blue-600 font-extrabold ml-1">
                              {wordSpeedItem.label}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Word Characters with Soft Keycap Boxes (Screenshot 98) */}
                      <div className="inline-flex items-center">
                        {w.word.split('').map((char, charIdx) => {
                          const globalIdx = w.startIndex + charIdx;
                          const isCursor = globalIdx === cursorPos;
                          const isTyped = globalIdx < cursorPos;
                          const isMistake = charErrors[globalIdx];

                          if (char === ' ') {
                            return (
                              <span
                                key={globalIdx}
                                className={`inline-block w-2.5 sm:w-3.5 relative ${
                                  isCursor ? 'border-b-[3.5px] border-[#2563eb] pb-0.5' : ''
                                }`}
                              >
                                &nbsp;
                              </span>
                            );
                          }

                          return (
                            <span
                              key={globalIdx}
                              className="relative inline-flex items-center justify-center mx-[1px]"
                            >
                              {/* BLUE / YELLOW "Start Typing" Badge above cursor before typing starts */}
                              {isCursor && !hasStarted && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 animate-bounce whitespace-nowrap pointer-events-none">
                                  <div className="relative bg-[#2563eb] text-white font-black text-xs px-3 py-1 rounded-lg shadow-md flex items-center gap-1.5 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-x-transparent after:border-b-transparent after:border-t-[#2563eb]">
                                    <span>⏸</span>
                                    <span>Start Typing</span>
                                  </div>
                                </div>
                              )}

                              {/* Wrong key prompt (e.g. "Press S") displayed above letter on mistake */}
                              {isCursor && lastWrongPrompt && (
                                <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
                                  <div className="relative bg-rose-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-md shadow-md after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-x-transparent after:border-b-transparent after:border-t-rose-600">
                                    {lastWrongPrompt}
                                  </div>
                                </div>
                              )}

                              {/* Keycap Character: Soft white box if typed (Screenshot 98), Red if error, Blue cursor */}
                              <span
                                className={`inline-flex items-center justify-center min-w-[26px] sm:min-w-[32px] px-1 py-0.5 transition-all duration-75 text-center leading-none ${
                                  isTyped
                                    ? isMistake
                                      ? 'bg-rose-200 text-rose-800 rounded-md font-bold shadow-2xs border border-rose-300'
                                      : 'bg-white/95 text-slate-800 rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.06)] border border-slate-200/70 font-medium'
                                    : isCursor
                                    ? 'text-slate-900 font-black border-b-[3.5px] border-[#2563eb] pb-0.5 bg-blue-100/40 rounded-xs'
                                    : 'text-slate-500/80 font-normal'
                                }`}
                              >
                                {char === '\n' ? '↵' : char}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Horizontal Progress Line with Glowing Blue Indicator */}
        <div className="w-full max-w-4xl mt-6 relative shrink-0">
          <div className="w-full h-1 bg-blue-500/20 rounded-full relative">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(37,99,235,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-600 ring-2 ring-white shadow-sm transition-all duration-150"
              style={{ left: `calc(${progressPercent}% - 6px)` }}
            />
          </div>
        </div>

      </main>

      {/* ============================================================== */}
      {/* 3. VIRTUAL QWERTY KEYBOARD + 2D HANDS + LIVE COUNTER           */}
      {/* ============================================================== */}
      <footer className="w-full relative z-20 pb-4 pt-1 px-4 sm:px-8">
        
        {/* ROAD ENVIRONMENT SCENE (Signpost left, Taxi car right) for Yellow Car theme */}
        {theme === 'car' && (
          <>
            {/* LEFT SIGNPOST ART */}
            <div className="hidden lg:block absolute left-8 bottom-6 pointer-events-none z-10">
              <svg width="150" height="230" viewBox="0 0 150 230" fill="none">
                <rect x="70" y="40" width="7" height="190" fill="#94a3b8" rx="2" />
                <circle cx="73.5" cy="40" r="8" fill="#64748b" />
                <g transform="translate(10, 60) rotate(-14)">
                  <polygon points="0,15 80,15 90,0 80,-15 0,-15" fill="#f43f5e" />
                  <text x="38" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                    Keyboard sq.
                  </text>
                </g>
                <g transform="translate(72, 95)">
                  <polygon points="0,-12 70,-12 80,0 70,12 0,12" fill="#eab308" />
                  <text x="36" y="4" fill="#713f12" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                    Home Row St.
                  </text>
                </g>
                <g transform="translate(10, 130) rotate(10)">
                  <polygon points="0,12 70,12 80,0 70,-12 0,-12" fill="#38bdf8" />
                  <text x="36" y="4" fill="#0c4a6e" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                    TypingCity
                  </text>
                </g>
              </svg>
            </div>

            {/* RIGHT TAXI CAR ART */}
            <div className="hidden lg:flex items-end absolute right-8 bottom-3 pointer-events-none z-10">
              <svg width="240" height="170" viewBox="0 0 240 170" fill="none">
                <rect x="105" y="28" width="28" height="10" rx="3" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
                <text x="119" y="36" fill="#ffffff" fontSize="6" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">
                  TAXI
                </text>
                <path d="M 60 90 C 70 50 100 40 150 40 C 180 40 195 65 205 90 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="3" />
                <path d="M 75 85 C 82 58 105 52 135 52 L 135 85 Z" fill="#38bdf8" opacity="0.9" />
                <path d="M 142 85 L 142 52 C 165 52 178 62 188 85 Z" fill="#38bdf8" opacity="0.9" />
                <path
                  d="M 20 120 C 20 100 45 92 65 92 L 205 92 C 225 92 235 110 235 125 C 235 135 225 140 215 140 L 40 140 C 25 140 20 130 20 120 Z"
                  fill="#facc15"
                  stroke="#d97706"
                  strokeWidth="3"
                />
                <circle cx="65" cy="140" r="18" fill="#1e293b" />
                <circle cx="65" cy="140" r="8" fill="#94a3b8" />
                <circle cx="185" cy="140" r="18" fill="#1e293b" />
                <circle cx="185" cy="140" r="8" fill="#94a3b8" />
                <circle cx="230" cy="140" r="9" fill="#ffffff" opacity="0.9" />
                <circle cx="242" cy="125" r="14" fill="#ffffff" opacity="0.8" />
              </svg>
            </div>
          </>
        )}

        {/* CENTER KEYBOARD ROW WITH RIGHT LIVE SPEED & ACCURACY */}
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6">
          
          {/* Virtual QWERTY Keyboard with 2D Hand Overlays */}
          <div className="flex-1 w-full flex justify-center">
            <TypingKeyboard
              targetKey={currentTargetChar}
              pressedKeys={pressedKeys}
              showKeyboard={showKeyboard}
              handGuideMode={handGuideMode}
              keyboardStyle={keyboardStyle}
              isHindi={isHindi}
            />
          </div>

          {/* Minimal Live Speed & Accuracy Counter (Right side of keyboard) */}
          {showLiveStats && (
            <div className="flex md:flex-col gap-6 items-start justify-center select-none pl-2 pr-4">
              {/* Speed Counter */}
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-0.5">
                  Speed
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-800 leading-none">
                  {currentWpm} <span className="text-xs font-sans font-bold text-slate-400">WPM</span>
                </div>
              </div>

              {/* Accuracy Counter */}
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-0.5">
                  Accuracy
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-800 leading-none">
                  {currentAccuracy}<span className="text-xl font-sans font-bold text-slate-400">%</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </footer>
    </div>
  );
};
