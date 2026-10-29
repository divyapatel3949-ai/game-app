import React from 'react';
import { Pause, Volume2, VolumeX, Shield, Clock, Zap } from 'lucide-react';
import type { DifficultyLevel } from '../types/game';

interface HUDProps {
  score: number;
  bestScore: number;
  combo: number;
  comboMultiplier: number;
  difficulty: DifficultyLevel;
  shieldActive: boolean;
  slowMoRemaining: number;
  pointSurgeCount: number;
  isMuted: boolean;
  onPause: () => void;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  bestScore,
  combo,
  comboMultiplier,
  difficulty,
  shieldActive,
  slowMoRemaining,
  pointSurgeCount,
  isMuted,
  onPause,
  onToggleMute,
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none flex flex-col gap-2 max-w-[560px] mx-auto z-10">
      {/* Top Bar: Difficulty, Mute, Pause */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Difficulty Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md bg-cyan-950/70 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,245,255,0.2)]">
            {difficulty}
          </span>
          {combo > 1 && (
            <span className="text-[12px] font-bold tracking-wider px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500 to-pink-500 text-black shadow-[0_0_12px_rgba(255,183,0,0.5)] animate-pulse">
              {combo}x COMBO ({comboMultiplier.toFixed(1)}x)
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-black/60 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 backdrop-blur transition-all active:scale-95"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={onPause}
            className="p-2 rounded-lg bg-black/60 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 backdrop-blur transition-all active:scale-95"
            title="Pause (Esc / P)"
          >
            <Pause size={18} />
          </button>
        </div>
      </div>

      {/* Main Score Center Display */}
      <div className="flex flex-col items-center justify-center -mt-2">
        <div className="text-5xl font-black tracking-tight text-white drop-shadow-[0_0_18px_rgba(0,245,255,0.8)] font-mono">
          {score}
        </div>
        <div className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase">
          BEST: {bestScore}
        </div>
      </div>

      {/* Active Power-Ups Shelf */}
      <div className="flex items-center justify-center gap-3 mt-1">
        {shieldActive && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 text-xs font-bold shadow-[0_0_12px_rgba(0,245,255,0.4)]">
            <Shield size={14} className="animate-spin text-cyan-400" />
            <span>SHIELD ACTIVE</span>
          </div>
        )}
        {slowMoRemaining > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-400 text-amber-300 text-xs font-bold shadow-[0_0_12px_rgba(255,183,0,0.4)]">
            <Clock size={14} className="animate-pulse text-amber-400" />
            <span>SLOW-MO {slowMoRemaining.toFixed(1)}s</span>
          </div>
        )}
        {pointSurgeCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-950/80 border border-pink-400 text-pink-300 text-xs font-bold shadow-[0_0_12px_rgba(255,0,128,0.4)]">
            <Zap size={14} className="text-pink-400" />
            <span>2X SURGE ({pointSurgeCount})</span>
          </div>
        )}
      </div>
    </div>
  );
};
