import React, { useState } from 'react';
import { UserProfile } from '../types';

interface NameModalProps {
  currentProfile: UserProfile;
  isOpen: boolean;
  onSave: (name: string, avatar: string) => void;
  onClose: () => void;
}

const AVATARS = ['🚀', '⚡', '🦉', '🦊', '💻', '🎯', '👑', '🎸', '🌟', '🦄'];

export const NameModal: React.FC<NameModalProps> = ({
  currentProfile,
  isOpen,
  onSave,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState<string>(currentProfile.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentProfile.avatar || '🚀');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = nameInput.trim() || 'Student';
    onSave(finalName, selectedAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl text-center">
        <h2 className="text-xl font-extrabold text-slate-900 mb-1">
          Welcome to Typing Zone!
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Pick your student name and avatar to personalize your touch-typing stats.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar selector */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Avatar
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-transform cursor-pointer ${
                    selectedAvatar === av
                      ? 'bg-blue-100 ring-2 ring-blue-600 scale-110 shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div className="text-left">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={20}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-slate-300 font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-3d-blue w-full py-3 rounded-xl text-white font-extrabold text-sm uppercase tracking-wide cursor-pointer shadow-md mt-2"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};
