import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.postly.ai',
  appName: 'Postly AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#020617",
      androidSplashResourceName: "splash",
      showSpinner: true,
      spinnerColor: "#f59e0b"
    }
  }
};

export default config;
