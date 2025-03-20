import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('OPENAI_API_KEY:', OPENAI_API_KEY ? 'Key loaded' : 'Key missing');

export const summarizeText = async (text) => {
  console.log('Summarizing text:', text);
  if (!text) return 'No text provided to summarize.';

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes text.' },
          { role: 'user', content: Summarize the following text:  },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': Bearer ,
          'Content-Type': 'application/json',
        },
      }
    );

    const summary = response.data.choices[0].message.content.trim();
    console.log('Summary received:', summary);
    return summary;
  } catch (error) {
    console.error('Error summarizing text:', error.response ? error.response.data : error.message);
    return 'Failed to summarize text. Please try again.';
  }
};
