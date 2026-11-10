import React from 'react';
import { KEYBOARD_ROWS, FINGER_COLORS, KeyDef } from '../utils/keyboard';

interface VirtualKeyboardProps {
  targetKey: string;
  pressedKeys: Set<string>;
  colorCoded?: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  targetKey,
  pressedKeys,
  colorCoded = true,
}) => {
  const normTarget = targetKey.toLowerCase();

  const isTarget = (k: KeyDef) => {
    if (targetKey === ' ' && k.key === ' ') return true;
    if (k.key.toLowerCase() === normTarget) return true;
    if (k.shiftKey === targetKey) return true;
    return false;
  };

  const isPressed = (k: KeyDef) => {
    if (k.key === ' ' && (pressedKeys.has(' ') || pressedKeys.has('space'))) return true;
    if (pressedKeys.has(k.key.toLowerCase())) return true;
    if (k.shiftKey && pressedKeys.has(k.shiftKey.toLowerCase())) return true;
    if (k.key === 'Backspace' && pressedKeys.has('backspace')) return true;
    if (k.key === 'Enter' && pressedKeys.has('enter')) return true;
    return false;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-slate-900/90 rounded-2xl shadow-xl border border-slate-700/60 backdrop-blur-md select-none">
      <div className="flex flex-col gap-1.5">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1.5 w-full justify-center">
            {row.map((k, kIdx) => {
              const active = isTarget(k);
              const pressed = isPressed(k);
              const fingerColor = FINGER_COLORS[k.finger];
              const isHomerowAnchor = k.key === 'f' || k.key === 'j';

              let keyStyle = 'bg-slate-800 text-slate-200 border-slate-700';

              if (colorCoded && !active && !pressed) {
                // Color coded by finger zone
                switch (k.finger) {
                  case 'left-pinky':
                  case 'right-pinky':
                    keyStyle = 'bg-rose-950/40 text-rose-200 border-rose-900/40';
                    break;
                  case 'left-ring':
                  case 'right-ring':
                    keyStyle = 'bg-amber-950/40 text-amber-200 border-amber-900/40';
                    break;
                  case 'left-middle':
                  case 'right-middle':
                    keyStyle = 'bg-emerald-950/40 text-emerald-200 border-emerald-900/40';
                    break;
                  case 'left-index':
                  case 'right-index':
                    keyStyle = 'bg-blue-950/40 text-blue-200 border-blue-900/40';
                    break;
                  case 'thumb':
                    keyStyle = 'bg-slate-800 text-slate-300 border-slate-700';
                    break;
                }
              }

              if (active) {
                keyStyle =
                  'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-300 shadow-[0_0_16px_rgba(59,130,246,0.6)] animate-pulse';
              }

              if (pressed) {
                keyStyle =
                  'bg-emerald-500 text-white border-emerald-300 translate-y-1 shadow-none';
              }

              const widthClass = k.width || 'flex-1 min-w-[28px] sm:min-w-[42px]';

              return (
                <div
                  key={kIdx}
                  className={`relative flex flex-col items-center justify-center h-10 sm:h-12 rounded-lg border font-mono text-xs sm:text-sm font-semibold transition-all duration-75 ${widthClass} ${keyStyle}`}
                  style={{
                    boxShadow: pressed
                      ? 'none'
                      : active
                      ? '0 3px 0 #1e40af'
                      : '0 3px 0 rgba(15, 23, 42, 0.8)',
                  }}
                >
                  {/* Shift label if present */}
                  {k.shiftKey && (
                    <span className="text-[9px] sm:text-[10px] opacity-60 leading-none">
                      {k.shiftKey}
                    </span>
                  )}
                  <span className="leading-none uppercase">
                    {k.display || k.key}
                  </span>

                  {/* Tactile F & J home row bump indicators */}
                  {isHomerowAnchor && (
                    <div className="absolute bottom-1 w-2.5 h-0.5 bg-slate-400 rounded-full opacity-80" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
