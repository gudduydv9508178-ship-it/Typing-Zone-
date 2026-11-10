import { Finger, KeyFingerMap } from '../types';
import { HINDI_CHAR_TO_KEY } from './hindiKeyboard';

export interface KeyDef {
  key: string;
  display?: string;
  shiftKey?: string;
  width?: string; // e.g., 'w-12', 'w-16', 'flex-1'
  finger: Finger;
}

export const FINGER_COLORS: Record<Finger, { bg: string; text: string; ring: string; label: string }> = {
  'left-pinky': {
    bg: 'bg-rose-50 text-rose-900 border-rose-300',
    text: 'text-rose-700',
    ring: 'border-rose-400 bg-rose-500/20',
    label: 'Left Pinky',
  },
  'left-ring': {
    bg: 'bg-amber-50 text-amber-900 border-amber-300',
    text: 'text-amber-700',
    ring: 'border-amber-400 bg-amber-500/20',
    label: 'Left Ring',
  },
  'left-middle': {
    bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    text: 'text-emerald-700',
    ring: 'border-emerald-400 bg-emerald-500/20',
    label: 'Left Middle',
  },
  'left-index': {
    bg: 'bg-blue-50 text-blue-900 border-blue-300',
    text: 'text-blue-700',
    ring: 'border-blue-400 bg-blue-500/20',
    label: 'Left Index',
  },
  'right-index': {
    bg: 'bg-indigo-50 text-indigo-900 border-indigo-300',
    text: 'text-indigo-700',
    ring: 'border-indigo-400 bg-indigo-500/20',
    label: 'Right Index',
  },
  'right-middle': {
    bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    text: 'text-emerald-700',
    ring: 'border-emerald-400 bg-emerald-500/20',
    label: 'Right Middle',
  },
  'right-ring': {
    bg: 'bg-amber-50 text-amber-900 border-amber-300',
    text: 'text-amber-700',
    ring: 'border-amber-400 bg-amber-500/20',
    label: 'Right Ring',
  },
  'right-pinky': {
    bg: 'bg-purple-50 text-purple-900 border-purple-300',
    text: 'text-purple-700',
    ring: 'border-purple-400 bg-purple-500/20',
    label: 'Right Pinky',
  },
  thumb: {
    bg: 'bg-slate-50 text-slate-900 border-slate-300',
    text: 'text-slate-700',
    ring: 'border-slate-400 bg-slate-500/20',
    label: 'Thumb',
  },
};

export const KEYBOARD_ROWS: KeyDef[][] = [
  // Number row
  [
    { key: '`', shiftKey: '~', finger: 'left-pinky' },
    { key: '1', shiftKey: '!', finger: 'left-pinky' },
    { key: '2', shiftKey: '@', finger: 'left-ring' },
    { key: '3', shiftKey: '#', finger: 'left-middle' },
    { key: '4', shiftKey: '$', finger: 'left-index' },
    { key: '5', shiftKey: '%', finger: 'left-index' },
    { key: '6', shiftKey: '^', finger: 'right-index' },
    { key: '7', shiftKey: '&', finger: 'right-index' },
    { key: '8', shiftKey: '*', finger: 'right-middle' },
    { key: '9', shiftKey: '(', finger: 'right-ring' },
    { key: '0', shiftKey: ')', finger: 'right-pinky' },
    { key: '-', shiftKey: '_', finger: 'right-pinky' },
    { key: '=', shiftKey: '+', finger: 'right-pinky' },
    { key: 'Backspace', display: '⌫', width: 'flex-[1.4]', finger: 'right-pinky' },
  ],
  // Top row
  [
    { key: 'Tab', display: 'Tab', width: 'flex-[1.2]', finger: 'left-pinky' },
    { key: 'q', shiftKey: 'Q', finger: 'left-pinky' },
    { key: 'w', shiftKey: 'W', finger: 'left-ring' },
    { key: 'e', shiftKey: 'E', finger: 'left-middle' },
    { key: 'r', shiftKey: 'R', finger: 'left-index' },
    { key: 't', shiftKey: 'T', finger: 'left-index' },
    { key: 'y', shiftKey: 'Y', finger: 'right-index' },
    { key: 'u', shiftKey: 'U', finger: 'right-index' },
    { key: 'i', shiftKey: 'I', finger: 'right-middle' },
    { key: 'o', shiftKey: 'O', finger: 'right-ring' },
    { key: 'p', shiftKey: 'P', finger: 'right-pinky' },
    { key: '[', shiftKey: '{', finger: 'right-pinky' },
    { key: ']', shiftKey: '}', finger: 'right-pinky' },
    { key: '\\', shiftKey: '|', width: 'flex-[1]', finger: 'right-pinky' },
  ],
  // Home row
  [
    { key: 'CapsLock', display: 'Caps', width: 'flex-[1.5]', finger: 'left-pinky' },
    { key: 'a', shiftKey: 'A', finger: 'left-pinky' },
    { key: 's', shiftKey: 'S', finger: 'left-ring' },
    { key: 'd', shiftKey: 'D', finger: 'left-middle' },
    { key: 'f', shiftKey: 'F', finger: 'left-index' }, // Bump key
    { key: 'g', shiftKey: 'G', finger: 'left-index' },
    { key: 'h', shiftKey: 'H', finger: 'right-index' },
    { key: 'j', shiftKey: 'J', finger: 'right-index' }, // Bump key
    { key: 'k', shiftKey: 'K', finger: 'right-middle' },
    { key: 'l', shiftKey: 'L', finger: 'right-ring' },
    { key: ';', shiftKey: ':', finger: 'right-pinky' },
    { key: "'", shiftKey: '"', finger: 'right-pinky' },
    { key: 'Enter', display: 'Return ↵', width: 'flex-[1.7]', finger: 'right-pinky' },
  ],
  // Bottom row
  [
    { key: 'ShiftLeft', display: 'Shift ⇧', width: 'flex-[1.9]', finger: 'left-pinky' },
    { key: 'z', shiftKey: 'Z', finger: 'left-pinky' },
    { key: 'x', shiftKey: 'X', finger: 'left-ring' },
    { key: 'c', shiftKey: 'C', finger: 'left-middle' },
    { key: 'v', shiftKey: 'V', finger: 'left-index' },
    { key: 'b', shiftKey: 'B', finger: 'left-index' },
    { key: 'n', shiftKey: 'N', finger: 'right-index' },
    { key: 'm', shiftKey: 'M', finger: 'right-index' },
    { key: ',', shiftKey: '<', finger: 'right-middle' },
    { key: '.', shiftKey: '>', finger: 'right-ring' },
    { key: '/', shiftKey: '?', finger: 'right-pinky' },
    { key: 'ShiftRight', display: 'Shift ⇧', width: 'flex-[1.9]', finger: 'right-pinky' },
  ],
  // Space row
  [
    { key: 'ControlLeft', display: 'Ctrl', width: 'flex-[1.2]', finger: 'left-pinky' },
    { key: 'AltLeft', display: 'Alt', width: 'flex-[1]', finger: 'thumb' },
    { key: ' ', display: 'Space', width: 'flex-[5.5]', finger: 'thumb' },
    { key: 'AltRight', display: 'Alt', width: 'flex-[1]', finger: 'thumb' },
    { key: 'ControlRight', display: 'Ctrl', width: 'flex-[1.2]', finger: 'right-pinky' },
  ],
];

export function getFingerForKey(char: string): KeyFingerMap {
  if (!char) {
    return { finger: 'thumb', hand: 'right', fingerName: 'Thumb' };
  }

  const lower = char.toLowerCase();
  if (lower === ' ') {
    return { finger: 'thumb', hand: 'right', fingerName: 'Space (Thumb)' };
  }

  // Check if Devanagari / Hindi character
  const hindiMapped = HINDI_CHAR_TO_KEY[char];
  const lookupKey = hindiMapped ? hindiMapped.key.toLowerCase() : lower;

  for (const row of KEYBOARD_ROWS) {
    for (const k of row) {
      if (k.key.toLowerCase() === lookupKey || k.shiftKey === char) {
        const isLeft = k.finger.startsWith('left');
        return {
          finger: k.finger,
          hand: isLeft ? 'left' : 'right',
          fingerName: FINGER_COLORS[k.finger].label,
        };
      }
    }
  }

  return { finger: 'right-index', hand: 'right', fingerName: 'Index Finger' };
}
