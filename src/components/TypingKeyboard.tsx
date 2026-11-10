import { Finger, HandGuideMode, KeyboardStyle } from '../types';
import { getFingerForKey } from '../utils/keyboard';
import { HINDI_CHAR_TO_KEY, HINDI_KEY_LABELS } from '../utils/hindiKeyboard';

export interface TypingKeyboardProps {
  targetKey: string;
  pressedKeys?: Set<string>;
  showKeyboard?: boolean;
  handGuideMode?: HandGuideMode;
  keyboardStyle?: KeyboardStyle;
  isHindi?: boolean;
}

interface KeySpec {
  key: string;
  label: string;
  subLabel?: string;
  width?: string;
  finger: Finger;
}

export const TypingKeyboard: React.FC<TypingKeyboardProps> = ({
  targetKey,
  pressedKeys = new Set(),
  showKeyboard = true,
  handGuideMode = 'both',
  keyboardStyle = 'default',
  isHindi = false,
}) => {
  if (!showKeyboard) return null;

  const char = targetKey || '';
  const hindiTarget = isHindi ? HINDI_CHAR_TO_KEY[char] : undefined;
  const isShiftNeeded = isHindi
    ? Boolean(hindiTarget?.shift)
    : char.length === 1 &&
      char !== ' ' &&
      ((char >= 'A' && char <= 'Z') ||
        '~!@#$%^&*()_+{}|:"<>?'.includes(char));

  const fingerInfo = getFingerForKey(char);
  const activeFinger = fingerInfo.finger;
  const targetHand = fingerInfo.hand; // 'left' | 'right'

  // If shift is needed:
  // If target is on right hand -> use left shift.
  // If target is on left hand -> use right shift.
  const activeShiftHand = isShiftNeeded ? (targetHand === 'right' ? 'left' : 'right') : null;

  // QWERTY Key Rows matching the exact layout in Screenshot_2026-11-07_171632_22ecbec1.png
  const row1: KeySpec[] = [
    { key: '`', label: '~', subLabel: '`', finger: 'left-pinky' },
    { key: '1', label: '!', subLabel: '1', finger: 'left-pinky' },
    { key: '2', label: '@', subLabel: '2', finger: 'left-ring' },
    { key: '3', label: '#', subLabel: '3', finger: 'left-middle' },
    { key: '4', label: '$', subLabel: '4', finger: 'left-index' },
    { key: '5', label: '%', subLabel: '5', finger: 'left-index' },
    { key: '6', label: '^', subLabel: '6', finger: 'right-index' },
    { key: '7', label: '&', subLabel: '7', finger: 'right-index' },
    { key: '8', label: '*', subLabel: '8', finger: 'right-middle' },
    { key: '9', label: '(', subLabel: '9', finger: 'right-ring' },
    { key: '0', label: ')', subLabel: '0', finger: 'right-pinky' },
    { key: '-', label: '_', subLabel: '-', finger: 'right-pinky' },
    { key: '=', label: '+', subLabel: '=', finger: 'right-pinky' },
    { key: 'Backspace', label: 'Backspace', width: 'w-18 sm:w-22 text-[10px]', finger: 'right-pinky' },
  ];

  const row2: KeySpec[] = [
    { key: 'Tab', label: 'tab', width: 'w-13 sm:w-16 text-[10px]', finger: 'left-pinky' },
    { key: 'q', label: 'Q', finger: 'left-pinky' },
    { key: 'w', label: 'W', finger: 'left-ring' },
    { key: 'e', label: 'E', finger: 'left-middle' },
    { key: 'r', label: 'R', finger: 'left-index' },
    { key: 't', label: 'T', finger: 'left-index' },
    { key: 'y', label: 'Y', finger: 'right-index' },
    { key: 'u', label: 'U', finger: 'right-index' },
    { key: 'i', label: 'I', finger: 'right-middle' },
    { key: 'o', label: 'O', finger: 'right-ring' },
    { key: 'p', label: 'P', finger: 'right-pinky' },
    { key: '[', label: '{', subLabel: '[', finger: 'right-pinky' },
    { key: ']', label: '}', subLabel: ']', finger: 'right-pinky' },
    { key: '\\', label: '|', subLabel: '\\', finger: 'right-pinky' },
  ];

  const row3: KeySpec[] = [
    { key: 'CapsLock', label: 'caps lock', width: 'w-15 sm:w-18 text-[10px]', finger: 'left-pinky' },
    { key: 'a', label: 'A', finger: 'left-pinky' },
    { key: 's', label: 'S', finger: 'left-ring' },
    { key: 'd', label: 'D', finger: 'left-middle' },
    { key: 'f', label: 'F', finger: 'left-index' },
    { key: 'g', label: 'G', finger: 'left-index' },
    { key: 'h', label: 'H', finger: 'right-index' },
    { key: 'j', label: 'J', finger: 'right-index' },
    { key: 'k', label: 'K', finger: 'right-middle' },
    { key: 'l', label: 'L', finger: 'right-ring' },
    { key: ';', label: ':', subLabel: ';', finger: 'right-pinky' },
    { key: "'", label: '"', subLabel: "'", finger: 'right-pinky' },
    { key: 'Enter', label: 'enter', width: 'w-15 sm:w-18 text-[10px]', finger: 'right-pinky' },
  ];

  const row4: KeySpec[] = [
    { key: 'ShiftLeft', label: 'shift', width: 'w-18 sm:w-22 text-[10px]', finger: 'left-pinky' },
    { key: 'z', label: 'Z', finger: 'left-pinky' },
    { key: 'x', label: 'X', finger: 'left-ring' },
    { key: 'c', label: 'C', finger: 'left-middle' },
    { key: 'v', label: 'V', finger: 'left-index' },
    { key: 'b', label: 'B', finger: 'left-index' },
    { key: 'n', label: 'N', finger: 'right-index' },
    { key: 'm', label: 'M', finger: 'right-index' },
    { key: ',', label: '<', subLabel: ',', finger: 'right-middle' },
    { key: '.', label: '>', subLabel: '.', finger: 'right-ring' },
    { key: '/', label: '?', subLabel: '/', finger: 'right-pinky' },
    { key: 'ShiftRight', label: 'shift', width: 'w-18 sm:w-22 text-[10px]', finger: 'right-pinky' },
  ];

  const row5: KeySpec[] = [
    { key: 'ControlLeft', label: 'control', width: 'w-13 sm:w-15 text-[9px]', finger: 'left-pinky' },
    { key: 'AltLeft', label: 'option', width: 'w-13 sm:w-15 text-[9px]', finger: 'thumb' },
    { key: ' ', label: 'space', width: 'flex-1 max-w-[280px] text-[10px]', finger: 'thumb' },
    { key: 'AltRight', label: 'option', width: 'w-13 sm:w-15 text-[9px]', finger: 'thumb' },
  ];

  // Helper to check if a key is the active target
  const checkIsTarget = (spec: KeySpec) => {
    if (spec.key === 'ShiftLeft') return activeShiftHand === 'left';
    if (spec.key === 'ShiftRight') return activeShiftHand === 'right';

    if (char === ' ' && spec.key === ' ') return true;
    if (char === '\n' && spec.key === 'Enter') return true;

    if (isHindi && hindiTarget) {
      return spec.key.toLowerCase() === hindiTarget.key.toLowerCase();
    }

    const lowerChar = char.toLowerCase();
    if (spec.key.toLowerCase() === lowerChar) return true;
    if (spec.label === char || spec.subLabel === char) return true;

    return false;
  };

  const renderKey = (spec: KeySpec) => {
    const isTarget = checkIsTarget(spec);
    const isPressed =
      pressedKeys.has(spec.key.toLowerCase()) ||
      (spec.key === ' ' && pressedKeys.has(' '));

    // Style variations for keycaps
    let keycapClass = 'bg-white/90 text-slate-800 shadow-[0_3px_0_#e2d6b5,0_4px_6px_rgba(0,0,0,0.03)] border border-[#ebdcb8] hover:bg-white';
    if (keyboardStyle === 'minimal') {
      keycapClass = 'bg-white text-slate-800 border border-slate-200/80 shadow-2xs';
    } else if (keyboardStyle === 'cartoon') {
      keycapClass = 'bg-amber-50 text-slate-900 border-2 border-slate-800 shadow-[0_3px_0_#1e293b] font-bold';
    } else if (keyboardStyle === 'classic') {
      keycapClass = 'bg-[#e5e0d8] text-stone-800 border border-stone-300 shadow-[inset_1px_1px_0_#fff,0_3px_0_#b8b0a2]';
    } else if (keyboardStyle === 'modern') {
      keycapClass = 'bg-slate-900/80 text-slate-100 border border-slate-700/80 shadow-[0_3px_0_#0f172a]';
    } else if (keyboardStyle === 'colorful') {
      keycapClass = 'bg-white/95 text-slate-800 border border-slate-200 shadow-[0_3px_0_#cbd5e1]';
    }

    return (
      <div
        key={spec.key + spec.label}
        className={`relative flex flex-col items-center justify-center h-10 sm:h-12 min-w-[32px] sm:min-w-[42px] px-1 rounded-xl sm:rounded-2xl transition-all duration-100 select-none ${
          spec.width ? spec.width : 'flex-1'
        } ${
          isTarget
            ? 'bg-[#3b82f6] text-white shadow-[0_4px_0_#1d4ed8,0_0_20px_rgba(59,130,246,0.65)] -translate-y-0.5 border border-blue-400 font-bold z-10'
            : isPressed
            ? 'bg-[#fff5d6] text-slate-900 shadow-[0_1px_0_#d8cca8] translate-y-0.5 border border-[#d8cca8]'
            : keycapClass
        }`}
      >
        {/* Keycap Label: Hindi InScript or English QWERTY */}
        {isHindi && HINDI_KEY_LABELS[spec.key.toLowerCase()] ? (
          <div className="flex flex-col items-center justify-center leading-none w-full h-full relative">
            <span className={`text-[9px] self-start pl-1 pt-0.5 ${isTarget ? 'text-blue-100' : 'text-slate-400'}`}>
              {HINDI_KEY_LABELS[spec.key.toLowerCase()].shifted}
            </span>
            <span className={`text-sm sm:text-base font-bold -mt-0.5 ${isTarget ? 'text-white' : 'text-slate-900'}`}>
              {HINDI_KEY_LABELS[spec.key.toLowerCase()].unshifted}
            </span>
            <span className={`text-[8px] font-mono absolute bottom-0.5 right-1 opacity-55 ${isTarget ? 'text-white' : 'text-slate-500'}`}>
              {spec.key.toUpperCase()}
            </span>
          </div>
        ) : spec.subLabel ? (
          <div className="flex flex-col items-center leading-none">
            <span className={`text-[10px] sm:text-[11px] ${isTarget ? 'text-white' : 'text-slate-600'}`}>
              {spec.label}
            </span>
            <span className={`text-[11px] sm:text-xs font-semibold ${isTarget ? 'text-white' : 'text-slate-900'}`}>
              {spec.subLabel}
            </span>
          </div>
        ) : (
          <span className={`font-mono text-xs sm:text-sm font-semibold capitalize ${isTarget ? 'text-white font-extrabold' : ''}`}>
            {spec.label}
          </span>
        )}
      </div>
    );
  };

  // Keyboard enclosure background class based on style
  const getEnclosureClass = () => {
    switch (keyboardStyle) {
      case 'minimal':
        return 'bg-white/90 border border-slate-200 shadow-md';
      case 'cartoon':
        return 'bg-amber-100/90 border-4 border-slate-800 shadow-[0_10px_0_#1e293b]';
      case 'classic':
        return 'bg-[#d6cfc4] border-2 border-[#b5aca0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_6px_12px_rgba(0,0,0,0.08)]';
      case 'modern':
        return 'bg-slate-950/90 border border-slate-800 shadow-[0_12px_30px_rgba(0,0,0,0.5)]';
      case 'colorful':
        return 'bg-gradient-to-r from-pink-100 via-sky-100 to-amber-100 border border-slate-200 shadow-md';
      case 'default':
      default:
        return 'bg-gradient-to-b from-[#fffbe8]/95 via-[#fff8db]/90 to-[#fdf2c9]/90 border-2 border-[#eeddae] shadow-[0_8px_24px_rgba(217,119,6,0.08),0_2px_4px_rgba(0,0,0,0.04)]';
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none pt-2">
      
      {/* 3D Glass Keyboard Enclosure */}
      <div className={`relative p-2.5 sm:p-3.5 backdrop-blur-md rounded-[28px] flex flex-col gap-1.5 z-10 ${getEnclosureClass()}`}>
        <div className="flex gap-1 sm:gap-1.5 justify-center w-full">{row1.map(renderKey)}</div>
        <div className="flex gap-1 sm:gap-1.5 justify-center w-full">{row2.map(renderKey)}</div>
        <div className="flex gap-1 sm:gap-1.5 justify-center w-full">{row3.map(renderKey)}</div>
        <div className="flex gap-1 sm:gap-1.5 justify-center w-full">{row4.map(renderKey)}</div>
        <div className="flex gap-1 sm:gap-1.5 justify-center w-full">{row5.map(renderKey)}</div>
      </div>

      {/* 
        2D HAND DRAWING OUTLINES OVERLAY (Typing Zone)
        Traces left and/or right hands with deep crisp slate outlines, highlighting the active finger with blue outline & glowing blue tip
      */}
      {handGuideMode !== 'off' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-4 z-20 flex justify-between px-2 sm:px-4 overflow-hidden">
          
          {/* LEFT HAND SVG */}
          {(handGuideMode === 'both' || handGuideMode === 'left') && (
            <div className="relative w-1/2 h-full flex justify-start items-end pl-2 sm:pl-6 pb-0">
              <svg
                viewBox="0 0 280 230"
                className="w-full h-full max-h-[185px] sm:max-h-[220px] overflow-visible"
                fill="none"
              >
            {/* Left Pinky (Reaches to Left Shift or 'A') */}
            <path
              d="M 45 230 C 42 180 30 145 22 110 C 18 95 32 90 38 105 C 44 120 48 140 50 160"
              stroke={activeFinger === 'left-pinky' || activeShiftHand === 'left' ? '#2563eb' : '#475569'}
              strokeWidth={activeFinger === 'left-pinky' || activeShiftHand === 'left' ? '3.8' : '2.5'}
              strokeLinecap="round"
            />
            {/* Glowing dot on Left Pinky tip if active */}
            {(activeFinger === 'left-pinky' || activeShiftHand === 'left') && (
              <g>
                <circle cx="28" cy="100" r="12" fill="#38bdf8" opacity="0.4" className="animate-ping" />
                <circle cx="28" cy="100" r="7.5" fill="#2563eb" filter="drop-shadow(0 0 8px #38bdf8)" />
                <circle cx="27" cy="98" r="2.5" fill="#ffffff" />
              </g>
            )}

            {/* Left Ring */}
            <path
              d="M 50 160 C 50 120 54 85 58 60 C 60 48 74 48 76 62 C 78 85 78 120 78 155"
              stroke={activeFinger === 'left-ring' ? '#2563eb' : '#475569'}
              strokeWidth={activeFinger === 'left-ring' ? '3.8' : '2.5'}
              strokeLinecap="round"
            />
            {activeFinger === 'left-ring' && (
              <g>
                <circle cx="67" cy="55" r="12" fill="#38bdf8" opacity="0.4" className="animate-ping" />
                <circle cx="67" cy="55" r="7.5" fill="#2563eb" filter="drop-shadow(0 0 8px #38bdf8)" />
                <circle cx="66" cy="53" r="2.5" fill="#ffffff" />
              </g>
            )}

            {/* Left Middle */}
            <path
              d="M 78 155 C 80 115 88 75 94 40 C 96 28 110 28 112 42 C 114 70 112 115 110 155"
              stroke={activeFinger === 'left-middle' ? '#2563eb' : '#475569'}
              strokeWidth={activeFinger === 'left-middle' ? '3.8' : '2.5'}
              strokeLinecap="round"
            />
            {activeFinger === 'left-middle' && (
              <g>
                <circle cx="103" cy="35" r="12" fill="#38bdf8" opacity="0.4" className="animate-ping" />
                <circle cx="103" cy="35" r="7.5" fill="#2563eb" filter="drop-shadow(0 0 8px #38bdf8)" />
                <circle cx="102" cy="33" r="2.5" fill="#ffffff" />
              </g>
            )}

            {/* Left Index */}
            <path
              d="M 110 155 C 114 120 125 80 135 60 C 138 48 152 50 152 64 C 150 90 144 130 140 160"
              stroke={activeFinger === 'left-index' ? '#2563eb' : '#475569'}
              strokeWidth={activeFinger === 'left-index' ? '3.8' : '2.5'}
              strokeLinecap="round"
            />
            {activeFinger === 'left-index' && (
              <g>
                <circle cx="144" cy="56" r="12" fill="#38bdf8" opacity="0.4" className="animate-ping" />
                <circle cx="144" cy="56" r="7.5" fill="#2563eb" filter="drop-shadow(0 0 8px #38bdf8)" />
                <circle cx="143" cy="54" r="2.5" fill="#ffffff" />
              </g>
            )}

            {/* Left Thumb */}
            <path
              d="M 140 160 C 155 165 185 170 200 180 C 210 188 200 202 188 198 C 170 192 155 188 135 190 L 130 230"
              stroke={activeFinger === 'thumb' && targetHand === 'left' ? '#2563eb' : '#475569'}
              strokeWidth={activeFinger === 'thumb' && targetHand === 'left' ? '3.8' : '2.5'}
              strokeLinecap="round"
            />
            {activeFinger === 'thumb' && targetHand === 'left' && (
              <g>
                <circle cx="198" cy="188" r="12" fill="#38bdf8" opacity="0.4" className="animate-ping" />
                <circle cx="198" cy="188" r="7.5" fill="#2563eb" filter="drop-shadow(0 0 8px #38bdf8)" />
                <circle cx="197" cy="186" r="2.5" fill="#ffffff" />
              </g>
            )}

            {/* Palm base */}
            <path d="M 45 230 L 130 230" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* RIGHT HAND SVG */}
      {(handGuideMode === 'both' || handGuideMode === 'right') && (
            <div className="relative w-1/2 h-full flex justify-end items-end pr-2 sm:pr-6 pb-0">
              <svg
                viewBox="0 0 280 230"
                className="w-full h-full max-h-[185px] sm:max-h-[220px] overflow-visible -scale-x-100"
                fill="none"
              >
                {/* Right Pinky (Reaches to ';' or Right Shift or Enter) */}
                <path
                  d="M 45 230 C 42 180 30 145 22 110 C 18 95 32 90 38 105 C 44 120 48 140 50 160"
                  stroke={activeFinger === 'right-pinky' || activeShiftHand === 'right' ? '#2563eb' : '#475569'}
                  strokeWidth={activeFinger === 'right-pinky' || activeShiftHand === 'right' ? '3.8' : '2.5'}
                  strokeLinecap="round"
                />
                {(activeFinger === 'right-pinky' || activeShiftHand === 'right') && (
                  <g>
                    <circle cx="28" cy="100" r="12" fill="#38bdf8" opacity="0.4" className="animate-ping" />
                    <circle cx="28" cy="100" r="7.5" fill="#2563eb" filter="drop-shadow(0 0 8px #38bdf8)" />
                    <circle cx="27" cy="98" r="2.5" fill="#ffffff" />
                  </g>
                )}

                {/* Right Ring */}
                <path
                  d="M 50 160 C 50 120 54 85 58 60 C 60 48 74 48 76 62 C 78 85 78 120 78 155"
                  stroke={activeFinger === 'right-ring' ? '#2563eb' : '#475569'}
                  strokeWidth={activeFinger === 'right-ring' ? '3.8' : '2.5'}
                  strokeLinecap="round"
                />
                {activeFinger === 'right-ring' && (
                  <g>
                    <circle cx="67" cy="55" r="12" fill="#38bdf8" opacity="0.4" className="animate-ping" />
                    <circle cx="67" cy="55" r="7.5" fill="#2563eb" filter="drop-shadow(0 0 8px #38bdf8)" />
                    <circle cx="66" cy="53" r="2.5" fill="#ffffff" />
                  </g>
                )}

                {/* Right Middle */}
                <path
                  d="M 78 155 C 80 115 88 75 94 40 C 96 28 110 28 112 42 C 114 70 112 115 110 155"
                  stroke={activeFinger === 'right-middle' ? '#2563eb' : '#475569'}
                  strokeWidth={activeFinger === 'right-middle' ? '3.8' : '2.5'}
                  strokeLinecap="round"
                />
                {activeFinger === 'right-middle' && (
                  <g>
                    <circle cx="103" cy="35" r="12" fill="#38bdf8" opacity="0.4" className="animate-ping" />
                    <circle cx="103" cy="35" r="7.5" fill="#2563eb" filter="drop-shadow(0 0 8px #38bdf8)" />
                    <circle cx="102" cy="33" r="2.5" fill="#ffffff" />
                  </g>
                )}

                {/* Right Index */}
                <path
                  d="M 110 155 C 114 120 125 80 135 60 C 138 48 152 50 152 64 C 150 90 144 130 140 160"
                  stroke={activeFinger === 'right-index' ? '#2563eb' : '#475569'}
                  strokeWidth={activeFinger === 'right-index' ? '3.8' : '2.5'}
                  strokeLinecap="round"
                />
                {activeFinger === 'right-index' && (
                  <g>
                    <circle cx="144" cy="56" r="12" fill="#38bdf8" opacity="0.4" className="animate-ping" />
                    <circle cx="144" cy="56" r="7.5" fill="#2563eb" filter="drop-shadow(0 0 8px #38bdf8)" />
                    <circle cx="143" cy="54" r="2.5" fill="#ffffff" />
                  </g>
                )}

                {/* Right Thumb */}
                <path
                  d="M 140 160 C 155 165 185 170 200 180 C 210 188 200 202 188 198 C 170 192 155 188 135 190 L 130 230"
                  stroke={activeFinger === 'thumb' && targetHand === 'right' ? '#2563eb' : '#475569'}
                  strokeWidth={activeFinger === 'thumb' && targetHand === 'right' ? '3.8' : '2.5'}
                  strokeLinecap="round"
                />
                {activeFinger === 'thumb' && targetHand === 'right' && (
                  <g>
                    <circle cx="198" cy="188" r="12" fill="#38bdf8" opacity="0.4" className="animate-ping" />
                    <circle cx="198" cy="188" r="7.5" fill="#2563eb" filter="drop-shadow(0 0 8px #38bdf8)" />
                    <circle cx="197" cy="186" r="2.5" fill="#ffffff" />
                  </g>
                )}

                {/* Palm base */}
                <path d="M 45 230 L 130 230" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
