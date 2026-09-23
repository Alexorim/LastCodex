import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orna.forecast',
  appName: 'LastResources',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1F1F1F'
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#1F1F1F',
      showSpinner: false
    }
  }
};

export default config;
