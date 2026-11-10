import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Globe, Play, User, School, BookOpen, Volume2, VolumeX, RotateCcw, X, Check } from 'lucide-react';
import { sounds } from '../utils/audio';
import { getAllUsers } from '../utils/storage';
import { LoginModal } from './LoginModal';
import { AuthUser } from '../types';

interface LandingHeroProps {
  onEnterApp: () => void;
  onOpenLesson: (lessonId: number) => void;
  onLoginSuccess?: (user: AuthUser) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onEnterApp,
  onOpenLesson,
  onLoginSuccess,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [langMenuOpen, setLangMenuOpen] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<string>('Language');
  const [schoolModalOpen, setSchoolModalOpen] = useState<boolean>(false);
  const [storeModalOpen, setStoreModalOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [mockupSoundEnabled, setMockupSoundEnabled] = useState<boolean>(true);

  // Blinking caret state
  const [showCaret, setShowCaret] = useState<boolean>(true);

  // Mouse parallax offset state for 3D night sky
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouseOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Import storage to get registered user count dynamically
  const registeredUsersCount = getAllUsers().length;

  // Animated counters starting at 0 for new user and tracking real dynamically
  const [studentsVal, setStudentsVal] = useState<number>(0);
  const [schoolsVal, setSchoolsVal] = useState<number>(0);
  const [teachersVal, setTeachersVal] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animId: number;
    const duration = 1400;

    const targetStudents = registeredUsersCount;
    const targetSchools = Math.floor(registeredUsersCount / 5);
    const targetTeachers = Math.floor(registeredUsersCount / 2);

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setStudentsVal(Math.floor(ease * targetStudents));
      setSchoolsVal(Math.floor(ease * targetSchools));
      setTeachersVal(Math.floor(ease * targetTeachers));

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setStudentsVal(targetStudents);
        setSchoolsVal(targetSchools);
        setTeachersVal(targetTeachers);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [registeredUsersCount]);

  // Interactive typing inside mockup preview
  const [mockTyped, setMockTyped] = useState<string>('');
  const targetMockWord = "take";

  // Caret blink interval
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCaret((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Track window scroll for sticky navbar background transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Canvas Starfield for realistic night sky matching Screenshot 1
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Stars matching Screenshot 1: varied sizes, soft twinkle, some larger bright points
    const starCount = Math.floor((w * h) / 7500);
    const stars = Array.from({ length: Math.max(120, starCount) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.85,
      radius: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.75 + 0.25,
      speed: (Math.random() - 0.5) * 0.012,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha <= 0.2 || s.alpha >= 0.95) {
          s.speed = -s.speed;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        if (s.radius > 1.2) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(210, 235, 255, 0.8)';
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const scrollToWhatIs = () => {
    const el = document.getElementById('what-is-typingclub');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMockupKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setMockTyped((prev) => prev.slice(0, -1));
      if (mockupSoundEnabled) sounds.playKeyClick();
      return;
    }
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      if (mockTyped.length < targetMockWord.length) {
        setMockTyped((prev) => prev + e.key);
        if (mockupSoundEnabled) {
          if (e.key.toLowerCase() === targetMockWord[mockTyped.length].toLowerCase()) {
            sounds.playKeyClick();
          } else {
            sounds.playError();
          }
        }
      } else {
        // Jump to full lesson
        onOpenLesson(11);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#212b36] selection:bg-[#188bf6] selection:text-white font-sans overflow-x-hidden">
      {/* 
        TOP NAVIGATION BAR 
        Matches Screenshot 1 (transparent over hero night sky)
        and Screenshot 2 (dark navy #212b36 background when scrolled)
        Contains ONLY: Get Started, Language dropdown, and Login (no Store or School Edition)
      */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 sm:px-12 flex items-center justify-between ${
          scrolled
            ? 'bg-[#212b36] shadow-md py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        {/* Brand Logo - Bold White "Typing Zone" with distinctive rounded styling */}
        <div
          onClick={onEnterApp}
          className="text-2xl sm:text-[26px] font-black text-white tracking-tight cursor-pointer select-none hover:opacity-95 transition-opacity"
          style={{ letterSpacing: '-0.02em' }}
        >
          Typing Zone
        </div>

        {/* Right Navigation Links & Login: ONLY Get Started, Language, Login */}
        <nav className="flex items-center gap-5 sm:gap-7 text-sm font-medium text-white/95">
          <button
            onClick={() => setLoginModalOpen(true)}
            className="hover:text-white hover:underline transition-all cursor-pointer whitespace-nowrap font-semibold"
          >
            Get Started
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-sm whitespace-nowrap"
            >
              <span>{selectedLang}</span>
              <span className="text-[10px] opacity-80">▾</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl py-1.5 text-slate-800 border border-slate-100 text-xs font-semibold z-50 animate-in fade-in zoom-in-95 duration-150">
                {[
                  { name: 'English (US)', code: 'en' },
                  { name: 'Español', code: 'es' },
                  { name: 'Français', code: 'fr' },
                  { name: 'Deutsch', code: 'de' },
                  { name: 'Italiano', code: 'it' },
                  { name: 'Português', code: 'pt' },
                  { name: 'हिन्दी (Hindi)', code: 'hi' },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setSelectedLang(l.name.split(' ')[0]);
                      setLangMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>{l.name}</span>
                    {selectedLang === l.name.split(' ')[0] && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Login Button - Authentic White Rounded Pill */}
          <button
            onClick={() => setLoginModalOpen(true)}
            className="bg-white text-[#212b36] hover:bg-slate-100 font-bold px-6 py-1.5 rounded-full text-sm transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            Login
          </button>
        </nav>
      </header>

      {/* 
        HERO SECTION (Matches Screenshot 1 Exactly)
        - Deep rich cosmic midnight blue gradient (#091f48 to #0e356e)
        - Twinkling stars canvas
        - Large glowing Moon on the left with realistic craters
        - "Learn Touch Typing for free!|" with blinking cursor on the right
        - "Get Started" clean white button
        - Scroll down button at bottom left
        - Multiple overlapping fluffy cloud banks
      */}
      <section className="relative min-h-screen bg-gradient-to-b from-[#07193b] via-[#0d2a5a] to-[#123e7e] text-white flex flex-col justify-between pt-24 sm:pt-28 overflow-hidden select-none">
        {/* Starfield Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Ambient Moon Glow Overlay with Parallax */}
        <div
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translate3d(${-mouseOffset.x * 24}px, ${-mouseOffset.y * 20}px, 0)`,
          }}
        />

        {/* Hero Content Grid: Moon on Left, Title & CTA on Right */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 my-auto py-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* THE MOON (Matches Screenshot 1 With High Fidelity & 3D Mouse Parallax) */}
          <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-start lg:pl-10">
            <div
              className="relative group cursor-pointer transition-transform duration-300 ease-out"
              onClick={onEnterApp}
              style={{
                transform: `translate3d(${mouseOffset.x * 16}px, ${mouseOffset.y * 14}px, 0)`,
              }}
            >
              {/* Moon Atmospheric Outer Halo */}
              <div
                className="w-56 h-56 sm:w-80 sm:h-80 md:w-[340px] md:h-[340px] rounded-full relative overflow-hidden transition-transform duration-700 group-hover:scale-[1.02]"
                style={{
                  background: 'radial-gradient(circle at 45% 45%, #ffffff 0%, #eef5fc 40%, #c8def4 72%, #a3c4ea 100%)',
                  boxShadow: '0 0 90px rgba(195, 225, 255, 0.65), 0 0 160px rgba(140, 190, 255, 0.35)',
                }}
              >
                {/* SVG Textured Lunar Mare (Craters matching Screenshot 1) */}
                <svg
                  viewBox="0 0 340 340"
                  className="w-full h-full absolute inset-0 opacity-85 mix-blend-multiply"
                >
                  <defs>
                    <radialGradient id="mareGrad1" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#7a9fc7" stopOpacity="0.55" />
                      <stop offset="80%" stopColor="#8eb0d4" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#b5cde7" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="craterDeep" cx="40%" cy="40%" r="50%">
                      <stop offset="0%" stopColor="#678cb5" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#9dbddf" stopOpacity="0.1" />
                    </radialGradient>
                  </defs>

                  {/* Oceanus Procellarum & Major Mare patches */}
                  <path
                    d="M 60 110 Q 95 65 155 75 Q 210 85 240 130 Q 255 170 230 220 Q 190 260 135 255 Q 80 250 65 190 Z"
                    fill="url(#mareGrad1)"
                  />
                  <ellipse cx="140" cy="140" rx="65" ry="50" fill="url(#craterDeep)" transform="rotate(-15 140 140)" />
                  <ellipse cx="205" cy="175" rx="42" ry="32" fill="url(#mareGrad1)" transform="rotate(20 205 175)" />
                  <circle cx="110" cy="205" r="30" fill="url(#craterDeep)" />
                  <circle cx="95" cy="130" r="24" fill="url(#craterDeep)" />
                  <circle cx="180" cy="105" r="28" fill="url(#mareGrad1)" />
                  <circle cx="215" cy="120" r="18" fill="url(#craterDeep)" />
                  <circle cx="160" cy="230" r="25" fill="url(#mareGrad1)" />
                  <circle cx="240" cy="210" r="22" fill="url(#craterDeep)" />

                  {/* Crisp Distinct Small Crater Rings */}
                  <circle cx="85" cy="165" r="7" fill="#678bb3" opacity="0.4" />
                  <circle cx="130" cy="85" r="9" fill="#678bb3" opacity="0.35" />
                  <circle cx="225" cy="155" r="8" fill="#678bb3" opacity="0.4" />
                  <circle cx="175" cy="180" r="11" fill="#678bb3" opacity="0.35" />
                  <circle cx="140" cy="250" r="8" fill="#678bb3" opacity="0.4" />
                  <circle cx="265" cy="175" r="6" fill="#678bb3" opacity="0.3" />
                </svg>

                {/* Soft atmospheric lunar rim shadow */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    boxShadow: 'inset -24px -18px 45px rgba(35, 75, 140, 0.4), inset 12px 12px 25px rgba(255, 255, 255, 0.8)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* HEADLINE & BUTTON (Matches Screenshot 1 Right Side) */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1
              className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-white tracking-tight leading-[1.2] mb-8"
              style={{ letterSpacing: '-0.015em' }}
            >
              Learn Touch Typing for free!
              <span
                className={`inline-block w-[3px] h-[44px] sm:h-[52px] bg-white ml-1.5 align-middle transition-opacity duration-100 ${
                  showCaret ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </h1>

            {/* "Get Started" Button - Pure White with Deep Navy Text */}
            <button
              onClick={() => setLoginModalOpen(true)}
              className="bg-white hover:bg-slate-50 text-[#143d73] font-bold text-lg px-12 py-3.5 rounded-md shadow-lg hover:shadow-xl transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer select-none"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* 
          BOTTOM OF HERO:
          - Scroll down circle button on left (matches Screenshot 1)
          - Tiered Cloud Banks (matches Screenshot 1)
        */}
        <div className="relative w-full z-20">
          {/* Scroll Down Circle Button on Left (matches Screenshot 1) */}
          <div className="px-6 sm:px-16 pb-4 sm:pb-6 relative z-30">
            <button
              onClick={scrollToWhatIs}
              className="w-11 h-11 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm shadow-md"
              title="Scroll to learn more"
            >
              <ChevronDown className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* 
            FLUFFY OVERLAPPING CLOUD BANKS
            Tier 1: Deep blue-gray (#6489b4)
            Tier 2: Light pastel blue (#92b5db)
            Tier 3: Pure white (#ffffff) merging smoothly into the section below
          */}
          <div className="relative w-full overflow-hidden leading-none select-none">
            {/* SVG Overlapping Layered Clouds matching Screenshot 1 */}
            <svg
              viewBox="0 0 1440 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto min-h-[110px] sm:min-h-[160px] object-cover block"
              preserveAspectRatio="none"
            >
              {/* Layer 1: Back Clouds (#6389b5) */}
              <path
                d="M-40,180 L-40,110 Q20,60 80,95 Q140,55 210,85 Q280,45 360,75 Q440,40 520,70 Q600,30 690,65 Q770,35 850,70 Q930,45 1010,75 Q1090,35 1170,70 Q1250,45 1330,80 Q1410,50 1480,90 L1480,180 Z"
                fill="#6389b5"
                opacity="0.95"
              />

              {/* Layer 2: Middle Clouds (#90b5dc) */}
              <path
                d="M-40,180 L-40,130 Q40,85 110,115 Q180,75 260,105 Q340,65 430,100 Q510,70 600,105 Q680,60 770,95 Q860,65 950,105 Q1030,70 1120,105 Q1200,60 1290,100 Q1370,75 1480,115 L1480,180 Z"
                fill="#90b5dc"
              />

              {/* Layer 3: Front Crisp White Clouds (#ffffff) */}
              <path
                d="M-40,180 L-40,150 Q20,110 80,135 Q140,100 210,130 Q280,95 360,125 Q440,90 530,125 Q610,95 700,130 Q780,85 870,125 Q960,95 1050,130 Q1130,90 1220,125 Q1300,95 1380,130 Q1440,110 1480,140 L1480,180 Z"
                fill="#ffffff"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* 
        "WHAT IS TYPINGCLUB?" SECTION (Matches Screenshot 2 Exactly)
        - Pure white background
        - Left: Realistic Browser Window Mockup with Lesson 11, Green highlighted text,
          WPM badges, Yellow cursor box on "take", Virtual Keyboard with hands overlay!
        - Right: "WHAT IS TYPINGCLUB?", Headline, Paragraph with EdClub link, "Get Started Now" blue button
      */}
      <section id="what-is-typingclub" className="bg-white py-16 sm:py-24 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          
          {/* 
            LEFT COLUMN: THE BROWSER WINDOW MOCKUP
            Matches Screenshot 2 With Meticulous Detail
          */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div
              className="w-full max-w-[540px] bg-white rounded-xl shadow-[0_20px_60px_rgba(30,60,110,0.18)] border border-slate-200/90 overflow-hidden select-none transition-transform hover:shadow-[0_24px_70px_rgba(30,60,110,0.22)]"
              tabIndex={0}
              onKeyDown={handleMockupKeyPress}
            >
              {/* Browser Window Header with Traffic Lights & URL Bar */}
              <div className="bg-[#e8ebf0] border-b border-slate-300/80 px-4 py-2.5 flex items-center justify-between">
                {/* Traffic Light Dots */}
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                </div>

                {/* Back / Forward / Refresh controls */}
                <div className="flex items-center gap-2 text-slate-500 text-xs ml-3 mr-2">
                  <span className="cursor-pointer hover:text-slate-800">←</span>
                  <span className="cursor-pointer hover:text-slate-800">→</span>
                  <span className="cursor-pointer hover:text-slate-800 text-[10px]">↻</span>
                </div>

                {/* URL / Lesson Title Address Bar */}
                <div className="flex-1 max-w-[260px] bg-white rounded-md px-3 py-1 text-slate-600 text-[11px] font-mono border border-slate-300/70 truncate text-center shadow-inner">
                  Lesson 11: Typing Zone
                </div>

                {/* Hamburger menu */}
                <div className="text-slate-500 text-xs cursor-pointer hover:text-slate-800 ml-2">
                  ☰
                </div>
              </div>

              {/* Lesson Workspace Inner Bar */}
              <div className="bg-white border-b border-slate-100 px-6 py-2.5 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Lesson 11: Typing Zone</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setMockupSoundEnabled(!mockupSoundEnabled);
                      sounds.setEnabled(!mockupSoundEnabled);
                    }}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                    title="Audio"
                  >
                    {mockupSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-600" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                  <span className="cursor-pointer hover:text-slate-800" title="Pause">❚❚</span>
                  <button
                    onClick={() => setMockTyped('')}
                    className="hover:text-slate-800 transition-colors cursor-pointer"
                    title="Reset"
                  >
                    ↺
                  </button>
                </div>
              </div>

              {/* Typing Exercise Body */}
              <div className="p-6 sm:p-7 bg-white">
                {/* 
                  Paragraph with Green Highlights and floating WPM badges matching Screenshot 2:
                  "Keep practicing each lesson until you get all five stars. It really doesn't take much to learn, a few minutes a day for one to two weeks and you will be a pro!"
                */}
                <div className="font-mono text-base sm:text-[17px] leading-[2.6] text-slate-800 break-words relative mb-6">
                  {/* Word "Keep" + badge "72 wpm WOW⭐" */}
                  <span className="relative inline-block bg-[#baf0cc] text-[#13663b] px-1 rounded mx-0.5">
                    Keep
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-sans font-bold text-slate-500 whitespace-nowrap bg-white/90 px-1 rounded shadow-xs leading-none">
                      72 wpm <span className="text-amber-500">WOW★</span>
                    </span>
                  </span>

                  {/* Word "practicing" */}
                  <span className="bg-[#baf0cc] text-[#13663b] px-1 rounded mx-0.5">
                    practicing
                  </span>

                  {/* Word "each" + badge "91 wpm" */}
                  <span className="relative inline-block bg-[#baf0cc] text-[#13663b] px-1 rounded mx-0.5">
                    each
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-sans font-bold text-slate-500 whitespace-nowrap bg-white/90 px-1 rounded shadow-xs leading-none">
                      91 wpm
                    </span>
                  </span>

                  {/* Word "lesson" + badge "67 wpm Great!⭐" */}
                  <span className="relative inline-block bg-[#baf0cc] text-[#13663b] px-1 rounded mx-0.5">
                    lesson
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-sans font-bold text-slate-500 whitespace-nowrap bg-white/90 px-1 rounded shadow-xs leading-none">
                      67 wpm <span className="text-amber-500">Great!★</span>
                    </span>
                  </span>

                  {/* Word "until" */}
                  <span className="bg-[#baf0cc] text-[#13663b] px-1 rounded mx-0.5">
                    until
                  </span>

                  {/* Word "you" + badge "96 wpm WOW⭐⭐" */}
                  <span className="relative inline-block bg-[#baf0cc] text-[#13663b] px-1 rounded mx-0.5">
                    you
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-sans font-bold text-slate-500 whitespace-nowrap bg-white/90 px-1 rounded shadow-xs leading-none">
                      96 wpm <span className="text-amber-500">WOW★★</span>
                    </span>
                  </span>

                  {/* Word "get" */}
                  <span className="bg-[#baf0cc] text-[#13663b] px-1 rounded mx-0.5">
                    get
                  </span>

                  {/* Word "all" + badge "136 wpm" */}
                  <span className="relative inline-block bg-[#baf0cc] text-[#13663b] px-1 rounded mx-0.5">
                    all
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-sans font-bold text-slate-500 whitespace-nowrap bg-white/90 px-1 rounded shadow-xs leading-none">
                      136 wpm
                    </span>
                  </span>

                  {/* Word "five" + badge "98 wpm WOW!★★" */}
                  <span className="relative inline-block bg-[#baf0cc] text-[#13663b] px-1 rounded mx-0.5">
                    five
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-sans font-bold text-slate-500 whitespace-nowrap bg-white/90 px-1 rounded shadow-xs leading-none">
                      98 wpm <span className="text-amber-500">WOW!★★</span>
                    </span>
                  </span>

                  {/* Word "stars." + badge "100 wpm WOW!★★★" */}
                  <span className="relative inline-block bg-[#baf0cc] text-[#13663b] px-1 rounded mx-0.5">
                    stars.
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-sans font-bold text-slate-500 whitespace-nowrap bg-white/90 px-1 rounded shadow-xs leading-none">
                      100 wpm <span className="text-amber-500">WOW!★★★</span>
                    </span>
                  </span>

                  {/* Word "It" + badge "29 wpm" */}
                  <span className="relative inline-block bg-[#baf0cc] text-[#13663b] px-1 rounded mx-0.5">
                    It
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-sans font-bold text-slate-500 whitespace-nowrap bg-white/90 px-1 rounded shadow-xs leading-none">
                      29 wpm
                    </span>
                  </span>

                  {/* Word "really" */}
                  <span className="bg-[#baf0cc] text-[#13663b] px-1 rounded mx-0.5">
                    really
                  </span>

                  {/* Word "doesn't" */}
                  <span className="bg-[#baf0cc] text-[#13663b] px-1 rounded mx-0.5">
                    doesn't
                  </span>

                  {/* ACTIVE WORD IN YELLOW CURSOR BOX: "take" */}
                  <span className="relative inline-block bg-[#ffe875] text-slate-900 px-1 rounded mx-0.5 font-bold shadow-xs">
                    {mockTyped || targetMockWord}
                  </span>

                  {/* UPCOMING TEXT WITH DOTTED UNDERLINES */}
                  <span className="text-slate-400 border-b border-dotted border-slate-300 ml-1">
                    much to learn, a few minutes a day for one to two weeks and you will be a pro!
                  </span>
                </div>

                {/* Live Speed & Accuracy Telemetry (Matches Screenshot 2) */}
                <div className="flex items-center justify-end gap-6 text-xs text-slate-500 font-mono mb-4 pt-1">
                  <div>
                    <span className="uppercase text-[10px] text-slate-400">SPEED (WPM): </span>
                    <span className="font-bold text-slate-800 text-sm">18</span>
                  </div>
                  <div>
                    <span className="uppercase text-[10px] text-slate-400">Accuracy: </span>
                    <span className="font-bold text-slate-800 text-sm">99%</span>
                  </div>
                </div>

                {/* 
                  VIRTUAL KEYBOARD WITH TRANSLUCENT HANDS OVERLAY
                  Matches Screenshot 2: Key 'T' highlighted in blue,
                  hands placed on home row with trajectory reach!
                */}
                <div className="relative pt-2 pb-1 border-t border-slate-100 flex flex-col items-center">
                  {/* Keyboard Frame */}
                  <div className="w-full max-w-[420px] bg-slate-50 p-2 rounded-xl border border-slate-200">
                    {/* Rows */}
                    <div className="flex flex-col gap-1 text-[10px] font-mono text-slate-600">
                      {/* Number Row */}
                      <div className="flex gap-1 justify-center">
                        {['~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '⌫'].map((k) => (
                          <div key={k} className="h-6 flex-1 min-w-[16px] bg-white rounded border border-slate-200 flex items-center justify-center shadow-2xs">
                            {k}
                          </div>
                        ))}
                      </div>

                      {/* QWERTY Row with 'T' highlighted in bright blue */}
                      <div className="flex gap-1 justify-center">
                        <div className="h-6 w-7 bg-white rounded border border-slate-200 flex items-center justify-center text-[9px] shadow-2xs">Tab</div>
                        {['q', 'w', 'e', 'r'].map((k) => (
                          <div key={k} className="h-6 flex-1 min-w-[18px] bg-white rounded border border-slate-200 flex items-center justify-center uppercase shadow-2xs">
                            {k}
                          </div>
                        ))}
                        {/* Highlighted 'T' Key */}
                        <div className="h-6 flex-1 min-w-[18px] bg-[#3b82f6] text-white font-bold rounded border border-blue-600 flex items-center justify-center uppercase shadow-md ring-2 ring-blue-300">
                          T
                        </div>
                        {['y', 'u', 'i', 'o', 'p', '[', ']', '\\'].map((k) => (
                          <div key={k} className="h-6 flex-1 min-w-[18px] bg-white rounded border border-slate-200 flex items-center justify-center uppercase shadow-2xs">
                            {k}
                          </div>
                        ))}
                      </div>

                      {/* Home Row (A S D F G H J K L ;) */}
                      <div className="flex gap-1 justify-center">
                        <div className="h-6 w-8 bg-white rounded border border-slate-200 flex items-center justify-center text-[9px] shadow-2xs">Caps</div>
                        {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"].map((k) => (
                          <div key={k} className="h-6 flex-1 min-w-[18px] bg-white rounded border border-slate-200 flex items-center justify-center uppercase shadow-2xs relative">
                            {k}
                            {(k === 'f' || k === 'j') && <span className="absolute bottom-0.5 w-1.5 h-0.5 bg-slate-400 rounded-full" />}
                          </div>
                        ))}
                        <div className="h-6 w-9 bg-white rounded border border-slate-200 flex items-center justify-center text-[9px] shadow-2xs">Enter</div>
                      </div>

                      {/* Bottom Row */}
                      <div className="flex gap-1 justify-center">
                        <div className="h-6 w-10 bg-white rounded border border-slate-200 flex items-center justify-center text-[9px] shadow-2xs">Shift</div>
                        {['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'].map((k) => (
                          <div key={k} className="h-6 flex-1 min-w-[18px] bg-white rounded border border-slate-200 flex items-center justify-center uppercase shadow-2xs">
                            {k}
                          </div>
                        ))}
                        <div className="h-6 w-10 bg-white rounded border border-slate-200 flex items-center justify-center text-[9px] shadow-2xs">Shift</div>
                      </div>

                      {/* Spacebar */}
                      <div className="flex gap-1 justify-center">
                        <div className="h-6 w-36 bg-white rounded border border-slate-200 flex items-center justify-center text-[9px] text-slate-400 shadow-2xs">
                          Space
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 
                    Translucent Hands Illustration Overlay
                    Showing Left & Right hands with left index finger pressing T
                    Matches Screenshot 2
                  */}
                  <svg
                    viewBox="0 0 420 130"
                    className="w-full max-w-[420px] -mt-16 pointer-events-none opacity-85 select-none"
                  >
                    {/* Blue reach trajectory line from F to T */}
                    <path
                      d="M 170 85 Q 175 60 185 45"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeDasharray="3 3"
                      fill="none"
                    />
                    <circle cx="185" cy="45" r="4" fill="#3b82f6" />

                    {/* Left Hand Outline */}
                    <path
                      d="M 105 130 C 105 105 110 85 115 65 C 117 55 125 55 128 65 L 132 85 C 134 70 140 50 146 50 C 151 50 154 60 152 75 L 155 85 C 158 65 166 40 173 40 C 178 40 183 50 180 70 L 178 85 C 182 60 188 35 194 35 C 199 35 204 45 198 65 L 190 95 C 190 95 205 90 215 100 C 220 105 215 115 200 120 L 180 130 Z"
                      fill="rgba(255, 255, 255, 0.7)"
                      stroke="#859ab7"
                      strokeWidth="1.4"
                    />

                    {/* Right Hand Outline */}
                    <path
                      d="M 315 130 C 315 105 310 85 305 65 C 303 55 295 55 292 65 L 288 85 C 286 70 280 50 274 50 C 269 50 266 60 268 75 L 265 85 C 262 65 254 40 247 40 C 242 40 237 50 240 70 L 242 85 C 238 60 232 35 226 35 C 221 35 216 45 222 65 L 230 95 C 230 95 215 90 205 100 C 200 105 205 115 220 120 L 240 130 Z"
                      fill="rgba(255, 255, 255, 0.7)"
                      stroke="#859ab7"
                      strokeWidth="1.4"
                    />
                  </svg>
                </div>

                {/* Quick launch into Lesson 11 */}
                <div className="mt-3 text-center">
                  <button
                    onClick={() => onOpenLesson(11)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Click to practice Lesson 11 full screen</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 
            RIGHT COLUMN: COPY & CTA
            Matches Screenshot 2 Exactly
          */}
          <div className="w-full lg:w-1/2 max-w-lg">
            {/* Subtitle / Kicker */}
            <div
              className="text-xs font-bold text-[#8a99ad] uppercase tracking-[0.12em] mb-3"
            >
              WHAT IS TYPING ZONE?
            </div>

            {/* Headline */}
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#222b38] tracking-tight leading-[1.25] mb-6"
              style={{ letterSpacing: '-0.015em' }}
            >
              Typing Zone is the most effective way to learn how to type.
            </h2>

            {/* Body paragraph */}
            <p className="text-base sm:text-lg text-[#5d6b82] leading-relaxed mb-8">
              It is web based and highly effective. Typing Zone is (and will always be) free for both individuals and schools. There is an optional paid school edition.{' '}
              <a
                href="#school-edition"
                onClick={(e) => {
                  e.preventDefault();
                  setSchoolModalOpen(true);
                }}
                className="text-[#1f95f4] hover:underline"
              >
                Typing Zone is completely free forever.
              </a>
            </p>

            {/* "Get Started Now" Bright Blue Button */}
            <button
              onClick={() => setLoginModalOpen(true)}
              className="bg-[#188bf6] hover:bg-[#127ae0] text-white font-semibold text-base px-8 py-3.5 rounded-md shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer select-none"
            >
              Get Started Now
            </button>
          </div>

        </div>
      </section>

      {/* 
        COUNTER / METRIC BANNER (Matches Screenshot 2 Bottom Exactly)
        - Deep royal navy blue background (#0c4382)
        - 3 large metric columns with icons:
          1. 23 million + Students
          2. 50,000 + Schools & Districts
          3. 300,000 + Teachers
      */}
      <section className="bg-[#0c4382] text-white py-12 sm:py-16 px-6 sm:px-12 select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          
          {/* Column 1: Students */}
          <div className="flex items-center justify-center md:justify-start gap-5">
            {/* Student Sitting with Laptop Icon */}
            <div className="text-white/80 shrink-0">
              <svg className="w-14 h-14" viewBox="0 0 64 64" fill="currentColor">
                <circle cx="32" cy="18" r="8" opacity="0.9" />
                <path d="M 22 30 C 18 30 16 35 16 42 L 18 52 L 46 52 L 48 42 C 48 35 46 30 42 30 Z" opacity="0.8" />
                <path d="M 12 52 L 52 52 L 54 56 L 10 56 Z" opacity="0.95" />
              </svg>
            </div>
            <div>
              <div className="text-3xl sm:text-[34px] font-extrabold text-white tracking-tight leading-none mb-1">
                {studentsVal.toLocaleString()} <span className="font-normal text-2xl">+</span>
              </div>
              <div className="text-sm font-medium text-[#98c3ec]">
                Students
              </div>
            </div>
          </div>

          {/* Column 2: Schools & Districts */}
          <div className="flex items-center justify-center md:justify-start gap-5">
            {/* Classical School Building Icon with Columns and Flag */}
            <div className="text-white/80 shrink-0">
              <svg className="w-14 h-14" viewBox="0 0 64 64" fill="currentColor">
                {/* Roof / Pediment */}
                <polygon points="32,10 14,24 50,24" opacity="0.95" />
                {/* Flag */}
                <path d="M 32 10 L 32 4 L 38 7 L 32 10" />
                {/* Columns */}
                <rect x="18" y="26" width="5" height="24" rx="1" opacity="0.85" />
                <rect x="26" y="26" width="5" height="24" rx="1" opacity="0.85" />
                <rect x="33" y="26" width="5" height="24" rx="1" opacity="0.85" />
                <rect x="41" y="26" width="5" height="24" rx="1" opacity="0.85" />
                {/* Base foundation */}
                <rect x="12" y="50" width="40" height="5" rx="1" opacity="0.95" />
              </svg>
            </div>
            <div>
              <div className="text-3xl sm:text-[34px] font-extrabold text-white tracking-tight leading-none mb-1">
                {schoolsVal.toLocaleString()} <span className="font-normal text-2xl">+</span>
              </div>
              <div className="text-sm font-medium text-[#98c3ec]">
                Schools & Districts
              </div>
            </div>
          </div>

          {/* Column 3: Teachers */}
          <div className="flex items-center justify-center md:justify-start gap-5">
            {/* Teacher with Presentation Board Icon */}
            <div className="text-white/80 shrink-0">
              <svg className="w-14 h-14" viewBox="0 0 64 64" fill="currentColor">
                {/* Presentation Whiteboard */}
                <rect x="10" y="14" width="36" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.9" />
                <line x1="16" y1="22" x2="38" y2="22" stroke="currentColor" strokeWidth="2.5" />
                <line x1="16" y1="28" x2="30" y2="28" stroke="currentColor" strokeWidth="2.5" />
                {/* Teacher Figure */}
                <circle cx="48" cy="24" r="5" opacity="0.95" />
                <path d="M 42 34 C 42 31 45 30 48 30 C 51 30 54 31 54 34 L 54 48 L 42 48 Z" opacity="0.85" />
                <path d="M 42 34 L 34 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="text-3xl sm:text-[34px] font-extrabold text-white tracking-tight leading-none mb-1">
                {teachersVal.toLocaleString()} <span className="font-normal text-2xl">+</span>
              </div>
              <div className="text-sm font-medium text-[#98c3ec]">
                Teachers
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 
        SCHOOL EDITION MODAL (Interactive for Teachers & Administrators)
      */}
      {schoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-800">
            <button
              onClick={() => setSchoolModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <School className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Typing Zone School Edition
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              The premier touch-typing curriculum trusted by over 50,000 schools and districts. Includes classroom roster management, grading rubrics, automated reports, and Single Sign-On with Google Classroom, Clever, and ClassLink.
            </p>
            <div className="space-y-2 mb-6 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Custom typing tests and district benchmarking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Fully ad-free learning portal for students K-12</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Accessibility support for voice-over and screen readers</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSchoolModalOpen(false);
                  onEnterApp();
                }}
                className="flex-1 py-3 bg-[#188bf6] hover:bg-[#127ae0] text-white rounded-lg text-sm font-bold transition-colors cursor-pointer"
              >
                Launch Free School Demo
              </button>
              <button
                onClick={() => setSchoolModalOpen(false)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORE MODAL */}
      {storeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-100 text-slate-800 text-center">
            <button
              onClick={() => setStoreModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-4xl mb-3">⌨️</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Typing Zone Store</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Equip your classroom with physical silicone keyboard covers that block student sight-lines, motivational posters, and student achievement certificates.
            </p>
            <button
              onClick={() => {
                setStoreModalOpen(false);
                onEnterApp();
              }}
              className="w-full py-2.5 bg-[#188bf6] text-white rounded-lg text-sm font-bold hover:bg-[#127ae0] cursor-pointer"
            >
              Continue to Lessons
            </button>
          </div>
        </div>
      )}

      {/* LOGIN MODAL (Individual Edition with Google, Clever, Office 365, Username/Email, Password) */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          if (onLoginSuccess) {
            onLoginSuccess(user);
          }
          onEnterApp();
        }}
        initialMode="login"
      />
    </div>
  );
};
