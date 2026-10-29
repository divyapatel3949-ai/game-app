export type DifficultyLevel = 'practice' | 'normal' | 'hard' | 'insane';

export type LineType = 
  | 'normal'
  | 'fast'
  | 'reverse'
  | 'oscillating'
  | 'fake'
  | 'laser'
  | 'double';

export type PowerUpType = 'shield' | 'slowmo' | 'pointsurge';

export interface BallSkin {
  id: string;
  name: string;
  primaryColor: string;
  glowColor: string;
  trailColor: string;
  unlockScore: number;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  trail: { x: number; y: number; alpha: number; radius: number }[];
  shieldActive: boolean;
  shieldEnergy: number; // 0 to 1
}

export interface MovingLine {
  id: string;
  type: LineType;
  y: number;
  prevY: number;
  vy: number;
  minY: number;
  maxY: number;
  thickness: number;
  color: string;
  glowColor: string;
  
  // Aperture (gap) through which the ball can safely cross
  gapX: number;
  gapWidth: number;
  gapVx: number; // Horizontal drift of the gap
  gapMinX: number;
  gapMaxX: number;

  // Behavior state
  oscillationPhase: number;
  oscillationFreq: number;
  fakeTimer: number;
  fakeTriggered: boolean;
  reverseCooldown: number;
  
  // For double lines:
  isSecondary?: boolean;
  secondaryOffset?: number; // Distance from primary line
  
  // Scoring state
  crossed: boolean;
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  radius: number;
  vy: number;
  collected: boolean;
  pulsePhase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  gravity?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
  duration: number;
}

export interface GameStats {
  highScore: number;
  bestCombo: number;
  gamesPlayed: number;
  totalLinesBreached: number;
  achievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover';
