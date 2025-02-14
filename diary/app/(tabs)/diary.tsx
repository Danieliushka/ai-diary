import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/hooks/useAuth';

export default function DiaryScreen() {
  const { user } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Мій щоденник</ThemedText>
      <ThemedText>Тут будуть ваші записи</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});