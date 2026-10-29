import type { BallSkin, DifficultyLevel } from '../types/game';

// Fixed virtual coordinate system (aspect ratio ~ 9:14.5 or 600x900)
// This scales smoothly to any screen resolution or orientation while maintaining deterministic physics
export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 900;

export const FLOOR_Y = 820; // Landing platform near bottom
export const CEILING_Y = 50;

export const BALL_RADIUS = 16;
export const GRAVITY = 1100; // Pixels per second^2
export const JUMP_IMPULSE = -520; // Upward initial velocity
export const HOLD_JUMP_ACCEL = -750; // Extra upward float while holding jump (up to max duration)
export const MAX_HOLD_JUMP_TIME = 0.16; // Max hold duration in seconds
export const HORIZONTAL_ACCEL = 2200; // Left/Right steering speed
export const HORIZONTAL_DRAG = 0.88; // Friction deceleration
export const MAX_VX = 450; // Max horizontal velocity

// Difficulty configuration
export const DIFFICULTY_PRESETS: Record<DifficultyLevel, {
  name: string;
  speedMultiplier: number;
  gapWidthMultiplier: number;
  obstacleChance: number;
  description: string;
}> = {
  practice: {
    name: 'Practice',
    speedMultiplier: 0.65,
    gapWidthMultiplier: 1.5,
    obstacleChance: 0,
    description: 'Forgiving speed & extra wide apertures. Safe training ground.',
  },
  normal: {
    name: 'Normal',
    speedMultiplier: 1.0,
    gapWidthMultiplier: 1.0,
    obstacleChance: 0.2,
    description: 'Standard arcade challenge with dynamic progression.',
  },
  hard: {
    name: 'Hard',
    speedMultiplier: 1.35,
    gapWidthMultiplier: 0.82,
    obstacleChance: 0.45,
    description: 'Faster vertical movement, narrow apertures & early surprises.',
  },
  insane: {
    name: 'Insane',
    speedMultiplier: 1.75,
    gapWidthMultiplier: 0.68,
    obstacleChance: 0.7,
    description: 'Blistering line velocities & razor-sharp reaction windows.',
  },
};

// Available Neon Skins
export const BALL_SKINS: BallSkin[] = [
  {
    id: 'cyan-pulse',
    name: 'Cyan Pulse',
    primaryColor: '#00f5ff',
    glowColor: 'rgba(0, 245, 255, 0.7)',
    trailColor: 'rgba(0, 245, 255, 0.35)',
    unlockScore: 0, // Default unlocked
  },
  {
    id: 'electric-violet',
    name: 'Electric Violet',
    primaryColor: '#b026ff',
    glowColor: 'rgba(176, 38, 255, 0.7)',
    trailColor: 'rgba(176, 38, 255, 0.35)',
    unlockScore: 10,
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    primaryColor: '#ffb700',
    glowColor: 'rgba(255, 183, 0, 0.75)',
    trailColor: 'rgba(255, 183, 0, 0.35)',
    unlockScore: 25,
  },
  {
    id: 'matrix-emerald',
    name: 'Matrix Emerald',
    primaryColor: '#00ff66',
    glowColor: 'rgba(0, 255, 102, 0.75)',
    trailColor: 'rgba(0, 255, 102, 0.35)',
    unlockScore: 50,
  },
  {
    id: 'hyper-crimson',
    name: 'Hyper Crimson',
    primaryColor: '#ff0055',
    glowColor: 'rgba(255, 0, 85, 0.8)',
    trailColor: 'rgba(255, 0, 85, 0.4)',
    unlockScore: 100,
  },
];

// Motivational Game Over messages based on performance
export const MOTIVATIONAL_MESSAGES = {
  novice: [
    "Timing is everything. Breathe and try again!",
    "The lines move fast, but your eyes will catch up.",
    "First few breaches are about rhythm. You've got this!",
  ],
  intermediate: [
    "Solid attempt! You're finding the groove.",
    "Double digits reached! Master the horizontal steer.",
    "Close one! A split second made the difference.",
  ],
  advanced: [
    "Incredible agility! The laser lines couldn't stop you.",
    "You're in the elite reflex zone. Keep pushing!",
    "High score territory! Your instincts are razor-sharp.",
  ],
  master: [
    "GODLIKE REFLEXES! You breached the impossible.",
    "Arcade Legend! Few have crossed this deep into the matrix.",
    "Pure mastery. Unstoppable precision!",
  ],
};
