import OpenAI from 'openai';

if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
  console.warn('Missing OpenAI API key');
}

export const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Потрібно для роботи в React Native
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function getChatCompletion(messages: ChatMessage[]): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-4o', // Використовуємо стабільну версію GPT-4o
      temperature: 0.7,
      max_tokens: 4500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return completion.choices[0]?.message?.content || 'Вибачте, не вдалося отримати відповідь';
  } catch (error) {
    console.error('Error getting chat completion:', error);
    throw error;
  }
}