import type { MovingLine, LineType, DifficultyLevel } from '../types/game';
import { CANVAS_WIDTH, FLOOR_Y, CEILING_Y, DIFFICULTY_PRESETS } from './constants';

export class LineManager {
  private lineCounter: number = 0;

  // Decide line type based on current score and difficulty
  public pickLineType(score: number, difficulty: DifficultyLevel): LineType {
    if (difficulty === 'practice') {
      return score < 10 ? 'normal' : 'oscillating';
    }

    // Progression:
    // Score 0-5: normal
    // Score 6-10: fast, normal
    // Score 11-20: reverse, oscillating, fast
    // Score 21-30: fake, reverse, oscillating, fast
    // Score 31-50: laser, double, fake, reverse
    // Score 50+: all types with highest weight on laser & double

    const rand = Math.random();

    if (score <= 5) {
      return 'normal';
    } else if (score <= 10) {
      return rand < 0.6 ? 'normal' : 'fast';
    } else if (score <= 20) {
      if (rand < 0.35) return 'normal';
      if (rand < 0.65) return 'fast';
      if (rand < 0.85) return 'reverse';
      return 'oscillating';
    } else if (score <= 35) {
      if (rand < 0.25) return 'fast';
      if (rand < 0.50) return 'reverse';
      if (rand < 0.75) return 'oscillating';
      return 'fake';
    } else {
      // High score (>35)
      if (rand < 0.25) return 'laser';
      if (rand < 0.50) return 'double';
      if (rand < 0.70) return 'fake';
      if (rand < 0.85) return 'reverse';
      return 'fast';
    }
  }

  // Create a new moving line instance based on score and difficulty
  public generateLine(score: number, difficulty: DifficultyLevel): MovingLine[] {
    this.lineCounter++;
    const type = this.pickLineType(score, difficulty);
    const preset = DIFFICULTY_PRESETS[difficulty];

    // Speed calculation: Base speed + score scaling
    const baseSpeed = 160 + Math.min(score * 8, 280);
    let speed = baseSpeed * preset.speedMultiplier;

    // Movement vertical bounds: Always within reachable jump range
    // Ball jumps up to ~320px from floor (Y: 820 -> 500)
    // Ball can chain jump to reach Y: 250
    const minY = Math.max(CEILING_Y + 120, 260 + Math.random() * 80);
    const maxY = Math.min(FLOOR_Y - 90, 680 - Math.random() * 60);

    // Initial Y position: Start roughly midway or near one extreme
    const startY = Math.random() > 0.5 ? minY + 40 : maxY - 40;
    const direction = Math.random() > 0.5 ? 1 : -1;

    // Aperture (gap) configuration:
    // Base gap starts at 150px, shrinks to minimum 75px at high score
    const baseGapWidth = Math.max(80, 160 - score * 1.8) * preset.gapWidthMultiplier;
    const gapWidth = Math.max(70, Math.min(220, baseGapWidth));

    // Gap horizontal position:
    const gapMargin = 50 + gapWidth / 2;
    const gapX = gapMargin + Math.random() * (CANVAS_WIDTH - gapMargin * 2);

    // Horizontal drift for the gap (starts above score 8)
    let gapVx = 0;
    if (score >= 8 && difficulty !== 'practice') {
      const maxDrift = Math.min(180, 60 + score * 3);
      gapVx = (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * maxDrift);
    }

    // Type-specific modifiers
    let color = '#00f5ff';
    let glowColor = 'rgba(0, 245, 255, 0.8)';
    let thickness = 4;

    switch (type) {
      case 'fast':
        speed *= 1.55;
        color = '#ffe600';
        glowColor = 'rgba(255, 230, 0, 0.85)';
        thickness = 4.5;
        break;
      case 'reverse':
        color = '#b026ff';
        glowColor = 'rgba(176, 38, 255, 0.85)';
        thickness = 4.5;
        break;
      case 'oscillating':
        color = '#00ff88';
        glowColor = 'rgba(0, 255, 136, 0.85)';
        thickness = 4.5;
        break;
      case 'fake':
        color = '#ff6600';
        glowColor = 'rgba(255, 102, 0, 0.85)';
        thickness = 5;
        break;
      case 'laser':
        speed *= 1.85;
        color = '#ff0055';
        glowColor = 'rgba(255, 0, 85, 0.95)';
        thickness = 6;
        break;
      case 'double':
        color = '#38bdf8';
        glowColor = 'rgba(56, 189, 248, 0.9)';
        thickness = 4;
        break;
      default:
        color = '#00f5ff';
        glowColor = 'rgba(0, 245, 255, 0.8)';
        thickness = 4;
        break;
    }

    const primaryLine: MovingLine = {
      id: `line_${this.lineCounter}`,
      type,
      y: startY,
      prevY: startY,
      vy: direction * speed,
      minY,
      maxY,
      thickness,
      color,
      glowColor,
      gapX,
      gapWidth,
      gapVx,
      gapMinX: gapMargin,
      gapMaxX: CANVAS_WIDTH - gapMargin,
      oscillationPhase: Math.random() * Math.PI * 2,
      oscillationFreq: 2.2 + Math.random() * 1.5,
      fakeTimer: 1.2 + Math.random() * 1.5,
      fakeTriggered: false,
      reverseCooldown: 1.0 + Math.random() * 1.5,
      crossed: false,
    };

    // If type is double, create twin secondary line offset by 70px
    if (type === 'double') {
      const secondaryLine: MovingLine = {
        ...primaryLine,
        id: `line_${this.lineCounter}_secondary`,
        isSecondary: true,
        secondaryOffset: 65,
        y: startY - 65,
        prevY: startY - 65,
        minY: minY - 65,
        maxY: maxY - 65,
        color: '#ff00aa',
        glowColor: 'rgba(255, 0, 170, 0.85)',
      };
      return [primaryLine, secondaryLine];
    }

    return [primaryLine];
  }

  // Update line movement patterns
  public updateLines(lines: MovingLine[], dt: number, slowMoActive: boolean) {
    const timeScale = slowMoActive ? 0.45 : 1.0;
    const effectiveDt = dt * timeScale;

    for (const line of lines) {
      line.prevY = line.y;

      // 1. Type-specific dynamic behaviors
      if (line.type === 'oscillating') {
        line.oscillationPhase += line.oscillationFreq * effectiveDt;
        // Modulate speed by a sine factor
        const factor = 0.4 + 0.9 * (1 + Math.sin(line.oscillationPhase));
        line.y += line.vy * factor * effectiveDt;
      } else if (line.type === 'reverse') {
        line.reverseCooldown -= effectiveDt;
        if (line.reverseCooldown <= 0) {
          line.vy = -line.vy; // Sudden direction reversal!
          line.reverseCooldown = 1.0 + Math.random() * 1.8;
        }
        line.y += line.vy * effectiveDt;
      } else if (line.type === 'fake') {
        line.fakeTimer -= effectiveDt;
        if (line.fakeTimer <= 0 && !line.fakeTriggered) {
          line.fakeTriggered = true;
          // Sudden velocity burst
          line.vy = -line.vy * 1.7;
        }
        line.y += line.vy * effectiveDt;
      } else {
        // Normal, Fast, Laser, Double
        line.y += line.vy * effectiveDt;
      }

      // 2. Vertical boundary bounce
      if (line.y <= line.minY) {
        line.y = line.minY;
        line.vy = Math.abs(line.vy);
      } else if (line.y >= line.maxY) {
        line.y = line.maxY;
        line.vy = -Math.abs(line.vy);
      }

      // 3. Horizontal aperture (gap) drift
      if (line.gapVx !== 0) {
        line.gapX += line.gapVx * effectiveDt;
        if (line.gapX <= line.gapMinX) {
          line.gapX = line.gapMinX;
          line.gapVx = Math.abs(line.gapVx);
        } else if (line.gapX >= line.gapMaxX) {
          line.gapX = line.gapMaxX;
          line.gapVx = -Math.abs(line.gapVx);
        }
      }
    }
  }

  // Render the glowing line segments and aperture indicators
  public renderLines(ctx: CanvasRenderingContext2D, lines: MovingLine[]) {
    for (const line of lines) {
      const halfGap = line.gapWidth / 2;
      const leftSegmentEnd = line.gapX - halfGap;
      const rightSegmentStart = line.gapX + halfGap;

      ctx.save();

      // Laser pulsing effect for laser line type
      let glowMultiplier = 1.0;
      if (line.type === 'laser') {
        glowMultiplier = 1.2 + Math.sin(Date.now() / 60) * 0.4;
      }

      ctx.shadowBlur = 16 * glowMultiplier;
      ctx.shadowColor = line.glowColor;
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.thickness;
      ctx.lineCap = 'round';

      // 1. Draw Left Solid Segment: from x=0 to leftSegmentEnd
      if (leftSegmentEnd > 0) {
        ctx.beginPath();
        ctx.moveTo(0, line.y);
        ctx.lineTo(leftSegmentEnd, line.y);
        ctx.stroke();
      }

      // 2. Draw Right Solid Segment: from rightSegmentStart to CANVAS_WIDTH
      if (rightSegmentStart < CANVAS_WIDTH) {
        ctx.beginPath();
        ctx.moveTo(rightSegmentStart, line.y);
        ctx.lineTo(CANVAS_WIDTH, line.y);
        ctx.stroke();
      }

      // 3. Draw luminous aperture gate markers (breach brackets)
      // Visual feedback so player clearly sees safe breach portal
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#ffffff';

      // Left bracket marker
      ctx.fillRect(leftSegmentEnd - 3, line.y - 7, 3, 14);
      // Right bracket marker
      ctx.fillRect(rightSegmentStart, line.y - 7, 3, 14);

      // Subtle safe zone glow in the aperture
      ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(0, 245, 255, 0.15)';
      ctx.fillRect(leftSegmentEnd, line.y - 3, line.gapWidth, 6);

      // Line type tag badge above the line center
      ctx.font = '10px "Chakra Petch", sans-serif';
      ctx.fillStyle = line.color;
      ctx.textAlign = 'center';
      ctx.shadowBlur = 6;
      ctx.shadowColor = line.color;
      ctx.fillText(line.type.toUpperCase(), line.gapX, line.y - 12);

      ctx.restore();
    }
  }
}
