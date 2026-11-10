import React from 'react';
import { Finger } from '../types';
import { FINGER_COLORS } from '../utils/keyboard';

interface HandGuideProps {
  activeFinger: Finger;
  targetKey: string;
}

export const HandGuide: React.FC<HandGuideProps> = ({ activeFinger, targetKey }) => {
  const fingerInfo = FINGER_COLORS[activeFinger];

  // Helper to test if a specific finger is active
  const is = (f: Finger) => activeFinger === f;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between w-full px-2 mb-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Finger Placement Guide
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <span>Target:</span>
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 bg-blue-600 text-white rounded font-mono text-xs uppercase shadow-sm">
            {targetKey === ' ' ? 'Space' : targetKey}
          </span>
          <span className="text-slate-400">·</span>
          <span className={fingerInfo.text}>{fingerInfo.label}</span>
        </div>
      </div>

      {/* Visual Hands Diagram */}
      <div className="flex items-end justify-center gap-8 py-1 select-none">
        {/* Left Hand */}
        <div className="flex items-end gap-1.5 px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-200/60">
          {/* Left Pinky */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium mb-1">P</span>
            <div
              className={`w-3.5 h-10 rounded-t-full transition-all duration-150 ${
                is('left-pinky')
                  ? 'bg-rose-500 shadow-md ring-2 ring-rose-400 -translate-y-1'
                  : 'bg-slate-200'
              }`}
            />
          </div>
          {/* Left Ring */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium mb-1">R</span>
            <div
              className={`w-3.5 h-13 rounded-t-full transition-all duration-150 ${
                is('left-ring')
                  ? 'bg-amber-500 shadow-md ring-2 ring-amber-400 -translate-y-1'
                  : 'bg-slate-200'
              }`}
            />
          </div>
          {/* Left Middle */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium mb-1">M</span>
            <div
              className={`w-3.5 h-15 rounded-t-full transition-all duration-150 ${
                is('left-middle')
                  ? 'bg-emerald-500 shadow-md ring-2 ring-emerald-400 -translate-y-1'
                  : 'bg-slate-200'
              }`}
            />
          </div>
          {/* Left Index */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium mb-1">I</span>
            <div
              className={`w-3.5 h-13 rounded-t-full transition-all duration-150 ${
                is('left-index')
                  ? 'bg-blue-500 shadow-md ring-2 ring-blue-400 -translate-y-1'
                  : 'bg-slate-200'
              }`}
            />
          </div>
          {/* Left Thumb */}
          <div className="flex flex-col items-center ml-1">
            <span className="text-[10px] text-slate-400 font-medium mb-1">T</span>
            <div
              className={`w-4 h-7 rounded-t-full rotate-12 transition-all duration-150 ${
                is('thumb')
                  ? 'bg-indigo-500 shadow-md ring-2 ring-indigo-400 -translate-y-1'
                  : 'bg-slate-200'
              }`}
            />
          </div>
        </div>

        {/* Right Hand */}
        <div className="flex items-end gap-1.5 px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-200/60">
          {/* Right Thumb */}
          <div className="flex flex-col items-center mr-1">
            <span className="text-[10px] text-slate-400 font-medium mb-1">T</span>
            <div
              className={`w-4 h-7 rounded-t-full -rotate-12 transition-all duration-150 ${
                is('thumb')
                  ? 'bg-indigo-500 shadow-md ring-2 ring-indigo-400 -translate-y-1'
                  : 'bg-slate-200'
              }`}
            />
          </div>
          {/* Right Index */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium mb-1">I</span>
            <div
              className={`w-3.5 h-13 rounded-t-full transition-all duration-150 ${
                is('right-index')
                  ? 'bg-indigo-500 shadow-md ring-2 ring-indigo-400 -translate-y-1'
                  : 'bg-slate-200'
              }`}
            />
          </div>
          {/* Right Middle */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium mb-1">M</span>
            <div
              className={`w-3.5 h-15 rounded-t-full transition-all duration-150 ${
                is('right-middle')
                  ? 'bg-emerald-500 shadow-md ring-2 ring-emerald-400 -translate-y-1'
                  : 'bg-slate-200'
              }`}
            />
          </div>
          {/* Right Ring */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium mb-1">R</span>
            <div
              className={`w-3.5 h-13 rounded-t-full transition-all duration-150 ${
                is('right-ring')
                  ? 'bg-amber-500 shadow-md ring-2 ring-amber-400 -translate-y-1'
                  : 'bg-slate-200'
              }`}
            />
          </div>
          {/* Right Pinky */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium mb-1">P</span>
            <div
              className={`w-3.5 h-10 rounded-t-full transition-all duration-150 ${
                is('right-pinky')
                  ? 'bg-purple-500 shadow-md ring-2 ring-purple-400 -translate-y-1'
                  : 'bg-slate-200'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
