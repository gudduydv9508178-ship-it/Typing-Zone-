import React, { useState, useEffect } from 'react';
import { HomeDashboard } from './components/HomeDashboard';
import { GlobalStatsView } from './components/GlobalStatsView';
import { TypingJungleView } from './components/TypingJungleView';
import { CourseStatsView } from './components/CourseStatsView';
import { LessonPractice } from './components/LessonPractice';
import { ResultModal } from './components/ResultModal';
import { NameModal } from './components/NameModal';
import { LandingHero } from './components/LandingHero';
import { LoginModal } from './components/LoginModal';
import { Lesson, LessonProgress, SessionResult, UserProfile, AuthUser } from './types';
import { LESSONS } from './data/lessons';
import { HINDI_LESSONS } from './data/hindiLessons';
import {
  getProfile,
  saveProfile,
  getAllProgress,
  saveLessonResult,
  getRecentSessions,
  getCurrentUser,
  logoutUser,
} from './utils/storage';
import { sounds } from './utils/audio';
import {
  Home,
  BarChart3,
  ChevronDown,
  ArrowLeft,
  LayoutGrid,
  Star,
  Trophy,
  TrendingUp,
  Globe,
  Menu,
  X,
  Keyboard,
  Sparkles,
  LogOut,
  UserPlus,
} from 'lucide-react';

type AppView =
  | 'home' // Main Dashboard (Typing Jungle & Typing Jungle Hindi cards)
  | 'stats' // Global Stats (time spent donut, attempts bar chart, calendar)
  | 'jungle-lessons' // Typing Jungle Course Map
  | 'jungle-stats' // Typing Jungle Course Stats
  | 'hindi-lessons' // Typing Jungle Hindi 20-Lessons Course Map
  | 'hindi-stats' // Typing Jungle Hindi Course Stats
  | 'practice' // Interactive typing practice engine
  | 'landing'; // 3D night sky Landing page

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [view, setView] = useState<AppView>(() => (getCurrentUser() ? 'home' : 'landing'));
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => getProfile(getCurrentUser()?.id));
  const [progress, setProgress] = useState<Record<number, LessonProgress>>(() =>
    getAllProgress(getCurrentUser()?.id)
  );
  const [recentSessions, setRecentSessions] = useState<SessionResult[]>(() =>
    getRecentSessions(getCurrentUser()?.id)
  );
  const [activeResult, setActiveResult] = useState<SessionResult | null>(null);
  const [activeIsNewHighScore, setActiveIsNewHighScore] = useState<boolean>(false);
  const [activePrevScore, setActivePrevScore] = useState<number | undefined>(undefined);
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState<boolean>(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);

  // Sync sound settings
  useEffect(() => {
    sounds.setEnabled(profile.soundEnabled);
  }, [profile.soundEnabled]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const loadUserData = (userId?: string) => {
    const prof = getProfile(userId);
    const prog = getAllProgress(userId);
    const sess = getRecentSessions(userId);
    setProfile(prof);
    setProgress(prog);
    setRecentSessions(sess);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    loadUserData(user.id);
    setView('home');
    showToast(`Welcome, ${user.name}!`);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    loadUserData('guest');
    setView('landing');
    setProfileMenuOpen(false);
    showToast('Logged out successfully');
  };

  const handleUpdateProfile = (partial: Partial<UserProfile>) => {
    const updated = saveProfile(partial, currentUser?.id);
    setProfile(updated);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setView('practice');
    setSidebarOpen(false);
  };

  const handleSessionComplete = (result: SessionResult) => {
    let isHigh = false;
    let prevScoreVal: number | undefined = undefined;

    if (result.lessonId) {
      const prevProg = progress[result.lessonId];
      if (prevProg && prevProg.bestWpm) {
        prevScoreVal = Math.round(prevProg.bestWpm * 10 * (prevProg.bestAccuracy / 100)) + (prevProg.stars || 0) * 50;
        const currentScoreVal = Math.round(result.wpm * 10 * (result.accuracy / 100)) + result.stars * 50;
        if (currentScoreVal > prevScoreVal) {
          isHigh = true;
        }
      }
    }

    setActiveIsNewHighScore(isHigh);
    setActivePrevScore(prevScoreVal);

    saveLessonResult(result, currentUser?.id);
    // Reload state directly from storage for active user
    setProgress(getAllProgress(currentUser?.id));
    setRecentSessions(getRecentSessions(currentUser?.id));
    setActiveResult(result);
  };

  const handleNextLesson = () => {
    if (!currentLesson) return;
    const isHindi = currentLesson.course === 'hindi';
    const activeList = isHindi ? HINDI_LESSONS : LESSONS;
    const nextIdx = activeList.findIndex((l) => l.id === currentLesson.id) + 1;
    setActiveResult(null);
    if (nextIdx < activeList.length) {
      setCurrentLesson(activeList[nextIdx]);
      setView('practice');
    } else {
      setView(isHindi ? 'hindi-lessons' : 'jungle-lessons');
      showToast(isHindi ? '🎉 बधाई हो! आपने सभी 20 हिंदी पाठ पूरे कर लिए!' : '🎉 Congratulations! You completed all lessons!');
    }
  };

  // Determine if we are inside Typing Jungle (English or Hindi)
  const isInsideHindi = view === 'hindi-lessons' || view === 'hindi-stats';
  const isInsideJungle = view === 'jungle-lessons' || view === 'jungle-stats' || isInsideHindi;

  // Course-scoped real-time calculations starting at 0 for active user
  const activeCourseLessons = isInsideHindi ? HINDI_LESSONS : LESSONS;
  const courseProgressItems = activeCourseLessons
    .map((l) => progress[l.id])
    .filter((p): p is LessonProgress => Boolean(p));

  const totalCompleted = courseProgressItems.filter((p) => p.completed).length;
  const totalStars = courseProgressItems.reduce((acc, curr) => acc + (curr.stars || 0), 0);
  const totalScore = courseProgressItems.reduce(
    (acc, curr) => acc + (curr.bestWpm ? Math.round(curr.bestWpm * 10 * (curr.bestAccuracy / 100)) : 0),
    0
  );
  const progressPercent = Math.min(
    100,
    Math.round((totalCompleted / (isInsideHindi ? HINDI_LESSONS.length : 100)) * 100)
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans select-none antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1e293b] text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-slate-700 text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Edit Modal */}
      <NameModal
        currentProfile={profile}
        isOpen={isNameModalOpen}
        onSave={(name, avatar) => {
          handleUpdateProfile({ name, avatar });
          setIsNameModalOpen(false);
          showToast(`Profile updated: ${name}`);
        }}
        onClose={() => setIsNameModalOpen(false)}
      />

      {/* Login Individual Edition Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode="login"
      />

      {/* Result Modal upon lesson completion */}
      {activeResult && (
        <ResultModal
          result={activeResult}
          isNewHighScore={activeIsNewHighScore}
          previousBestScore={activePrevScore}
          onRetry={() => {
            setActiveResult(null);
          }}
          onNext={
            currentLesson &&
            ((currentLesson.course === 'hindi' && currentLesson.id < 1020) ||
              (currentLesson.course !== 'hindi' && currentLesson.id < LESSONS.length))
              ? handleNextLesson
              : undefined
          }
          onCurriculum={() => {
            setActiveResult(null);
            setView(currentLesson?.course === 'hindi' ? 'hindi-lessons' : 'jungle-lessons');
          }}
        />
      )}

      {/* VIEW: LANDING HERO PAGE */}
      {view === 'landing' ? (
        <LandingHero
          onEnterApp={() => setView('home')}
          onOpenLesson={(lessonId) => {
            const lesson = LESSONS.find((l) => l.id === lessonId) || LESSONS[0];
            handleSelectLesson(lesson);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : view === 'practice' && currentLesson ? (
        <LessonPractice
          key={currentLesson.id}
          lesson={currentLesson}
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onBack={() => setView(currentLesson.course === 'hindi' ? 'hindi-lessons' : 'jungle-lessons')}
          onComplete={handleSessionComplete}
        />
      ) : (
        /* MAIN APPLICATION SHELL (Clean, HD TypingClub Interface) */
        <div className="min-h-screen flex flex-col">
          
          {/* ======================================================== */}
          {/* TOP GLOBAL NAVBAR (Typing Zone Branding)                  */}
          {/* ======================================================== */}
          <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              
              {/* Left Side: Brand Logo & Optional Typing Jungle Breadcrumbs */}
              <div className="flex items-center gap-4 sm:gap-6">
                
                {/* Mobile hamburger */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                {/* Typing Zone Brand Logo */}
                <button
                  onClick={() => setView('home')}
                  className="flex items-center gap-2.5 cursor-pointer group"
                  title="Typing Zone Home"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                    <Keyboard className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    Typing Zone
                  </span>
                </button>

                {/* If inside Typing Jungle (English or Hindi): Display Real-Time Earned Header */}
                {isInsideJungle && (
                  <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-slate-200">
                    <span className="text-base font-extrabold text-slate-900 tracking-tight">
                      {isInsideHindi ? 'Typing Jungle Hindi' : 'Typing Jungle'}
                    </span>

                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <b>{totalStars}</b> Stars
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-700">
                        <Trophy className="w-3.5 h-3.5 text-blue-600" />
                        <b>{totalScore.toLocaleString()}</b> Score
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-700">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <b>{progressPercent}%</b> Progress
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Language & User Profile (Dynamic Greeting) */}
              <div className="flex items-center gap-3 sm:gap-5">
                {/* Landing page link */}
                <button
                  onClick={() => setView('landing')}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="View 3D Landing Page"
                >
                  <span>✨</span>
                  <span>Landing</span>
                </button>

                {/* Language Picker */}
                <div className="relative">
                  <button
                    onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-slate-500" />
                    <span>English (EN)</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {languageMenuOpen && (
                    <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 text-xs font-semibold z-50 animate-in fade-in">
                      <button
                        onClick={() => {
                          setLanguageMenuOpen(false);
                          showToast('Language: English (EN)');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-900 flex items-center justify-between"
                      >
                        <span>English (EN)</span>
                        <span>✓</span>
                      </button>
                      <button
                        onClick={() => {
                          setLanguageMenuOpen(false);
                          showToast('हिन्दी भाषा सक्रिय की गई');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        हिन्दी (Hindi)
                      </button>
                    </div>
                  )}
                </div>

                {/* User Profile Pill or Login Button */}
                {currentUser ? (
                  <div className="relative">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-2 py-1 px-2.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      title="User Profile"
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shadow-2xs">
                        {profile.avatar || currentUser.avatar || '🐼'}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 max-w-[120px] truncate">
                        {profile.name || currentUser.name}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {profileMenuOpen && (
                      <div className="absolute right-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 text-xs font-semibold z-50 animate-in fade-in">
                        <div className="px-3.5 py-2 border-b border-slate-100 mb-1">
                          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            Signed In As
                          </div>
                          <div className="text-slate-900 font-extrabold truncate text-sm">
                            {profile.name || currentUser.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate font-mono">
                            {currentUser.email}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            setIsNameModalOpen(true);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <span>✏️</span>
                          <span>Change Name & Avatar</span>
                        </button>

                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            setIsLoginModalOpen(true);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                          <span>Switch User / Log In</span>
                        </button>

                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            setView('landing');
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <span>🌙</span>
                          <span>Landing Page</span>
                        </button>

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-600" />
                          <span>Log out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
                    >
                      Log in
                    </button>
                  </div>
                )}

              </div>

            </div>
          </header>

          {/* ======================================================== */}
          {/* BODY LAYOUT: SIDEBAR + MAIN CONTENT AREA                 */}
          {/* ======================================================== */}
          <div className="flex-1 flex min-h-[calc(100vh-64px)]">
            
            {/* SIDEBAR NAVIGATION */}
            <aside
              className={`fixed inset-y-16 left-0 z-30 w-60 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="p-3 space-y-1">
                {/* 
                  STATE 1: INSIDE TYPING JUNGLE COURSE
                  Tabs:
                  - Dashboard (returns to main Home)
                  - Lessons
                  - Course stats
                */}
                {isInsideJungle ? (
                  <>
                    <button
                      onClick={() => {
                        setView('home');
                        setSidebarOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 text-slate-500" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setView(isInsideHindi ? 'hindi-lessons' : 'jungle-lessons');
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        view === 'jungle-lessons' || view === 'hindi-lessons'
                          ? 'bg-slate-100 text-slate-900 font-bold border-l-4 border-slate-900 rounded-l-none'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutGrid className="w-4 h-4 text-slate-500" />
                        <span>Lessons</span>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          isInsideHindi ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {isInsideHindi ? '20' : '100'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setView(isInsideHindi ? 'hindi-stats' : 'jungle-stats');
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        view === 'jungle-stats' || view === 'hindi-stats'
                          ? 'bg-slate-100 text-slate-900 font-bold border-l-4 border-slate-900 rounded-l-none'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 text-slate-500" />
                      <span>Course stats</span>
                    </button>
                  </>
                ) : (
                  /* 
                    STATE 2: MAIN DASHBOARD SIDEBAR
                    User requirement: "keep ONLY two tabs: Home and Stats. Completely remove the Badges and Library tabs."
                  */
                  <>
                    <button
                      onClick={() => {
                        setView('home');
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        view === 'home'
                          ? 'bg-slate-100 text-slate-900 font-bold border-l-4 border-slate-900 rounded-l-none'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Home className="w-4 h-4 text-slate-500" />
                      <span>Home</span>
                    </button>

                    <button
                      onClick={() => {
                        setView('stats');
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        view === 'stats'
                          ? 'bg-slate-100 text-slate-900 font-bold border-l-4 border-slate-900 rounded-l-none'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 text-slate-500" />
                      <span>Stats</span>
                    </button>
                  </>
                )}
              </div>
            </aside>

            {/* MAIN CONTENT WORKSPACE */}
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              
              {/* VIEW 1: HOME DASHBOARD */}
              {view === 'home' && (
                <HomeDashboard
                  profile={profile}
                  progress={progress}
                  sessions={recentSessions}
                  onOpenTypingJungle={() => setView('jungle-lessons')}
                  onOpenTypingJungleHindi={() => setView('hindi-lessons')}
                />
              )}

              {/* VIEW 2: GLOBAL STATS VIEW */}
              {view === 'stats' && (
                <GlobalStatsView
                  profile={profile}
                  sessions={recentSessions}
                  progress={progress}
                />
              )}

              {/* VIEW 3: TYPING JUNGLE COURSE MAP */}
              {view === 'jungle-lessons' && (
                <TypingJungleView
                  course="english"
                  progress={progress}
                  onSelectLesson={handleSelectLesson}
                  onLockedClick={(id) => {
                    showToast(`🔒 Lesson ${id} is locked. Complete Lesson ${id - 1} first!`);
                  }}
                />
              )}

              {/* VIEW 4: COURSE STATS VIEW */}
              {view === 'jungle-stats' && (
                <CourseStatsView
                  course="english"
                  profile={profile}
                  progress={progress}
                  sessions={recentSessions}
                />
              )}

              {/* VIEW 5: TYPING JUNGLE HINDI 20-LESSONS COURSE MAP */}
              {view === 'hindi-lessons' && (
                <TypingJungleView
                  course="hindi"
                  progress={progress}
                  onSelectLesson={handleSelectLesson}
                  onLockedClick={(id) => {
                    showToast(`🔒 पाठ ${id} लॉक है। पहले पाठ ${id - 1} पूरा करें!`);
                  }}
                />
              )}

              {/* VIEW 6: TYPING JUNGLE HINDI COURSE STATS */}
              {view === 'hindi-stats' && (
                <CourseStatsView
                  course="hindi"
                  profile={profile}
                  progress={progress}
                  sessions={recentSessions}
                />
              )}

            </main>

          </div>

        </div>
      )}
    </div>
  );
}
