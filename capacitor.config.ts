import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.demo.push',
  appName: 'simple-demo-notifications',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
