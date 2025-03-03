import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform, Animated, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { getChatCompletion, ChatMessage } from '@/lib/openai';
import * as Clipboard from 'expo-clipboard';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

type ColorScheme = 'light' | 'dark';

const SYSTEM_PROMPT = `Ви - дружній AI асистент з моделлю GPT-4o, який допомагає користувачу вести щоденник, планувати задачі та досягати цілей. 
Ваші відповіді мають бути корисними, конкретними та підтримуючими. 
Спілкуйтесь українською мовою та допомагайте користувачу структурувати думки та планувати дії.
Ви можете:
1. Аналізувати текст та допомагати покращувати записи
2. Структурувати інформацію та виділяти головне
3. Надавати поради щодо тайм-менеджменту
4. Допомагати в постановці цілей
5. Мотивувати та підтримувати користувача
6. Пропонувати конкретні кроки для досягнення цілей
7. Допомагати аналізувати прогрес та результати

Будьте конкретними у відповідях та пропонуйте практичні рішення.`;

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'system', content: SYSTEM_PROMPT }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scheme = useColorScheme();
  const colorScheme: ColorScheme = scheme ?? 'light';
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // Додаємо повідомлення користувача до чату
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Прокручуємо до останнього повідомлення
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Оновлюємо історію чату
      const updatedHistory: ChatMessage[] = [
        ...chatHistory,
        { role: 'user', content: userMessage.text }
      ];
      setChatHistory(updatedHistory);

      // Анімація індикатора набору
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          delay: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Отримуємо відповідь від AI
      const aiResponse = await getChatCompletion(updatedHistory);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      
      // Прокручуємо до відповіді AI
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      // Показуємо повідомлення про помилку
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Вибачте, сталася помилка. Спробуйте ще раз.',
        sender: 'ai',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Успішно', 'Текст скопійовано до буферу обміну');
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося скопіювати текст');
    }
  };

  const renderMessage = (message: Message) => (
    <View key={message.id}>
      <TouchableOpacity
        onLongPress={() => handleCopyMessage(message.text)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.messageContainer,
            message.sender === 'user' ? styles.userMessage : styles.aiMessage,
            { 
              backgroundColor: message.sender === 'user' 
                ? (colorScheme === 'dark' ? '#0A84FF' : Colors.light.tint)
                : (colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA')
            }
          ]}
        >
          <ThemedText style={[
            styles.messageText,
            { 
              color: message.sender === 'user' 
                ? '#FFFFFF'
                : (colorScheme === 'dark' ? '#FFFFFF' : '#000000')
            }
          ]}>
            {message.text}
          </ThemedText>
          <ThemedText style={[
            styles.timestamp,
            { 
              color: message.sender === 'user' 
                ? 'rgba(255, 255, 255, 0.7)'
                : (colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)')
            }
          ]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ThemedView style={styles.container}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            !messages.length && styles.emptyMessagesContent
          ]}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons 
                name="chat" 
                size={64} 
                color={Colors[colorScheme ?? 'light'].tabIconDefault} 
              />
              <ThemedText style={styles.emptyText}>Почніть діалог з AI</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Задайте питання або поділіться своїми думками
              </ThemedText>
            </View>
          ) : (
            <>
              {messages.map(renderMessage)}
              {isLoading && (
                <Animated.View style={[
                  styles.typingIndicator,
                  { 
                    opacity: fadeAnim,
                    backgroundColor: colorScheme === 'dark' 
                      ? 'rgba(44, 44, 46, 0.8)'
                      : 'rgba(229, 229, 234, 0.8)'
                  }
                ]}>
                  <ThemedText style={styles.typingText}>AI друкує...</ThemedText>
                </Animated.View>
              )}
            </>
          )}
        </ScrollView>

        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint={colorScheme} style={styles.inputWrapper}>
            <View style={[
              styles.inputContainer, 
              { paddingHorizontal: 12 }
            ]}>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)'
                  }
                ]}
                placeholder="Введіть повідомлення..."
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                  { backgroundColor: colorScheme === 'dark' ? '#0A84FF' : Colors.light.tint }
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
              >
                <MaterialIcons
                  name="send"
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </BlurView>
        ) : (
          <View style={[
            styles.inputWrapper,
            { 
              backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
              borderTopColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
          ]}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white'
                  }
                ]}
                placeholder="Введіть повідомлення..."
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                  { backgroundColor: colorScheme === 'dark' ? '#0A84FF' : Colors.light.tint }
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
              >
                <MaterialIcons
                  name="send"
                  size={25}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  messageContainer: {
    maxWidth: '85%',
    minWidth: '30%',
    padding: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderRadius: 20,
    borderBottomRightRadius: 5,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputWrapper: {
    borderTopWidth: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 16,
    marginRight: 56,
    fontSize: 16,
    lineHeight: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 16,
    bottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
    paddingTop: 100,
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
    opacity: 0.7,
  },
  emptyMessagesContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    padding: 8,
    paddingHorizontal: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  typingText: {
    fontSize: 12,
    opacity: 0.7,
  },
});