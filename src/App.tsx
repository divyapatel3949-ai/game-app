import { useState, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { InstructionsModal } from './components/InstructionsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { MobileControls } from './components/MobileControls';
import { GameEngine } from './game/engine';
import type { EngineCallbacks } from './game/engine';
import type { DifficultyLevel, GameStatus, BallSkin } from './types/game';
import { BALL_SKINS } from './game/constants';
import { soundManager } from './game/audio';
import { StorageManager } from './game/storage';

export function App() {
  const [status, setStatus] = useState<GameStatus>('menu');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('normal');
  const [selectedSkin, setSelectedSkin] = useState<BallSkin>(() => {
    const savedSkinId = StorageManager.getSelectedSkin();
    return BALL_SKINS.find((s) => s.id === savedSkinId) || BALL_SKINS[0];
  });

  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => StorageManager.getHighScore('normal'));
  const [bestCombo, setBestCombo] = useState<number>(() => StorageManager.getStats().bestCombo);
  const [combo, setCombo] = useState<number>(0);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1.0);

  const [shieldActive, setShieldActive] = useState<boolean>(false);
  const [slowMoRemaining, setSlowMoRemaining] = useState<number>(0);
  const [pointSurgeCount, setPointSurgeCount] = useState<number>(0);

  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);

  // Modals
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [milestoneBanner, setMilestoneBanner] = useState<number | null>(null);

  const engineRef = useRef<GameEngine | null>(null);

  // Engine callbacks
  const callbacks: EngineCallbacks = {
    onScoreUpdate: useCallback((newScore: number, newBest: number) => {
      setScore(newScore);
      setBestScore(newBest);
    }, []),
    onComboUpdate: useCallback((newCombo: number, multiplier: number) => {
      setCombo(newCombo);
      setComboMultiplier(multiplier);
    }, []),
    onGameOver: useCallback((finalScore: number, finalBest: number, newRecord: boolean) => {
      setScore(finalScore);
      setBestScore(finalBest);
      setIsNewHigh(newRecord);
      setBestCombo(StorageManager.getStats().bestCombo);
      setStatus('gameover');
    }, []),
    onMilestone: useCallback((milestoneScore: number) => {
      setMilestoneBanner(milestoneScore);
      setTimeout(() => setMilestoneBanner(null), 2500);
    }, []),
    onPowerUpState: useCallback((shield: boolean, slowMo: number, surge: number) => {
      setShieldActive(shield);
      setSlowMoRemaining(slowMo);
      setPointSurgeCount(surge);
    }, []),
    onStateChange: useCallback((newStatus: GameStatus) => {
      setStatus(newStatus);
    }, []),
  };

  const handleSelectDifficulty = (diff: DifficultyLevel) => {
    setDifficulty(diff);
    setBestScore(StorageManager.getHighScore(diff));
    if (engineRef.current) {
      engineRef.current.setDifficulty(diff);
    }
  };

  const handleSelectSkin = (skin: BallSkin) => {
    setSelectedSkin(skin);
    StorageManager.saveSelectedSkin(skin.id);
    if (engineRef.current) {
      engineRef.current.setSkin(skin);
    }
  };

  const handlePlay = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restartGame();
    }
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.pauseGame();
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.resumeGame();
    }
  };

  const handleHome = () => {
    if (engineRef.current) {
      engineRef.current.returnToMenu();
    }
    setBestScore(StorageManager.getHighScore(difficulty));
    setBestCombo(StorageManager.getStats().bestCombo);
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-screen h-screen bg-[#03050c] flex items-center justify-center overflow-hidden font-sans select-none">
      {/* Ambient background photo blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 blur-md scale-105 pointer-events-none"
        style={{ backgroundImage: 'url(/game-bg.png)' }}
      />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Canvas Host */}
      <GameCanvas
        difficulty={difficulty}
        selectedSkin={selectedSkin}
        callbacks={callbacks}
        engineRef={engineRef}
      />

      {/* HUD during gameplay and paused state */}
      {(status === 'playing' || status === 'paused') && (
        <HUD
          score={score}
          bestScore={bestScore}
          combo={combo}
          comboMultiplier={comboMultiplier}
          difficulty={difficulty}
          shieldActive={shieldActive}
          slowMoRemaining={slowMoRemaining}
          pointSurgeCount={pointSurgeCount}
          isMuted={isMuted}
          onPause={handlePause}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Mobile Controls during active gameplay */}
      {status === 'playing' && <MobileControls engineRef={engineRef} />}

      {/* Milestone Banner Announcement */}
      {milestoneBanner !== null && (
        <div className="absolute top-24 left-0 right-0 flex justify-center pointer-events-none z-30 animate-bounce">
          <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-cyan-400 text-black font-black font-mono text-base tracking-widest uppercase shadow-[0_0_25px_rgba(255,183,0,0.8)]">
            🌟 MILESTONE REACHED: {milestoneBanner} PTS! 🌟
          </div>
        </div>
      )}

      {/* Main Menu Screen */}
      {status === 'menu' && (
        <MainMenu
          difficulty={difficulty}
          selectedSkin={selectedSkin}
          highScore={bestScore}
          bestCombo={bestCombo}
          isMuted={isMuted}
          onSelectDifficulty={handleSelectDifficulty}
          onSelectSkin={handleSelectSkin}
          onPlay={handlePlay}
          onOpenInstructions={() => setShowInstructions(true)}
          onOpenAchievements={() => setShowAchievements(true)}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Pause Modal */}
      {status === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {/* Game Over Modal */}
      {status === 'gameover' && (
        <GameOverModal
          score={score}
          bestScore={bestScore}
          isNewHigh={isNewHigh}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <AchievementsModal onClose={() => setShowAchievements(false)} />
      )}
    </div>
  );
}

export default App;
