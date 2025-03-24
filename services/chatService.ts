// C:\Projects\ExamPrepRNNew\services\chatService.ts
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';

// Cache a query and its response in Firestore
const cacheQuery = async (prompt: string, response: string) => {
  try {
    await firestore()
      .collection('chatCache')
      .doc(prompt.replace(/\s+/g, '_'))
      .set({
        prompt,
        response,
        timestamp: new Date(),
      });
    console.log('Cached response for prompt:', prompt);
  } catch (error) {
    console.error('Error caching query:', error);
  }
};

// Retrieve a cached response from Firestore
const getCachedResponse = async (prompt: string): Promise<string | null> => {
  try {
    const doc = await firestore()
      .collection('chatCache')
      .doc(prompt.replace(/\s+/g, '_'))
      .get();
    return doc.exists ? (doc.data() as any).response : null;
  } catch (error) {
    console.error('Error retrieving cached response:', error);
    return null;
  }
};

// Track usage in Firestore
const trackUsage = async (prompt: string) => {
  try {
    await firestore()
      .collection('usageLogs')
      .add({
        prompt,
        timestamp: new Date(),
      });
    console.log('Usage tracked for prompt:', prompt);
  } catch (error) {
    console.error('Error tracking usage:', error);
  }
};

// Chat with GPT using OpenAI API
export const chatWithGPT = async (message: string): Promise<string> => {
  if (!message) return 'No message provided to chat with GPT.';

  const cachedResponse = await getCachedResponse(message);
  if (cachedResponse) {
    console.log('Using cached response for:', message);
    return cachedResponse;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const result = response.data.choices[0].message.content.trim();

    await trackUsage(message);
    await cacheQuery(message, result);
    return result;
  } catch (error) {
    console.error('ChatGPT error:', (error as any).response ? (error as any).response.data : (error as any).message);
    return 'Failed to chat with GPT. Please try again.';
  }
};

// Summarize text using OpenAI API
export const summarizeText = async (text: string): Promise<string> => {
  if (!text) return 'No text provided to summarize.';

  const prompt = `Summarize the following text: ${text}`;
  const cachedResponse = await getCachedResponse(prompt);
  if (cachedResponse) {
    console.log('Using cached response for summarization:', prompt);
    return cachedResponse;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes text.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 100,
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const summary = response.data.choices[0].message.content.trim();

    await trackUsage(prompt);
    await cacheQuery(prompt, summary);
    console.log('Summary received:', summary);
    return summary;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Summarization error:', (error as any)?.response?.data || error.message);
    } else {
      console.error('Summarization error:', error);
    }
    return 'Failed to summarize text. Please try again.';
  }
};