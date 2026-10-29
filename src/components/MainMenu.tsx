import React from 'react';
import { Play, Volume2, VolumeX, HelpCircle, Trophy, Palette, Flame } from 'lucide-react';
import type { DifficultyLevel, BallSkin } from '../types/game';
import { BALL_SKINS, DIFFICULTY_PRESETS } from '../game/constants';

interface MainMenuProps {
  difficulty: DifficultyLevel;
  selectedSkin: BallSkin;
  highScore: number;
  bestCombo: number;
  isMuted: boolean;
  onSelectDifficulty: (diff: DifficultyLevel) => void;
  onSelectSkin: (skin: BallSkin) => void;
  onPlay: () => void;
  onOpenInstructions: () => void;
  onOpenAchievements: () => void;
  onToggleMute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  difficulty,
  selectedSkin,
  highScore,
  bestCombo,
  isMuted,
  onSelectDifficulty,
  onSelectSkin,
  onPlay,
  onOpenInstructions,
  onOpenAchievements,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-6 z-20 max-w-[560px] mx-auto bg-black/40 backdrop-blur-[2px]">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={onOpenAchievements}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono uppercase tracking-wider transition-all hover:shadow-[0_0_12px_rgba(0,245,255,0.3)] active:scale-95"
        >
          <Trophy size={14} className="text-amber-400" />
          <span>Trophies</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInstructions}
            className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all hover:shadow-[0_0_12px_rgba(0,245,255,0.3)] active:scale-95"
            title="How to Play"
          >
            <HelpCircle size={18} />
          </button>
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all hover:shadow-[0_0_12px_rgba(0,245,255,0.3)] active:scale-95"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* Main Title Hero */}
      <div className="flex flex-col items-center text-center -mt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-3 shadow-[0_0_12px_rgba(0,245,255,0.2)]">
          <Flame size={14} className="text-pink-500 animate-pulse" />
          Arcade High-Difficulty
        </div>

        <h1 className="text-6xl sm:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-500 drop-shadow-[0_0_35px_rgba(0,245,255,0.9)] select-none">
          LINE
          <br />
          BREAKER
        </h1>

        <p className="text-cyan-300/80 text-xs sm:text-sm font-mono mt-2 tracking-wide max-w-xs">
          Cross the moving laser lines without getting crushed. Timing is survival.
        </p>

        {/* High Score & Combo stat boxes */}
        <div className="flex items-center gap-4 mt-6">
          <div className="px-4 py-2 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex flex-col items-center shadow-[0_0_15px_rgba(0,245,255,0.2)]">
            <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest">
              BEST SCORE
            </span>
            <span className="text-2xl font-black font-mono text-white">
              {highScore}
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-pink-950/70 border border-pink-500/40 flex flex-col items-center shadow-[0_0_15px_rgba(255,0,128,0.2)]">
            <span className="text-[10px] font-mono text-pink-400/80 uppercase tracking-widest">
              BEST COMBO
            </span>
            <span className="text-2xl font-black font-mono text-white">
              {bestCombo}x
            </span>
          </div>
        </div>
      </div>

      {/* Difficulty & Skin Customization & Play */}
      <div className="w-full flex flex-col items-center gap-4">
        {/* Difficulty Selector */}
        <div className="w-full">
          <div className="text-[11px] font-mono text-cyan-400/80 uppercase tracking-wider mb-1.5 text-center">
            DIFFICULTY LEVEL
          </div>
          <div className="grid grid-cols-4 gap-1.5 bg-black/60 p-1 rounded-xl border border-cyan-500/30">
            {(['practice', 'normal', 'hard', 'insane'] as DifficultyLevel[]).map((level) => {
              const active = difficulty === level;
              return (
                <button
                  key={level}
                  onClick={() => onSelectDifficulty(level)}
                  className={`py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(0,245,255,0.6)] scale-[1.02]'
                      : 'text-cyan-400/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
          <div className="text-[10px] font-mono text-cyan-300/60 text-center mt-1">
            {DIFFICULTY_PRESETS[difficulty].description}
          </div>
        </div>

        {/* Skin Selector */}
        <div className="w-full">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400/80 uppercase tracking-wider mb-1.5 px-1">
            <span className="flex items-center gap-1">
              <Palette size={12} />
              Ball Neon Skin
            </span>
            <span className="text-cyan-300">{selectedSkin.name}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            {BALL_SKINS.map((skin) => {
              const isLocked = highScore < skin.unlockScore;
              const isSelected = selectedSkin.id === skin.id;

              return (
                <button
                  key={skin.id}
                  disabled={isLocked}
                  onClick={() => onSelectSkin(skin)}
                  title={isLocked ? `Unlock at score ${skin.unlockScore}` : skin.name}
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  } ${isLocked ? 'cursor-not-allowed opacity-30 grayscale' : 'cursor-pointer'}`}
                  style={{
                    backgroundColor: skin.primaryColor,
                    boxShadow: isSelected ? `0 0 16px ${skin.glowColor}` : 'none',
                  }}
                >
                  {isLocked && (
                    <span className="text-[10px] font-bold text-black bg-white/80 rounded px-1">
                      {skin.unlockScore}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Neon PLAY Button */}
        <button
          onClick={onPlay}
          className="group relative w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-black font-black text-xl font-mono tracking-widest uppercase shadow-[0_0_30px_rgba(0,245,255,0.7)] hover:shadow-[0_0_45px_rgba(0,245,255,1)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Play size={24} className="fill-black" />
          <span>BREACH MATRIX</span>
        </button>

        <div className="text-[11px] font-mono text-cyan-400/60 text-center">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">SPACE</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">TAP</kbd> to Launch
        </div>
      </div>
    </div>
  );
};
