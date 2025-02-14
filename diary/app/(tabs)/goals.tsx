import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Goal } from '@/types';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Мої цілі</ThemedText>
      <ThemedText>Тут будуть ваші цілі</ThemedText>
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