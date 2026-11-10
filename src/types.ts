export type Finger =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky'
  | 'thumb';

export interface KeyFingerMap {
  finger: Finger;
  hand: 'left' | 'right';
  fingerName: string;
}

export interface Lesson {
  id: number;
  course?: 'english' | 'hindi';
  section: string;
  title: string;
  icon?: string;
  type?: 'intro' | 'box' | 'review' | 'practice' | 'play' | 'travel' | 'hand' | 'game' | 'article' | 'speedometer' | 'break';
  boxKeys?: string;
  description: string;
  targetKeys: string[];
  text: string;
  goalWpm?: number;
}

export interface LessonProgress {
  lessonId: number;
  completed: boolean;
  bestWpm: number;
  bestAccuracy: number;
  stars: number; // 1, 2, or 3
  completedAt?: string;
  attempts: number;
}

export interface KeyAccuracyStat {
  key: string;
  totalHits: number;
  errors: number;
  accuracy: number;
}

export interface SessionResult {
  lessonId?: number;
  title: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  timeSeconds: number;
  charactersTyped: number;
  errorCount: number;
  stars: number;
  problemKeys: string[];
  date: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'email' | 'google' | 'clever' | 'office365';
  createdAt: string;
}

export type TypingTheme = 'clean' | 'dark' | 'car' | 'beach' | 'space' | 'nature';
export type FontSize = 'small' | 'default' | 'large' | 'extra-large' | 'accessible';
export type FontFamily = 'droid-sans-mono' | 'roboto-mono' | 'jetbrains-mono';
export type KeyboardStyle = 'default' | 'minimal' | 'cartoon' | 'classic' | 'modern' | 'colorful';
export type HandGuideMode = 'both' | 'left' | 'right' | 'off';

export interface UserProfile {
  name: string;
  avatar: string;
  soundEnabled: boolean;
  voiceOverEnabled?: boolean;
  fingerGuideEnabled: boolean;
  handGuideMode?: HandGuideMode;
  strictMode: boolean; // block on errors
  showLiveStats?: boolean;
  showSpeedOnWord?: boolean;
  colorCodedFingers: boolean;
  keyboardStyle?: KeyboardStyle;
  showKeyboard?: boolean;
  fontSize?: FontSize;
  fontFamily?: FontFamily;
  theme?: TypingTheme;
}
