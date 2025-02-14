import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const segments = useSegments();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!loaded) return;
    
    const inAuthGroup = segments[0] === 'auth';
    console.log('Перевірка навігації:', { user, inAuthGroup, segments });

    if (!user && !inAuthGroup) {
      // Якщо користувач не авторизований і не на сторінці авторизації
      console.log('Перенаправлення на авторизацію...');
      router.replace('/auth');
    } else if (user && (!segments[0] || segments[0] === undefined)) {
      // Якщо користувач авторизований але немає активного маршруту
      console.log('Перенаправлення на AI чат...');
      router.push('/(tabs)');
    }
  }, [user, segments, loaded]);

  useEffect(() => {
    if (loaded) {
      // Hide the splash screen after the fonts have loaded and the
      // UI is ready.
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
