import type { PowerUp, PowerUpType, Ball } from '../types/game';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

export class PowerUpManager {
  private activePowerUps: PowerUp[] = [];
  private spawnTimer: number = 14; // First power-up around score/time
  
  // Active status timers
  public shieldActive: boolean = false;
  public slowMoRemaining: number = 0;
  public pointSurgeRemainingBreaches: number = 0;

  public reset() {
    this.activePowerUps = [];
    this.spawnTimer = 12;
    this.shieldActive = false;
    this.slowMoRemaining = 0;
    this.pointSurgeRemainingBreaches = 0;
  }

  public update(dt: number, onCollect: (type: PowerUpType, x: number, y: number) => void, ball: Ball) {
    // 1. Update power-up timers
    if (this.slowMoRemaining > 0) {
      this.slowMoRemaining -= dt;
      if (this.slowMoRemaining <= 0) this.slowMoRemaining = 0;
    }

    // 2. Spawn timer
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnPowerUp();
      this.spawnTimer = 18 + Math.random() * 12; // Next in 18-30s
    }

    // 3. Move active power-ups and test collision with ball
    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      const p = this.activePowerUps[i];
      p.y += p.vy * dt;
      p.pulsePhase += dt * 4;

      // Circle-to-circle collision with ball
      const dx = ball.x - p.x;
      const dy = ball.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < ball.radius + p.radius) {
        // Collected!
        this.applyPowerUp(p.type);
        onCollect(p.type, p.x, p.y);
        this.activePowerUps.splice(i, 1);
        continue;
      }

      // Remove if fell below screen
      if (p.y > CANVAS_HEIGHT + 30) {
        this.activePowerUps.splice(i, 1);
      }
    }
  }

  private spawnPowerUp() {
    const types: PowerUpType[] = ['shield', 'slowmo', 'pointsurge'];
    const type = types[Math.floor(Math.random() * types.length)];
    const margin = 80;
    const x = margin + Math.random() * (CANVAS_WIDTH - margin * 2);

    this.activePowerUps.push({
      id: Math.random().toString(),
      type,
      x,
      y: 100,
      radius: 14,
      vy: 85, // Floats gently downward
      collected: false,
      pulsePhase: 0,
    });
  }

  private applyPowerUp(type: PowerUpType) {
    if (type === 'shield') {
      this.shieldActive = true;
    } else if (type === 'slowmo') {
      this.slowMoRemaining = 6.0; // 6 seconds
    } else if (type === 'pointsurge') {
      this.pointSurgeRemainingBreaches += 3;
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.activePowerUps) {
      const pulse = 1 + Math.sin(p.pulsePhase) * 0.15;
      let color = '#00f5ff';
      let icon = '🛡️';

      if (p.type === 'shield') {
        color = '#00f5ff';
        icon = 'S';
      } else if (p.type === 'slowmo') {
        color = '#ffe600';
        icon = '⌛';
      } else if (p.type === 'pointsurge') {
        color = '#ff00aa';
        icon = '2X';
      }

      ctx.shadowBlur = 18;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (p.radius + 4) * pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Label icon inside
      ctx.fillStyle = '#060814';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, p.x, p.y);
    }
    ctx.restore();
  }
}
