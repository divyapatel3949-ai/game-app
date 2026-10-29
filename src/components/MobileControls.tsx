import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface MobileControlsProps {
  engineRef: React.MutableRefObject<GameEngine | null>;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ engineRef }) => {
  const leftPressed = useRef(false);
  const rightPressed = useRef(false);

  const updateSteering = () => {
    if (!engineRef.current) return;
    if (leftPressed.current && !rightPressed.current) {
      engineRef.current.setHorizontalSteer(-1);
    } else if (rightPressed.current && !leftPressed.current) {
      engineRef.current.setHorizontalSteer(1);
    } else {
      engineRef.current.setHorizontalSteer(0);
    }
  };

  const handleLeftDown = (e: React.PointerEvent) => {
    e.preventDefault();
    leftPressed.current = true;
    updateSteering();
  };

  const handleLeftUp = (e: React.PointerEvent) => {
    e.preventDefault();
    leftPressed.current = false;
    updateSteering();
  };

  const handleRightDown = (e: React.PointerEvent) => {
    e.preventDefault();
    rightPressed.current = true;
    updateSteering();
  };

  const handleRightUp = (e: React.PointerEvent) => {
    e.preventDefault();
    rightPressed.current = false;
    updateSteering();
  };

  const handleJumpDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (engineRef.current) {
      engineRef.current.onPointerJump();
    }
  };

  return (
    <div className="md:hidden absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none select-none z-20 max-w-[560px] mx-auto">
      {/* Left/Right Directional Buttons */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onPointerDown={handleLeftDown}
          onPointerUp={handleLeftUp}
          onPointerCancel={handleLeftUp}
          className="w-16 h-16 rounded-2xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 active:bg-cyan-500 active:text-black flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.25)] active:scale-95 transition-all touch-none"
        >
          <ChevronLeft size={32} />
        </button>

        <button
          onPointerDown={handleRightDown}
          onPointerUp={handleRightUp}
          onPointerCancel={handleRightUp}
          className="w-16 h-16 rounded-2xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 active:bg-cyan-500 active:text-black flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.25)] active:scale-95 transition-all touch-none"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Jump Button */}
      <div className="pointer-events-auto">
        <button
          onPointerDown={handleJumpDown}
          className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-400 text-black active:scale-90 flex flex-col items-center justify-center font-black font-mono shadow-[0_0_20px_rgba(0,245,255,0.5)] transition-all touch-none"
        >
          <ArrowUp size={28} />
          <span className="text-[10px] tracking-wider -mt-1">JUMP</span>
        </button>
      </div>
    </div>
  );
};
