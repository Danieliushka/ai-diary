import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, View, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { AddTaskModal } from '@/components/AddTaskModal';
import { EditTaskModal } from '@/components/EditTaskModal';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed';
  deadline?: string;
  user_id: string;
  created_at: string;
}

export default function TasksScreen() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }

    setTasks(data || []);
  };

  const addTask = async (taskData: { title: string; description: string; deadline: Date | null }) => {
    if (!user) return;

    const newTaskData = {
      title: taskData.title,
      description: taskData.description,
      status: 'active',
      user_id: user.id,
      deadline: taskData.deadline?.toISOString(),
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTaskData])
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      return;
    }

    setTasks([data, ...tasks]);
  };

  const editTask = async (taskData: { id: string; title: string; description: string; deadline: Date | null }) => {
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .update({
        title: taskData.title,
        description: taskData.description,
        deadline: taskData.deadline?.toISOString(),
      })
      .eq('id', taskData.id);

    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    setTasks(tasks.map(task =>
      task.id === taskData.id
        ? {
            ...task,
            title: taskData.title,
            description: taskData.description,
            deadline: taskData.deadline?.toISOString(),
          }
        : task
    ));
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'active' ? 'completed' : 'active';

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    setTasks(tasks.map(task =>
      task.id === id ? { ...task, status: newStatus } : task
    ));
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return;
    }

    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalVisible(true);
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity onPress={() => handleTaskPress(item)}>
      <ThemedView style={[
        styles.taskItem,
        item.status === 'completed' && styles.completedTask,
        { 
          backgroundColor: colorScheme === 'dark' 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(255, 255, 255, 0.7)' 
        },
        Platform.select({
          ios: {
            shadowColor: colorScheme === 'dark' ? "#fff" : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: colorScheme === 'dark' ? 0.1 : 0.1,
            shadowRadius: 4,
          },
          android: {
            elevation: 4,
          }
        })
      ]}>
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation(); // Запобігає відкриттю модального вікна редагування
            toggleTask(item.id);
          }}
          style={styles.checkbox}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons 
            name={item.status === 'completed' ? "check-circle" : "radio-button-unchecked"} 
            size={24} 
            color={item.status === 'completed' ? "#4CAF50" : Colors[colorScheme ?? 'light'].text} 
          />
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <ThemedText style={[
            styles.taskTitle,
            item.status === 'completed' && styles.completedText
          ]}>
            {item.title}
          </ThemedText>
          {item.description && (
            <ThemedText style={styles.taskDescription}>{item.description}</ThemedText>
          )}
          {item.deadline && (
            <View style={styles.deadlineContainer}>
              <MaterialIcons 
                name="event" 
                size={16} 
                color={Colors[colorScheme ?? 'light'].tabIconDefault} 
              />
              <ThemedText style={styles.deadline}>
                {format(new Date(item.deadline), 'PPp', { locale: uk })}
              </ThemedText>
            </View>
          )}
        </View>

        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation(); // Запобігає відкриттю модального вікна редагування
            deleteTask(item.id);
          }}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="delete-outline" size={24} color="#ff3b30" />
        </TouchableOpacity>
      </ThemedView>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons 
        name="assignment" 
        size={64} 
        color={Colors[colorScheme ?? 'light'].tabIconDefault} 
      />
      <ThemedText style={styles.emptyText}>Немає завдань</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Натисніть кнопку "+" щоб додати нове завдання
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: Colors[colorScheme ?? 'light'].background }
    ]} edges={['bottom']}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Мої завдання</ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons 
            name="add" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].text} 
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.taskList,
          tasks.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={ListEmptyComponent}
      />

      <AddTaskModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSubmit={addTask}
      />

      {selectedTask && (
        <EditTaskModal
          visible={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
            setSelectedTask(null);
          }}
          onSubmit={editTask}
          task={selectedTask}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
  },
  taskList: {
    padding: 20,
    paddingTop: 0,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  completedTask: {
    opacity: 0.6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  checkbox: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  taskDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadline: {
    fontSize: 12,
    opacity: 0.5,
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});