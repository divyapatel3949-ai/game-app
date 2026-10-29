import type { Ball, MovingLine } from '../types/game';

export interface CrossingResult {
  crossed: boolean;
  isPerfect: boolean;
  lineId: string;
}

export class CollisionSystem {
  // Check continuous collision and crossing detection
  public static evaluateLineInteraction(
    ball: Ball,
    prevBallX: number,
    prevBallY: number,
    line: MovingLine
  ): { collided: boolean; crossed: boolean; isPerfect: boolean } {
    const halfGap = line.gapWidth / 2;
    const leftSegmentEnd = line.gapX - halfGap;
    const rightSegmentStart = line.gapX + halfGap;

    // 1. Check relative vertical plane crossing between previous frame and current frame
    // Relative position before: prevBallY - line.prevY
    // Relative position now: ball.y - line.y
    const relYBefore = prevBallY - line.prevY;
    const relYNow = ball.y - line.y;

    // Has the ball passed through the line's Y plane?
    const crossedYPlane = (relYBefore >= 0 && relYNow <= 0) || (relYBefore <= 0 && relYNow >= 0);

    if (crossedYPlane) {
      // Find the exact interpolation fraction t in [0, 1]
      const deltaRelY = relYNow - relYBefore;
      let t = 0.5;
      if (Math.abs(deltaRelY) > 0.001) {
        t = Math.max(0, Math.min(1, -relYBefore / deltaRelY));
      }

      // Ball and gap position at the exact moment of crossing
      const ballXAtCrossing = prevBallX + t * (ball.x - prevBallX);
      const gapXAtCrossing = line.gapX; // Approximate within frame

      // Distance from gap center
      const distFromGapCenter = Math.abs(ballXAtCrossing - gapXAtCrossing);
      // Effective safe margin (allowing fair clearance without punishing pixel edge)
      const safeRadius = halfGap - ball.radius * 0.7;

      if (distFromGapCenter <= safeRadius) {
        // Safe crossing!
        // We only score if moving upward (breaching the line upward)
        const isUpwardBreach = relYBefore > 0 && relYNow <= 0;
        const isPerfect = distFromGapCenter <= 18;

        return {
          collided: false,
          crossed: isUpwardBreach && !line.crossed,
          isPerfect,
        };
      } else {
        // Ball hit the lethal line outside the gap!
        return {
          collided: true,
          crossed: false,
          isPerfect: false,
        };
      }
    }

    // 2. Proximity circle-to-segment collision check for current frame
    // Check if ball circle overlaps either left or right solid segments
    const verticalDist = Math.abs(ball.y - line.y);
    if (verticalDist < ball.radius + line.thickness / 2) {
      // Within vertical reach of the line. Check horizontal overlap:
      // Left segment: [0, leftSegmentEnd]
      if (ball.x - ball.radius < leftSegmentEnd && ball.x + ball.radius > 0) {
        return { collided: true, crossed: false, isPerfect: false };
      }
      // Right segment: [rightSegmentStart, CANVAS_WIDTH]
      if (ball.x + ball.radius > rightSegmentStart && ball.x - ball.radius < 600) {
        return { collided: true, crossed: false, isPerfect: false };
      }
    }

    return {
      collided: false,
      crossed: false,
      isPerfect: false,
    };
  }
}
