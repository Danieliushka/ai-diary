import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface TaskCardProps {
  title: string;
  description: string;
  status: 'active' | 'completed';
  deadline: string;
  onPress?: () => void;
  onStatusChange?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  status,
  deadline,
  onPress,
  onStatusChange,
}) => {
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedView style={[
        styles.container,
        status === 'completed' && styles.completedContainer
      ]}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <TouchableOpacity 
              style={[
                styles.statusIndicator,
                status === 'completed' ? styles.statusCompleted : styles.statusActive
              ]}
              onPress={onStatusChange}
            >
              <MaterialIcons 
                name={status === 'completed' ? "check-circle" : "radio-button-unchecked"} 
                size={24} 
                color={status === 'completed' ? "#4CAF50" : Colors[colorScheme ?? 'light'].text} 
              />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.deadline}>{deadline}</ThemedText>
        </View>
        
        <ThemedText style={styles.description} numberOfLines={2}>
          {description}
        </ThemedText>

        <View style={styles.footer}>
          <MaterialIcons 
            name="edit" 
            size={20} 
            color={Colors[colorScheme ?? 'light'].text} 
            style={styles.editIcon}
          />
          <ThemedText style={styles.editText}>Натисніть для редагування</ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  completedContainer: {
    opacity: 0.8,
  },
  header: {
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusIndicator: {
    padding: 4,
  },
  statusActive: {
    opacity: 0.7,
  },
  statusCompleted: {
    opacity: 1,
  },
  deadline: {
    fontSize: 14,
    opacity: 0.7,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.5,
  },
  editIcon: {
    marginRight: 4,
  },
  editText: {
    fontSize: 12,
  },
});