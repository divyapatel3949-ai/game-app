import React, { useEffect, useRef, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import type { EngineCallbacks } from '../game/engine';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants';
import type { DifficultyLevel, BallSkin } from '../types/game';

interface GameCanvasProps {
  difficulty: DifficultyLevel;
  selectedSkin: BallSkin;
  callbacks: EngineCallbacks;
  engineRef: React.MutableRefObject<GameEngine | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  difficulty,
  selectedSkin,
  callbacks,
  engineRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Setup canvas and engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    const engine = new GameEngine(canvas, {
      onScoreUpdate: (...args) => callbacksRef.current.onScoreUpdate(...args),
      onComboUpdate: (...args) => callbacksRef.current.onComboUpdate(...args),
      onGameOver: (...args) => callbacksRef.current.onGameOver(...args),
      onMilestone: (...args) => callbacksRef.current.onMilestone(...args),
      onPowerUpState: (...args) => callbacksRef.current.onPowerUpState(...args),
      onStateChange: (...args) => callbacksRef.current.onStateChange(...args),
    });
    engine.setDifficulty(difficulty);
    engine.setSkin(selectedSkin);
    engineRef.current = engine;

    // Keyboard listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scrolling on space/arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      engine.onKeyDown(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.onKeyUp(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Auto-pause on tab hidden
    const handleVisibilityChange = () => {
      if (document.hidden && engine.state === 'playing') {
        engine.pauseGame();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update difficulty and skin on prop changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setDifficulty(difficulty);
    }
  }, [difficulty, engineRef]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSkin(selectedSkin);
    }
  }, [selectedSkin, engineRef]);

  // Pointer/Touch jump on direct canvas tap
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    if (engineRef.current) {
      engineRef.current.onPointerJump();
    }
  }, [engineRef]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden select-none touch-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '94vh',
          aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
          boxShadow: '0 0 35px rgba(0, 245, 255, 0.25), inset 0 0 20px rgba(0, 0, 0, 0.8)',
          borderRadius: '16px',
        }}
        className="border border-cyan-500/30 cursor-pointer bg-[#060814]"
      />
    </div>
  );
};
