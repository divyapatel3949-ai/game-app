import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.linebreaker.arcade',
  appName: 'LINE BREAKER',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  backgroundColor: '#03050c',
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
    },
    ScreenOrientation: {
      orientation: 'portrait',
    },
  },
};

export default config;
