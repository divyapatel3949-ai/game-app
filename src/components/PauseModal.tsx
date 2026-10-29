import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 z-30 max-w-[560px] mx-auto bg-black/75 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
      <div className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-[#0e1628] to-[#070b16] border border-cyan-500/40 p-6 flex flex-col items-center text-center shadow-[0_0_40px_rgba(0,245,255,0.3)]">
        <div className="text-3xl font-black italic tracking-wider text-cyan-400 drop-shadow-[0_0_15px_rgba(0,245,255,0.7)] font-mono mb-6">
          PAUSED
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onResume}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-black text-sm font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(0,245,255,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={18} className="fill-black" />
            <span>RESUME</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-mono tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>RESTART</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300/80 hover:text-white border border-white/10 text-xs font-mono tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={16} />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
