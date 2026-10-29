import type { Achievement } from '../types/game';
import { StorageManager } from './storage';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_breach',
    title: 'First Breach',
    description: 'Successfully cross your first moving line.',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'combo_novice',
    title: 'Flow State',
    description: 'Reach a 3x combo multiplier.',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'combo_master',
    title: 'Hyper Combo',
    description: 'Reach a 5x combo multiplier.',
    icon: '✨',
    unlocked: false,
  },
  {
    id: 'score_10',
    title: 'Breaker Adept',
    description: 'Reach a score of 10 on Normal or higher difficulty.',
    icon: '🥉',
    unlocked: false,
  },
  {
    id: 'score_25',
    title: 'Neon Veteran',
    description: 'Reach a score of 25.',
    icon: '🥈',
    unlocked: false,
  },
  {
    id: 'score_50',
    title: 'Master of Lines',
    description: 'Reach a score of 50.',
    icon: '🥇',
    unlocked: false,
  },
  {
    id: 'shield_smasher',
    title: 'Line Crusher',
    description: 'Shatter through a lethal line using a Shield.',
    icon: '🛡️',
    unlocked: false,
  },
  {
    id: 'aerial_acrobat',
    title: 'Floor is Lava',
    description: 'Cross 5 consecutive lines without landing on the ground.',
    icon: '🚀',
    unlocked: false,
  },
];

export class AchievementManager {
  public static getAchievements(): Achievement[] {
    const stats = StorageManager.getStats();
    const unlockedIds = new Set(stats.achievements || []);

    return ALL_ACHIEVEMENTS.map(ach => ({
      ...ach,
      unlocked: unlockedIds.has(ach.id),
    }));
  }

  public static unlock(id: string): Achievement | null {
    const stats = StorageManager.getStats();
    if (!stats.achievements) stats.achievements = [];

    if (!stats.achievements.includes(id)) {
      stats.achievements.push(id);
      StorageManager.saveStats(stats);
      const ach = ALL_ACHIEVEMENTS.find(a => a.id === id);
      return ach ? { ...ach, unlocked: true } : null;
    }
    return null;
  }
}
