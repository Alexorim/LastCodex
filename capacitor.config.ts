import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.last.codex',
  appName: 'LastCodex',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    url: 'https://orna-guild-forecast.vercel.app/home',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0d1117'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0d1117',
      showSpinner: false
    }
  }
};

export default config;
