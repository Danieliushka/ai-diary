import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, View, ScrollView, TouchableWithoutFeedback, Keyboard, Platform, KeyboardAvoidingView, Dimensions, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (task: { title: string; description: string; deadline: Date | null }) => void;
}

export function AddTaskModal({ visible, onClose, onSubmit }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [tempTime, setTempTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [modalHeight, setModalHeight] = useState(Dimensions.get('window').height * 0.7);
  const colorScheme = useColorScheme();
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    const updateModalHeight = () => {
      const windowHeight = Dimensions.get('window').height;
      setModalHeight(windowHeight * 0.7);
    };

    const subscription = Dimensions.addEventListener('change', updateModalHeight);
    return () => subscription.remove();
  }, []);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim(), deadline });
    setTitle('');
    setDescription('');
    setDeadline(null);
    onClose();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setTempTime(selectedTime);
    }
  };

  const confirmDate = () => {
    if (tempDate) {
      if (!tempTime && !deadline) {
        setDeadline(tempDate);
      } else {
        const currentTime = tempTime || deadline;
        const newDate = new Date(tempDate);
        if (currentTime) {
          newDate.setHours(currentTime.getHours());
          newDate.setMinutes(currentTime.getMinutes());
        }
        setDeadline(newDate);
      }
      setTempDate(null);
      setShowDatePicker(false);
    }
  };

  const confirmTime = () => {
    if (tempTime) {
      const baseDate = deadline || tempDate || new Date();
      const newDate = new Date(baseDate);
      newDate.setHours(tempTime.getHours());
      newDate.setMinutes(tempTime.getMinutes());
      setDeadline(newDate);
      setTempTime(null);
      setShowTimePicker(false);
    }
  };

  const handlePressDeadline = () => {
    Keyboard.dismiss();
    setShowDatePicker(true);
  };

  const cancelDeadlineSelection = () => {
    setTempDate(null);
    setTempTime(null);
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
    },
    keyboardAvoidingView: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    modalContainer: {
      borderRadius: 20,
      overflow: 'hidden',
    },
    modalContent: {
      borderRadius: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    closeButton: {
      padding: 5,
    },
    scrollContent: {
      paddingHorizontal: 20,
    },
    input: {
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: 12,
      padding: 12,
      marginVertical: 10,
      fontSize: 16,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    deadlineContainer: {
      marginVertical: 10,
    },
    deadlineLabel: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'light'].tabIconDefault,
      marginBottom: 5,
      marginLeft: 4,
    },
    deadlineButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' 
        ? 'rgba(255, 255, 255, 0.15)' 
        : 'rgba(60, 60, 67, 0.29)',
      borderRadius: 12,
      backgroundColor: colorScheme === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(60, 60, 67, 0.08)',
    },
    deadlineText: {
      marginLeft: 10,
      fontSize: 16,
      flex: 1,
      color: Colors[colorScheme ?? 'light'].text,
    },
    confirmButton: {
      position: 'absolute',
      right: 8,
      backgroundColor: Platform.select({
        ios: 'rgba(48, 209, 88, 0.1)',
        android: 'rgba(76, 175, 80, 0.1)',
      }),
      padding: 4,
      borderRadius: 12,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 20,
      paddingTop: 10,
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    button: {
      flex: 1,
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
    },
    submitButton: {
      backgroundColor: Colors.light.tint,
    },
    cancelButton: {
      backgroundColor: '#ff3b30',
    },
    disabledButton: {
      opacity: 0.5,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    deadlineActions: {
      flexDirection: 'row',
      gap: 5,
    },
    actionButton: {
      flex: 0,
      width: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pickerContainer: {
      backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
      borderRadius: 12,
      marginTop: 5,
      marginBottom: 15,
      overflow: 'hidden',
    },
    pickerActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    pickerActionText: {
      fontSize: 16,
      fontWeight: '500',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <Animated.View style={[
              styles.modalContainer,
              {
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [modalHeight, 0]
                  })
                }]
              }
            ]}>
              <ThemedView style={[styles.modalContent, { maxHeight: modalHeight }]}>
                <View style={styles.header}>
                  <ThemedText style={styles.title}>Нове завдання</ThemedText>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <MaterialIcons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
                  </TouchableOpacity>
                </View>

                <ScrollView bounces={false} keyboardShouldPersistTaps="handled" style={styles.scrollContent}>
                  <TextInput
                    style={[styles.input, { color: Colors[colorScheme ?? 'light'].text }]}
                    placeholder="Назва завдання"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                    value={title}
                    onChangeText={setTitle}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />

                  <TextInput
                    style={[styles.input, styles.textArea, { color: Colors[colorScheme ?? 'light'].text }]}
                    placeholder="Опис завдання"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    blurOnSubmit={true}
                  />

                  <View style={styles.deadlineContainer}>
                    <ThemedText style={styles.deadlineLabel}>Дата</ThemedText>
                    <TouchableOpacity
                      style={styles.deadlineButton}
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowDatePicker(true);
                      }}
                    >
                      <MaterialIcons 
                        name="event" 
                        size={24} 
                        color={Colors[colorScheme ?? 'light'].tint} 
                      />
                      <ThemedText style={styles.deadlineText}>
                        {tempDate 
                          ? format(tempDate, 'd MMMM yyyy', { locale: uk })
                          : deadline
                            ? format(deadline, 'd MMMM yyyy', { locale: uk })
                            : 'Оберіть дату'}
                      </ThemedText>
                      {tempDate && (
                        <TouchableOpacity
                          style={styles.confirmButton}
                          onPress={confirmDate}
                        >
                          <MaterialIcons name="check" size={20} color="#4CAF50" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>

                    {showDatePicker && Platform.OS === 'ios' && (
                      <View style={styles.pickerContainer}>
                        <DateTimePicker
                          value={tempDate || deadline || new Date()}
                          mode="date"
                          display="spinner"
                          onChange={handleDateChange}
                          minimumDate={new Date()}
                        />
                        <View style={styles.pickerActions}>
                          <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                            <ThemedText style={styles.pickerActionText}>Скасувати</ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => {
                              setShowDatePicker(false);
                              if (tempDate) {
                                confirmDate();
                              }
                            }}
                          >
                            <ThemedText style={[styles.pickerActionText, { color: Colors[colorScheme ?? 'light'].tint }]}>Готово</ThemedText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <ThemedText style={styles.deadlineLabel}>Час</ThemedText>
                    <TouchableOpacity
                      style={styles.deadlineButton}
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowTimePicker(true);
                      }}
                    >
                      <MaterialIcons 
                        name="access-time" 
                        size={24} 
                        color={Colors[colorScheme ?? 'light'].tint} 
                      />
                      <ThemedText style={styles.deadlineText}>
                        {tempTime 
                          ? format(tempTime, 'HH:mm', { locale: uk })
                          : deadline
                            ? format(deadline, 'HH:mm', { locale: uk })
                            : 'Оберіть час'}
                      </ThemedText>
                      {tempTime && (
                        <TouchableOpacity
                          style={styles.confirmButton}
                          onPress={confirmTime}
                        >
                          <MaterialIcons name="check" size={20} color="#4CAF50" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>

                    {showTimePicker && Platform.OS === 'ios' && (
                      <View style={styles.pickerContainer}>
                        <DateTimePicker
                          value={tempTime || deadline || new Date()}
                          mode="time"
                          display="spinner"
                          onChange={handleTimeChange}
                        />
                        <View style={styles.pickerActions}>
                          <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                            <ThemedText style={styles.pickerActionText}>Скасувати</ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => {
                              if (tempTime) {
                                confirmTime();
                              }
                              setShowTimePicker(false);
                            }}
                          >
                            <ThemedText style={[styles.pickerActionText, { color: Colors[colorScheme ?? 'light'].tint }]}>Готово</ThemedText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>

                  {Platform.OS === 'android' && (
                    <>
                      {showDatePicker && (
                        <DateTimePicker
                          value={tempDate || deadline || new Date()}
                          mode="date"
                          display="default"
                          onChange={handleDateChange}
                          minimumDate={new Date()}
                        />
                      )}
                      {showTimePicker && (
                        <DateTimePicker
                          value={tempTime || deadline || new Date()}
                          mode="time"
                          display="default"
                          onChange={handleTimeChange}
                        />
                      )}
                    </>
                  )}
                </ScrollView>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onClose}
                  >
                    <ThemedText style={styles.buttonText}>Скасувати</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.submitButton, !title.trim() && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={!title.trim()}
                  >
                    <ThemedText style={styles.buttonText}>Додати</ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedView>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}