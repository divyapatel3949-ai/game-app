import type { Particle, FloatingText } from '../types/game';

export class ParticleSystem {
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  // Reset all active particles
  public clear() {
    this.particles = [];
    this.floatingTexts = [];
  }

  // Create burst of glowing shards when a line is breached
  public createLineBreachBurst(x: number, y: number, color: string, count: number = 30) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 320;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 4,
        color,
        alpha: 1,
        decay: 1.2 + Math.random() * 1.5,
        gravity: 400,
      });
    }
  }

  // Create radial shockwave explosion on collision
  public createCollisionExplosion(x: number, y: number, count: number = 60) {
    const colors = ['#ff0055', '#ff4d88', '#ffffff', '#ff9900'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 450;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 5,
        color,
        alpha: 1,
        decay: 1.0 + Math.random() * 1.8,
        gravity: 300,
      });
    }
  }

  // Create power-up collection sparkles
  public createPowerUpSparkles(x: number, y: number, color: string) {
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1,
        decay: 1.5 + Math.random() * 1.0,
      });
    }
  }

  // Add floating animated score/combo text
  public addFloatingText(text: string, x: number, y: number, color: string = '#00f5ff', scale: number = 1.0) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      color,
      alpha: 1.0,
      scale,
      vy: -90,
      duration: 0.85,
    });
  }

  // Update particles with delta time
  public update(dt: number) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
      p.alpha -= p.decay * dt;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.duration -= dt;
      ft.alpha = Math.max(0, ft.duration / 0.85);

      if (ft.duration <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // Render particles and text
  public render(ctx: CanvasRenderingContext2D) {
    // Render particles
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Render floating texts
    ctx.save();
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `bold ${Math.round(22 * ft.scale)}px 'Chakra Petch', sans-serif, system-ui`;
      ctx.textAlign = 'center';
      ctx.shadowBlur = 12;
      ctx.shadowColor = ft.color;
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }
}
