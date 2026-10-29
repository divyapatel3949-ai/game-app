import React, { useEffect } from 'react';
import { RotateCcw, Home, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOTIVATIONAL_MESSAGES } from '../game/constants';

interface GameOverModalProps {
  score: number;
  bestScore: number;
  isNewHigh: boolean;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  bestScore,
  isNewHigh,
  onRestart,
  onHome,
}) => {
  // Fire confetti if new high score!
  useEffect(() => {
    if (isNewHigh && score > 3) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f5ff', '#ff0055', '#ffe600', '#b026ff'],
        });
      } catch {
        // ignore
      }
    }
  }, [isNewHigh, score]);

  // Pick motivational message deterministically based on score
  const message = React.useMemo(() => {
    let pool = MOTIVATIONAL_MESSAGES.novice;
    if (score >= 50) pool = MOTIVATIONAL_MESSAGES.master;
    else if (score >= 25) pool = MOTIVATIONAL_MESSAGES.advanced;
    else if (score >= 10) pool = MOTIVATIONAL_MESSAGES.intermediate;

    const index = Math.abs(score * 31 + 7) % pool.length;
    return pool[index];
  }, [score]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 z-30 max-w-[560px] mx-auto bg-black/75 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0e1628] to-[#070b16] border border-red-500/40 p-6 flex flex-col items-center text-center shadow-[0_0_50px_rgba(255,0,85,0.4)]">
        {/* Game Over Title */}
        <div className="text-4xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-rose-400 drop-shadow-[0_0_20px_rgba(255,0,85,0.8)] font-mono">
          GAME OVER
        </div>

        {isNewHigh && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase mt-3 animate-bounce">
            <Sparkles size={14} className="text-amber-400" />
            NEW PERSONAL RECORD!
          </div>
        )}

        {/* Scores Card */}
        <div className="grid grid-cols-2 gap-3 w-full mt-6">
          <div className="p-4 rounded-2xl bg-black/50 border border-cyan-500/30 flex flex-col items-center shadow-[0_0_15px_rgba(0,245,255,0.15)]">
            <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest">
              SCORE
            </span>
            <span className="text-3xl font-black font-mono text-white mt-1">
              {score}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/30 flex flex-col items-center shadow-[0_0_15px_rgba(255,183,0,0.15)]">
            <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest flex items-center gap-1">
              <Trophy size={11} className="text-amber-400" /> BEST
            </span>
            <span className="text-3xl font-black font-mono text-amber-300 mt-1">
              {bestScore}
            </span>
          </div>
        </div>

        {/* Motivational message */}
        <p className="text-xs font-mono text-cyan-300/70 mt-5 italic px-2">
          "{message}"
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full mt-6">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-black text-sm font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(0,245,255,0.6)] hover:shadow-[0_0_30px_rgba(0,245,255,0.9)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={18} />
            <span>PLAY AGAIN (SPACE)</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-mono tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={16} />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
