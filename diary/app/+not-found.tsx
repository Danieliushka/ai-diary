import { Link, Stack, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function NotFoundScreen() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Якщо користувач авторизований, перенаправляємо на AI чат
      router.replace('/(tabs)/ai-chat');
    }
  }, [user]);

  return (
    <>
      <Stack.Screen options={{ title: 'Сторінку не знайдено' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Цієї сторінки не існує</ThemedText>
        <Link href={user ? "/(tabs)/ai-chat" : "/auth"} style={styles.link}>
          <ThemedText type="link">
            {user ? 'Перейти до AI чату' : 'Перейти до авторизації'}
          </ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
