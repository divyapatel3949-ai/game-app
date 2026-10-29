import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export class MobileHaptics {
  // Light tap on jumping / launching
  public static async jump() {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Fallback to web vibration if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(12);
      }
    }
  }

  // Medium impact on successfully breaching a line
  public static async breach() {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      if ('vibrate' in navigator) {
        navigator.vibrate([25, 20, 25]);
      }
    }
  }

  // Heavy shock impact on collision / Game Over
  public static async collision() {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      if ('vibrate' in navigator) {
        navigator.vibrate([60, 40, 80]);
      }
    }
  }

  // Milestone celebration notification
  public static async milestone() {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      if ('vibrate' in navigator) {
        navigator.vibrate([40, 30, 40, 30, 80]);
      }
    }
  }
}
