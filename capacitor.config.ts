import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orna.forecast',
  appName: 'LastResources',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    url: 'https://lastresources.vercel.app/home',
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
