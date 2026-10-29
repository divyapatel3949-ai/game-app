import React from 'react';
import { X, ArrowUp, ArrowLeft, ArrowRight, Shield, Clock, Zap } from 'lucide-react';

interface InstructionsModalProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-40 max-w-[560px] mx-auto bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
      <div className="w-full max-h-[85vh] rounded-3xl bg-[#0a0f1d] border border-cyan-500/40 p-5 flex flex-col shadow-[0_0_40px_rgba(0,245,255,0.3)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="text-xl font-black italic tracking-wider text-cyan-400 font-mono">
            HOW TO PLAY
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-xs font-mono text-cyan-200/90 leading-relaxed scrollbar-thin">
          {/* Section: The Objective */}
          <div className="p-3 rounded-2xl bg-black/40 border border-cyan-500/20">
            <div className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-1">
              1. The Breaker Mechanic
            </div>
            <p className="text-cyan-200/80">
              A lethal neon line continuously moves up and down across the arena. The line features a glowing <strong className="text-white">Breaker Aperture (Gate)</strong>.
            </p>
            <p className="mt-1.5 text-cyan-200/80">
              Time your jump and steer into the aperture. Successfully passing through from below awards <strong className="text-cyan-400">+1 Point</strong> and spawns the next line.
            </p>
            <div className="mt-2 p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-[11px]">
              ⚠️ <strong>Lethal Rule:</strong> Touching any solid part of the line outside the aperture ends the game!
            </div>
          </div>

          {/* Section: Controls */}
          <div className="p-3 rounded-2xl bg-black/40 border border-cyan-500/20">
            <div className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-2">
              2. Controls
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex flex-col">
                <span className="text-cyan-400 font-bold mb-1 flex items-center gap-1">
                  <ArrowUp size={13} /> JUMP / LAUNCH
                </span>
                <span>Spacebar, Up Arrow, W, or Tap Screen. Hold briefly for extra height.</span>
              </div>
              <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex flex-col">
                <span className="text-cyan-400 font-bold mb-1 flex items-center gap-1">
                  <ArrowLeft size={13} /><ArrowRight size={13} /> HORIZONTAL STEER
                </span>
                <span>Left & Right Arrows or A/D keys. On mobile, use touch steering.</span>
              </div>
            </div>
          </div>

          {/* Section: Line Types */}
          <div className="p-3 rounded-2xl bg-black/40 border border-cyan-500/20">
            <div className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-2">
              3. Special Line Types
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div><strong className="text-cyan-400">Normal (Cyan):</strong> Moderate vertical speed.</div>
              <div><strong className="text-amber-400">Fast (Yellow):</strong> High speed, rapid reflex required.</div>
              <div><strong className="text-purple-400">Reverse (Violet):</strong> Unexpectedly switches vertical direction mid-flight.</div>
              <div><strong className="text-emerald-400">Oscillating (Green):</strong> Sinusoidal speed acceleration/deceleration.</div>
              <div><strong className="text-orange-400">Fake (Orange):</strong> Appears to stop, then bursts with speed.</div>
              <div><strong className="text-pink-500">Laser (Neon Red):</strong> Pulsing ultra-fast line with narrow aperture.</div>
              <div><strong className="text-blue-400">Double Line:</strong> Twin coupled lines requiring tight double crossing.</div>
            </div>
          </div>

          {/* Section: Power-ups */}
          <div className="p-3 rounded-2xl bg-black/40 border border-cyan-500/20">
            <div className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-2">
              4. Power-Up Pickups
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-400/30 text-center">
                <Shield size={16} className="mx-auto text-cyan-400 mb-1" />
                <span className="font-bold text-white block">SHIELD</span>
                <span>Shatter straight through lethal lines!</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-950/50 border border-amber-400/30 text-center">
                <Clock size={16} className="mx-auto text-amber-400 mb-1" />
                <span className="font-bold text-white block">SLOW-MO</span>
                <span>Slows lines by 55% for 6 seconds.</span>
              </div>
              <div className="p-2 rounded-xl bg-pink-950/50 border border-pink-400/30 text-center">
                <Zap size={16} className="mx-auto text-pink-400 mb-1" />
                <span className="font-bold text-white block">SURGE</span>
                <span>Double score points for next 3 breaches.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-cyan-500/20">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-black font-mono tracking-widest uppercase hover:bg-cyan-400 transition-all cursor-pointer"
          >
            GOT IT, LET'S PLAY
          </button>
        </div>
      </div>
    </div>
  );
};
