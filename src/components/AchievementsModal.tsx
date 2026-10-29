import React from 'react';
import { X, Trophy } from 'lucide-react';
import { AchievementManager } from '../game/achievements';

interface AchievementsModalProps {
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose }) => {
  const achievements = AchievementManager.getAchievements();
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-40 max-w-[560px] mx-auto bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
      <div className="w-full max-h-[85vh] rounded-3xl bg-[#0a0f1d] border border-cyan-500/40 p-5 flex flex-col shadow-[0_0_40px_rgba(0,245,255,0.3)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-amber-400" />
            <div className="text-xl font-black italic tracking-wider text-cyan-400 font-mono">
              ACHIEVEMENTS
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress summary */}
        <div className="py-2.5 px-3 my-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-between text-xs font-mono">
          <span className="text-cyan-300">UNLOCKED</span>
          <span className="text-amber-400 font-bold font-mono">
            {unlockedCount} / {achievements.length}
          </span>
        </div>

        {/* Badges list */}
        <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-1 text-xs font-mono scrollbar-thin">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                ach.unlocked
                  ? 'bg-gradient-to-r from-cyan-950/60 to-black/60 border-cyan-500/50 shadow-[0_0_12px_rgba(0,245,255,0.15)]'
                  : 'bg-black/30 border-white/5 opacity-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  ach.unlocked ? 'bg-cyan-500/20 shadow-[0_0_10px_rgba(0,245,255,0.4)]' : 'bg-white/5'
                }`}
              >
                {ach.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`font-bold tracking-wide ${
                    ach.unlocked ? 'text-white' : 'text-zinc-500'
                  }`}
                >
                  {ach.title}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  {ach.description}
                </div>
              </div>
              {ach.unlocked && (
                <span className="text-[10px] uppercase font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400/30">
                  DONE
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-cyan-500/20">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-black font-mono tracking-widest uppercase hover:bg-cyan-400 transition-all cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
