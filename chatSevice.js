import axios from 'axios';
import { firestore } from '@react-native-firebase/firestore';

const cacheQuery = async (prompt, response) => {
  await firestore()
    .collection('chatCache')
    .doc(prompt.replace(/\s+/g, '_'))
    .set({
      prompt,
      response,
      timestamp: new Date(),
    });
};

const getCachedResponse = async (prompt) => {
  const doc = await firestore()
    .collection('chatCache')
    .doc(prompt.replace(/\s+/g, '_'))
    .get();
  return doc.exists ? doc.data().response : null;
};

const trackUsage = async (prompt) => {
  await firestore()
    .collection('usageLogs')
    .add({
      prompt,
      timestamp: new Date(),
    });
};

export const chatWithGPT = async (message) => {
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
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const result = response.data.choices[0].message.content;

    await trackUsage(message);
    await cacheQuery(message, result);
    return result;
  } catch (error) {
    console.error('ChatGPT error:', error);
    throw error;
  }
};

export const summarizeText = async (text) => {
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
          { role: 'system', content: 'You are a helpful assistant.' },
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
    const result = response.data.choices[0].message.content;

    await trackUsage(prompt);
    await cacheQuery(prompt, result);
    return result;
  } catch (error) {
    console.error('Summarization error:', error);
    throw error;
  }
};