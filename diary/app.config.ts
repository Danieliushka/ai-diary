export default {
  expo: {
    name: 'AI Diary Assistant',
    slug: 'ai-diary-assistant',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'aidiary',
    icon: './assets/images/icon.png',
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
    plugins: [
      "expo-font"
    ],
    experiments: {
      tsconfigPaths: true,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.yourdomain.aidiary'
    },
    android: {
      package: 'com.yourdomain.aidiary',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#FFFFFF'
      }
    },
    newArchEnabled: true,
  },
};
