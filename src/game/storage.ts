import type { DifficultyLevel, GameStats } from '../types/game';

const STORAGE_KEY_STATS = 'linebreaker_stats_v1';
const STORAGE_KEY_HIGHSCORES = 'linebreaker_highscores_v1';
const STORAGE_KEY_SELECTED_SKIN = 'linebreaker_selected_skin_v1';

export class StorageManager {
  private static defaultStats: GameStats = {
    highScore: 0,
    bestCombo: 0,
    gamesPlayed: 0,
    totalLinesBreached: 0,
    achievements: [],
  };

  public static getStats(): GameStats {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STATS);
      if (data) {
        return { ...this.defaultStats, ...JSON.parse(data) };
      }
    } catch {
      // Fallback to defaults
    }
    return { ...this.defaultStats };
  }

  public static saveStats(stats: GameStats) {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }

  public static getHighScore(difficulty: DifficultyLevel): number {
    try {
      const data = localStorage.getItem(STORAGE_KEY_HIGHSCORES);
      if (data) {
        const scores = JSON.parse(data);
        return scores[difficulty] || 0;
      }
    } catch {
      // ignore
    }
    return 0;
  }

  public static saveHighScore(difficulty: DifficultyLevel, score: number): boolean {
    const currentHigh = this.getHighScore(difficulty);
    if (score > currentHigh) {
      try {
        const data = localStorage.getItem(STORAGE_KEY_HIGHSCORES);
        const scores = data ? JSON.parse(data) : {};
        scores[difficulty] = score;
        localStorage.setItem(STORAGE_KEY_HIGHSCORES, JSON.stringify(scores));
        
        // Update general stats high score if higher
        const stats = this.getStats();
        if (score > stats.highScore) {
          stats.highScore = score;
          this.saveStats(stats);
        }
        return true; // New record!
      } catch {
        // ignore
      }
    }
    return false;
  }

  public static getSelectedSkin(): string {
    try {
      return localStorage.getItem(STORAGE_KEY_SELECTED_SKIN) || 'cyan-pulse';
    } catch {
      return 'cyan-pulse';
    }
  }

  public static saveSelectedSkin(skinId: string) {
    try {
      localStorage.setItem(STORAGE_KEY_SELECTED_SKIN, skinId);
    } catch {
      // ignore
    }
  }

  public static recordGameSession(finalScore: number, finalCombo: number, linesBreached: number) {
    const stats = this.getStats();
    stats.gamesPlayed += 1;
    stats.totalLinesBreached += linesBreached;
    if (finalScore > stats.highScore) {
      stats.highScore = finalScore;
    }
    if (finalCombo > stats.bestCombo) {
      stats.bestCombo = finalCombo;
    }
    this.saveStats(stats);
  }
}
