import type { Ball, BallSkin } from '../types/game';
import { 
  CANVAS_WIDTH, 
  FLOOR_Y, 
  CEILING_Y, 
  BALL_RADIUS, 
  GRAVITY, 
  JUMP_IMPULSE, 
  HOLD_JUMP_ACCEL, 
  MAX_HOLD_JUMP_TIME,
  HORIZONTAL_ACCEL,
  HORIZONTAL_DRAG,
  MAX_VX
} from './constants';

export class PhysicsEngine {
  private jumpHoldTimer: number = 0;
  private isJumpHeld: boolean = false;

  public createBall(): Ball {
    return {
      x: CANVAS_WIDTH / 2,
      y: FLOOR_Y - BALL_RADIUS,
      radius: BALL_RADIUS,
      vx: 0,
      vy: 0,
      isGrounded: true,
      trail: [],
      shieldActive: false,
      shieldEnergy: 0,
    };
  }

  public triggerJump(ball: Ball): boolean {
    // Player can jump if on the ground or has not exceeded upward impulse
    // We allow jumping from the ground or responsive multi-jump / air-jump with slight cooldown
    if (ball.isGrounded || ball.vy > -150) {
      ball.vy = JUMP_IMPULSE;
      ball.isGrounded = false;
      this.jumpHoldTimer = 0;
      this.isJumpHeld = true;
      return true;
    }
    return false;
  }

  public setJumpHeld(held: boolean) {
    this.isJumpHeld = held;
    if (!held) {
      this.jumpHoldTimer = MAX_HOLD_JUMP_TIME;
    }
  }

  public update(ball: Ball, dt: number, moveDir: number) {
    // 1. Horizontal acceleration & drag
    if (moveDir !== 0) {
      ball.vx += moveDir * HORIZONTAL_ACCEL * dt;
    } else {
      ball.vx *= Math.pow(HORIZONTAL_DRAG, dt * 60);
    }

    // Clamp horizontal speed
    if (ball.vx > MAX_VX) ball.vx = MAX_VX;
    if (ball.vx < -MAX_VX) ball.vx = -MAX_VX;

    // Apply horizontal velocity
    ball.x += ball.vx * dt;

    // Horizontal screen bounds with soft bounce
    if (ball.x - ball.radius < 10) {
      ball.x = 10 + ball.radius;
      ball.vx = -ball.vx * 0.4;
    } else if (ball.x + ball.radius > CANVAS_WIDTH - 10) {
      ball.x = CANVAS_WIDTH - 10 - ball.radius;
      ball.vx = -ball.vx * 0.4;
    }

    // 2. Vertical gravity and hold-jump boost
    let effectiveGravity = GRAVITY;
    if (this.isJumpHeld && this.jumpHoldTimer < MAX_HOLD_JUMP_TIME && ball.vy < 0) {
      effectiveGravity += HOLD_JUMP_ACCEL;
      this.jumpHoldTimer += dt;
    }

    ball.vy += effectiveGravity * dt;
    ball.y += ball.vy * dt;

    // Ceiling boundary
    if (ball.y - ball.radius < CEILING_Y) {
      ball.y = CEILING_Y + ball.radius;
      ball.vy = Math.max(0, -ball.vy * 0.3);
    }

    // Floor landing boundary
    if (ball.y + ball.radius >= FLOOR_Y) {
      ball.y = FLOOR_Y - ball.radius;
      ball.vy = 0;
      ball.isGrounded = true;
    } else {
      ball.isGrounded = false;
    }

    // 3. Update trail positions
    ball.trail.unshift({
      x: ball.x,
      y: ball.y,
      alpha: 0.65,
      radius: ball.radius,
    });

    // Keep trail length balanced (approx 12 segments)
    if (ball.trail.length > 12) {
      ball.trail.pop();
    }

    for (let i = 0; i < ball.trail.length; i++) {
      ball.trail[i].alpha *= 0.88;
      ball.trail[i].radius *= 0.94;
    }
  }

  // Render the glowing ball and its luminous trail
  public renderBall(ctx: CanvasRenderingContext2D, ball: Ball, skin: BallSkin) {
    ctx.save();

    // 1. Render trail
    for (let i = ball.trail.length - 1; i >= 0; i--) {
      const seg = ball.trail[i];
      if (seg.alpha <= 0.02) continue;
      ctx.globalAlpha = seg.alpha * 0.6;
      ctx.fillStyle = skin.trailColor;
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, seg.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Ball outer neon glow
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 18;
    ctx.shadowColor = skin.glowColor;

    // 3. Main ball sphere
    const grad = ctx.createRadialGradient(
      ball.x - ball.radius * 0.3,
      ball.y - ball.radius * 0.3,
      ball.radius * 0.1,
      ball.x,
      ball.y,
      ball.radius
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, skin.primaryColor);
    grad.addColorStop(1, '#050a1a');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle crisp rim outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4. Render Shield aura if active
    if (ball.shieldActive) {
      ctx.shadowBlur = 24;
      ctx.shadowColor = '#00f5ff';
      ctx.strokeStyle = `rgba(0, 245, 255, ${0.6 + Math.sin(Date.now() / 100) * 0.3})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
