import { LessonProgress, SessionResult, UserProfile, KeyAccuracyStat, AuthUser } from '../types';

const STORAGE_KEYS = {
  USERS: 'tz_registered_users',
  CURRENT_USER_ID: 'tz_active_user_id',
  PROFILE_PREFIX: 'tz_profile_',
  PROGRESS_PREFIX: 'tz_progress_',
  SESSIONS_PREFIX: 'tz_sessions_',
  KEY_STATS_PREFIX: 'tz_key_stats_',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Guddu',
  avatar: '🐼',
  soundEnabled: true,
  voiceOverEnabled: false,
  fingerGuideEnabled: true,
  handGuideMode: 'both',
  strictMode: false,
  showLiveStats: true,
  showSpeedOnWord: true,
  colorCodedFingers: true,
  keyboardStyle: 'default',
  showKeyboard: true,
  fontSize: 'default',
  fontFamily: 'droid-sans-mono',
  theme: 'car',
};

// ==========================================
// USER AUTHENTICATION & MANAGEMENT
// ==========================================

export function getAllUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getCurrentUser(): AuthUser | null {
  try {
    const activeId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!activeId) return null;
    const users = getAllUsers();
    return users.find((u) => u.id === activeId) || null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  } catch {
    // ignore
  }
}

export function registerOrLoginUser(user: Omit<AuthUser, 'createdAt'>): AuthUser {
  const users = getAllUsers();
  const existingIndex = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());

  let activeUser: AuthUser;
  if (existingIndex >= 0) {
    activeUser = {
      ...users[existingIndex],
      name: user.name || users[existingIndex].name,
      avatar: user.avatar || users[existingIndex].avatar,
      provider: user.provider || users[existingIndex].provider,
    };
    users[existingIndex] = activeUser;
  } else {
    activeUser = {
      ...user,
      createdAt: new Date().toISOString(),
    };
    users.push(activeUser);
    // Initialize brand new empty profile with user's name
    saveProfile({ name: activeUser.name, avatar: activeUser.avatar }, activeUser.id);
  }

  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch {
    // ignore
  }

  setCurrentUser(activeUser);
  return activeUser;
}

export function logoutUser(): void {
  setCurrentUser(null);
}

// Get the active user ID for data scoping
function getActiveScopeId(explicitId?: string): string {
  if (explicitId) return explicitId;
  const current = getCurrentUser();
  return current ? current.id : 'guest';
}

// ==========================================
// PER-USER PROFILE SETTINGS
// ==========================================

export function getProfile(userId?: string): UserProfile {
  const scopeId = getActiveScopeId(userId);
  const currentAuth = getCurrentUser();
  const fallbackName = currentAuth?.name || 'Guddu';
  const fallbackAvatar = currentAuth?.avatar || '🐼';

  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.PROFILE_PREFIX}${scopeId}`);
    if (!raw) {
      return { ...DEFAULT_PROFILE, name: fallbackName, avatar: fallbackAvatar };
    }
    return { ...DEFAULT_PROFILE, name: fallbackName, avatar: fallbackAvatar, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE, name: fallbackName, avatar: fallbackAvatar };
  }
}

export function saveProfile(profile: Partial<UserProfile>, userId?: string): UserProfile {
  const scopeId = getActiveScopeId(userId);
  const current = getProfile(scopeId);
  const updated = { ...current, ...profile };
  try {
    localStorage.setItem(`${STORAGE_KEYS.PROFILE_PREFIX}${scopeId}`, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

// ==========================================
// PER-USER LESSON PROGRESS (0 for new users)
// ==========================================

export function getAllProgress(userId?: string): Record<number, LessonProgress> {
  const scopeId = getActiveScopeId(userId);
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.PROGRESS_PREFIX}${scopeId}`);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveLessonResult(result: SessionResult, userId?: string): void {
  const scopeId = getActiveScopeId(userId);

  // 1. Save session to user's isolated history
  try {
    const rawSessions = localStorage.getItem(`${STORAGE_KEYS.SESSIONS_PREFIX}${scopeId}`);
    const sessions: SessionResult[] = rawSessions ? JSON.parse(rawSessions) : [];
    sessions.unshift(result);
    // Keep last 60 sessions per user
    if (sessions.length > 60) sessions.length = 60;
    localStorage.setItem(`${STORAGE_KEYS.SESSIONS_PREFIX}${scopeId}`, JSON.stringify(sessions));
  } catch {
    // ignore
  }

  // 2. If this was an official curriculum lesson, update lesson progress
  if (result.lessonId) {
    try {
      const all = getAllProgress(scopeId);
      const existing = all[result.lessonId] || {
        lessonId: result.lessonId,
        completed: false,
        bestWpm: 0,
        bestAccuracy: 0,
        stars: 0,
        attempts: 0,
      };

      const isAccuracyPassed = result.accuracy >= 80;
      const isSpeedPassed = result.lessonId >= 89 && result.lessonId < 1000 ? result.wpm >= 10 : true;
      const passed = isAccuracyPassed && isSpeedPassed;

      const updated: LessonProgress = {
        lessonId: result.lessonId,
        completed: existing.completed || passed,
        bestWpm: passed ? Math.max(existing.bestWpm, result.wpm) : existing.bestWpm,
        bestAccuracy: passed ? Math.max(existing.bestAccuracy, result.accuracy) : existing.bestAccuracy,
        stars: passed ? Math.max(existing.stars, result.stars) : existing.stars,
        completedAt: passed ? new Date().toISOString() : existing.completedAt,
        attempts: (existing.attempts || 0) + 1,
      };

      all[result.lessonId] = updated;
      localStorage.setItem(`${STORAGE_KEYS.PROGRESS_PREFIX}${scopeId}`, JSON.stringify(all));
    } catch {
      // ignore
    }
  }
}

// ==========================================
// PER-USER RECENT SESSIONS & ATTEMPTS
// ==========================================

export function getRecentSessions(userId?: string): SessionResult[] {
  const scopeId = getActiveScopeId(userId);
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.SESSIONS_PREFIX}${scopeId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ==========================================
// PER-USER KEY ACCURACY ACCUMULATOR
// ==========================================

export function recordKeyHit(key: string, isError: boolean, userId?: string): void {
  const char = key.toLowerCase();
  if (char.length !== 1 && char !== ' ') return;
  const scopeId = getActiveScopeId(userId);

  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.KEY_STATS_PREFIX}${scopeId}`);
    const stats: Record<string, KeyAccuracyStat> = raw ? JSON.parse(raw) : {};

    const current = stats[char] || {
      key: char,
      totalHits: 0,
      errors: 0,
      accuracy: 100,
    };

    current.totalHits += 1;
    if (isError) current.errors += 1;
    current.accuracy = Math.round(
      ((current.totalHits - current.errors) / current.totalHits) * 100
    );

    stats[char] = current;
    localStorage.setItem(`${STORAGE_KEYS.KEY_STATS_PREFIX}${scopeId}`, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function getKeyAccuracyStats(userId?: string): Record<string, KeyAccuracyStat> {
  const scopeId = getActiveScopeId(userId);
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.KEY_STATS_PREFIX}${scopeId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
