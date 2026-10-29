import type { 
  Ball, 
  MovingLine, 
  DifficultyLevel, 
  GameStatus, 
  BallSkin 
} from '../types/game';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  FLOOR_Y, 
  BALL_SKINS 
} from './constants';
import { PhysicsEngine } from './physics';
import { LineManager } from './lines';
import { CollisionSystem } from './collision';
import { ParticleSystem } from './particles';
import { PowerUpManager } from './powerups';
import { soundManager } from './audio';
import { StorageManager } from './storage';
import { AchievementManager } from './achievements';
import { MobileHaptics } from './haptics';

export interface EngineCallbacks {
  onScoreUpdate: (score: number, best: number) => void;
  onComboUpdate: (combo: number, multiplier: number) => void;
  onGameOver: (finalScore: number, bestScore: number, isNewHigh: boolean) => void;
  onMilestone: (score: number) => void;
  onPowerUpState: (shield: boolean, slowMoRemaining: number, surgeCount: number) => void;
  onStateChange: (state: GameStatus) => void;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private callbacks: EngineCallbacks;

  // Sub-systems
  private physics: PhysicsEngine;
  private lineManager: LineManager;
  private particles: ParticleSystem;
  private powerUps: PowerUpManager;

  // Game state
  public state: GameStatus = 'menu';
  public difficulty: DifficultyLevel = 'normal';
  public selectedSkin: BallSkin;
  
  public score: number = 0;
  public bestScore: number = 0;
  public combo: number = 0;
  public comboTimer: number = 0;
  private linesBreachedSession: number = 0;
  private groundTouchCountSinceLastBreach: number = 0;

  // Entities
  public ball: Ball;
  public activeLines: MovingLine[] = [];
  private ghostCrossing: { x: number; y: number; alpha: number } | null = null;

  // Visual effects
  private screenShakeIntensity: number = 0;
  private screenFlashColor: string = '';
  private screenFlashAlpha: number = 0;

  // Controls state
  private moveLeft: boolean = false;
  private moveRight: boolean = false;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Ambient stars/dust
  private ambientDust: { x: number; y: number; vy: number; radius: number; alpha: number }[] = [];

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get 2D context');
    this.ctx = context;
    this.callbacks = callbacks;

    this.physics = new PhysicsEngine();
    this.lineManager = new LineManager();
    this.particles = new ParticleSystem();
    this.powerUps = new PowerUpManager();

    // Load saved skin
    const savedSkinId = StorageManager.getSelectedSkin();
    this.selectedSkin = BALL_SKINS.find(s => s.id === savedSkinId) || BALL_SKINS[0];

    this.ball = this.physics.createBall();
    this.initAmbientDust();
    this.startLoop();
  }

  private initAmbientDust() {
    this.ambientDust = [];
    for (let i = 0; i < 45; i++) {
      this.ambientDust.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        vy: 15 + Math.random() * 35,
        radius: 1 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.45,
      });
    }
  }

  public setDifficulty(diff: DifficultyLevel) {
    this.difficulty = diff;
    this.bestScore = StorageManager.getHighScore(diff);
  }

  public setSkin(skin: BallSkin) {
    this.selectedSkin = skin;
    StorageManager.saveSelectedSkin(skin.id);
  }

  public startGame() {
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.linesBreachedSession = 0;
    this.groundTouchCountSinceLastBreach = 0;
    this.bestScore = StorageManager.getHighScore(this.difficulty);

    this.ball = this.physics.createBall();
    this.particles.clear();
    this.powerUps.reset();
    this.ghostCrossing = null;

    // Spawn first moving line
    this.activeLines = this.lineManager.generateLine(this.score, this.difficulty);

    this.state = 'playing';
    this.callbacks.onStateChange(this.state);
    this.callbacks.onScoreUpdate(this.score, this.bestScore);
    this.callbacks.onComboUpdate(this.combo, 1.0);
  }

  public restartGame() {
    this.startGame();
  }

  public pauseGame() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.callbacks.onStateChange(this.state);
    }
  }

  public resumeGame() {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.lastTime = performance.now();
      this.callbacks.onStateChange(this.state);
    }
  }

  public returnToMenu() {
    this.state = 'menu';
    this.callbacks.onStateChange(this.state);
  }

  // --- Controls Handlers ---
  public onKeyDown(key: string) {
    if (key === 'ArrowLeft' || key === 'KeyA') {
      this.moveLeft = true;
    } else if (key === 'ArrowRight' || key === 'KeyD') {
      this.moveRight = true;
    } else if (key === 'Space' || key === 'ArrowUp' || key === 'KeyW') {
      if (this.state === 'playing') {
        const jumped = this.physics.triggerJump(this.ball);
        if (jumped) {
          soundManager.playJump();
          MobileHaptics.jump();
        }
      } else if (this.state === 'gameover' || this.state === 'menu') {
        this.startGame();
      }
    } else if (key === 'KeyP' || key === 'Escape') {
      if (this.state === 'playing') this.pauseGame();
      else if (this.state === 'paused') this.resumeGame();
    }
  }

  public onKeyUp(key: string) {
    if (key === 'ArrowLeft' || key === 'KeyA') {
      this.moveLeft = false;
    } else if (key === 'ArrowRight' || key === 'KeyD') {
      this.moveRight = false;
    } else if (key === 'Space' || key === 'ArrowUp' || key === 'KeyW') {
      this.physics.setJumpHeld(false);
    }
  }

  public onPointerJump() {
    if (this.state === 'playing') {
      const jumped = this.physics.triggerJump(this.ball);
      if (jumped) {
        soundManager.playJump();
        MobileHaptics.jump();
      }
    } else if (this.state === 'gameover' || this.state === 'menu') {
      this.startGame();
    }
  }

  public setHorizontalSteer(dir: number) {
    if (dir < 0) {
      this.moveLeft = true;
      this.moveRight = false;
    } else if (dir > 0) {
      this.moveRight = true;
      this.moveLeft = false;
    } else {
      this.moveLeft = false;
      this.moveRight = false;
    }
  }

  // --- Main Game Loop ---
  private startLoop() {
    this.lastTime = performance.now();
    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05); // Cap delta time
      this.lastTime = currentTime;

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  // --- Update Step ---
  private update(dt: number) {
    // Always update ambient dust particles
    for (const d of this.ambientDust) {
      d.y += d.vy * dt;
      if (d.y > CANVAS_HEIGHT) {
        d.y = 0;
        d.x = Math.random() * CANVAS_WIDTH;
      }
    }

    // Decay visual screen effects
    if (this.screenShakeIntensity > 0) {
      this.screenShakeIntensity = Math.max(0, this.screenShakeIntensity - dt * 25);
    }
    if (this.screenFlashAlpha > 0) {
      this.screenFlashAlpha = Math.max(0, this.screenFlashAlpha - dt * 2.5);
    }
    if (this.ghostCrossing) {
      this.ghostCrossing.alpha -= dt * 0.4;
      if (this.ghostCrossing.alpha <= 0) this.ghostCrossing = null;
    }

    this.particles.update(dt);

    if (this.state !== 'playing') {
      return;
    }

    // Update combo expiration timer
    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.callbacks.onComboUpdate(0, 1.0);
      }
    }

    // Determine horizontal input
    let moveDir = 0;
    if (this.moveLeft) moveDir -= 1;
    if (this.moveRight) moveDir += 1;

    // Previous ball position before physics
    const prevBallX = this.ball.x;
    const prevBallY = this.ball.y;

    // Update ball physics
    this.physics.update(this.ball, dt, moveDir);
    this.ball.shieldActive = this.powerUps.shieldActive;

    // Track ground touches for "Floor is Lava" achievement
    if (this.ball.isGrounded) {
      this.groundTouchCountSinceLastBreach++;
    }

    // Update power-up system
    this.powerUps.update(
      dt,
      (type, x, y) => {
        soundManager.playPowerUp();
        this.particles.createPowerUpSparkles(x, y, '#00f5ff');
        this.particles.addFloatingText(`${type.toUpperCase()}!`, x, y - 20, '#00f5ff', 1.2);
        this.callbacks.onPowerUpState(
          this.powerUps.shieldActive,
          this.powerUps.slowMoRemaining,
          this.powerUps.pointSurgeRemainingBreaches
        );
      },
      this.ball
    );

    // Update moving line(s)
    const slowMoActive = this.powerUps.slowMoRemaining > 0;
    this.lineManager.updateLines(this.activeLines, dt, slowMoActive);

    // Evaluate collision and crossing with all active lines
    let anyCollision = false;
    let anyBreach = false;
    let isPerfectBreach = false;

    for (let i = 0; i < this.activeLines.length; i++) {
      const line = this.activeLines[i];
      const result = CollisionSystem.evaluateLineInteraction(this.ball, prevBallX, prevBallY, line);

      if (result.collided) {
        if (this.powerUps.shieldActive) {
          // Shield absorbs lethal impact and shatters the line!
          this.powerUps.shieldActive = false;
          soundManager.playShieldShatter();
          this.particles.createLineBreachBurst(this.ball.x, line.y, '#00f5ff', 40);
          this.particles.addFloatingText('SHIELD SHATTER!', this.ball.x, line.y - 30, '#00f5ff', 1.3);
          AchievementManager.unlock('shield_smasher');
          line.crossed = true;
          anyBreach = true;
          break;
        } else if (this.difficulty !== 'practice') {
          anyCollision = true;
          break;
        }
      }

      if (result.crossed && !line.crossed) {
        line.crossed = true;
        anyBreach = true;
        if (result.isPerfect) isPerfectBreach = true;
      }
    }

    // Handle Collision -> Game Over
    if (anyCollision) {
      this.triggerGameOver();
      return;
    }

    // Handle Successful Breach
    if (anyBreach) {
      this.handleSuccessfulBreach(isPerfectBreach);
    }
  }

  private handleSuccessfulBreach(isPerfect: boolean) {
    this.linesBreachedSession++;
    this.score += 1;

    // Power surge multiplier
    if (this.powerUps.pointSurgeRemainingBreaches > 0) {
      this.score += 1;
      this.powerUps.pointSurgeRemainingBreaches--;
    }

    // Combo streak handling
    this.combo++;
    this.comboTimer = 3.2; // 3.2 seconds to maintain combo
    const multiplier = 1 + Math.min(this.combo - 1, 4) * 0.5;

    // Perfect bonus
    if (isPerfect) {
      this.score += 1;
      soundManager.playPerfect();
      this.particles.addFloatingText('PERFECT! +2', this.ball.x, this.ball.y - 40, '#ffe600', 1.3);
    } else {
      soundManager.playBreach(this.combo);
      this.particles.addFloatingText(
        this.combo > 1 ? `+1 (x${multiplier.toFixed(1)})` : '+1',
        this.ball.x,
        this.ball.y - 35,
        '#00f5ff',
        1.1
      );
    }

    // Record ghost crossing location
    this.ghostCrossing = {
      x: this.ball.x,
      y: this.ball.y,
      alpha: 0.6,
    };

    // Particle burst along the line
    const currentLine = this.activeLines[0];
    if (currentLine) {
      this.particles.createLineBreachBurst(this.ball.x, currentLine.y, currentLine.color, 35);
    }

    // High score check
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
    }

    MobileHaptics.breach();

    // Milestone notifications (10, 25, 50, 100)
    if ([10, 25, 50, 100].includes(this.score)) {
      soundManager.playMilestone();
      MobileHaptics.milestone();
      this.triggerScreenFlash('#ffffff', 0.45);
      this.callbacks.onMilestone(this.score);
      this.particles.addFloatingText(`MILESTONE ${this.score}!`, CANVAS_WIDTH / 2, 280, '#ffe600', 1.8);
    }

    // Achievements check
    AchievementManager.unlock('first_breach');
    if (this.combo >= 3) AchievementManager.unlock('combo_novice');
    if (this.combo >= 5) AchievementManager.unlock('combo_master');
    if (this.score >= 10 && this.difficulty !== 'practice') AchievementManager.unlock('score_10');
    if (this.score >= 25) AchievementManager.unlock('score_25');
    if (this.score >= 50) AchievementManager.unlock('score_50');
    if (this.groundTouchCountSinceLastBreach === 0 && this.linesBreachedSession >= 5) {
      AchievementManager.unlock('aerial_acrobat');
    }
    this.groundTouchCountSinceLastBreach = 0;

    // Immediately generate next line with new patterns and vertical position!
    this.activeLines = this.lineManager.generateLine(this.score, this.difficulty);

    // Update UI callbacks
    this.callbacks.onScoreUpdate(this.score, this.bestScore);
    this.callbacks.onComboUpdate(this.combo, multiplier);
    this.callbacks.onPowerUpState(
      this.powerUps.shieldActive,
      this.powerUps.slowMoRemaining,
      this.powerUps.pointSurgeRemainingBreaches
    );
  }

  private triggerGameOver() {
    this.state = 'gameover';
    soundManager.playCollision();
    MobileHaptics.collision();

    // Screen effects
    this.triggerScreenShake(18);
    this.triggerScreenFlash('#ff0055', 0.65);
    this.particles.createCollisionExplosion(this.ball.x, this.ball.y, 75);

    const isNewHigh = StorageManager.saveHighScore(this.difficulty, this.score);
    StorageManager.recordGameSession(this.score, this.combo, this.linesBreachedSession);

    this.callbacks.onStateChange(this.state);
    this.callbacks.onGameOver(this.score, this.bestScore, isNewHigh);
  }

  public triggerScreenShake(intensity: number) {
    this.screenShakeIntensity = intensity;
  }

  public triggerScreenFlash(color: string, alpha: number) {
    this.screenFlashColor = color;
    this.screenFlashAlpha = alpha;
  }

  // --- Rendering Pipeline ---
  private render() {
    const ctx = this.ctx;
    ctx.save();

    // Apply screen shake offset
    if (this.screenShakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Cyberpunk Dark Void Background
    ctx.fillStyle = '#060814';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Futuristic Neon Perspective Grid
    this.renderCyberGrid(ctx);

    // 3. Ambient Dust / Star Motes
    ctx.fillStyle = '#ffffff';
    for (const d of this.ambientDust) {
      ctx.globalAlpha = d.alpha;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 4. Glowing Floor Landing Platform
    this.renderFloor(ctx);

    // 5. Ghost crossing position (Section 11)
    if (this.ghostCrossing) {
      ctx.save();
      ctx.globalAlpha = this.ghostCrossing.alpha;
      ctx.strokeStyle = '#00f5ff';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(this.ghostCrossing.x, this.ghostCrossing.y, this.ball.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 6. Moving Lines
    if (this.state === 'playing' || this.state === 'paused' || this.state === 'gameover') {
      this.lineManager.renderLines(ctx, this.activeLines);
    }

    // 7. Power-ups
    if (this.state === 'playing' || this.state === 'paused') {
      this.powerUps.render(ctx);
    }

    // 8. Ball and Trail
    if (this.state !== 'menu') {
      this.physics.renderBall(ctx, this.ball, this.selectedSkin);
    }

    // 9. Particle bursts and floating texts
    this.particles.render(ctx);

    // 10. Screen Flash Overlay
    if (this.screenFlashAlpha > 0) {
      ctx.fillStyle = this.screenFlashColor;
      ctx.globalAlpha = this.screenFlashAlpha;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }

  private renderCyberGrid(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.05)';
    ctx.lineWidth = 1;

    // Vertical grid lines
    const gridSpacing = 50;
    for (let x = 0; x <= CANVAS_WIDTH; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 0; y <= CANVAS_HEIGHT; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Vignette gradient around edges
    const vig = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      200,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_HEIGHT / 1.3
    );
    vig.addColorStop(0, 'rgba(6, 8, 20, 0)');
    vig.addColorStop(1, 'rgba(3, 4, 10, 0.7)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.restore();
  }

  private renderFloor(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // Glowing landing baseline
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#00f5ff';
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.85)';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(CANVAS_WIDTH, FLOOR_Y);
    ctx.stroke();

    // Sub-floor gradient
    const floorGrad = ctx.createLinearGradient(0, FLOOR_Y, 0, CANVAS_HEIGHT);
    floorGrad.addColorStop(0, 'rgba(0, 245, 255, 0.2)');
    floorGrad.addColorStop(1, 'rgba(6, 8, 20, 0.95)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, FLOOR_Y, CANVAS_WIDTH, CANVAS_HEIGHT - FLOOR_Y);

    // Decorative tech notches along floor
    ctx.fillStyle = '#00f5ff';
    ctx.shadowBlur = 8;
    for (let x = 30; x < CANVAS_WIDTH; x += 60) {
      ctx.fillRect(x, FLOOR_Y + 4, 18, 3);
    }

    ctx.restore();
  }
}
