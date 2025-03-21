// Chatbot.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [weakTopics, setWeakTopics] = useState<string[]>(['Algebra', 'World History']); // Mock weak topics for now

  // Simulate identifying weak topics on component mount
  useEffect(() => {
    // In a real app, fetch weak topics from Firestore based on quiz results
    const initialMessage = {
      role: 'assistant',
      content: `I noticed you're weak in ${weakTopics.join(
        ' and '
      )}. Do you have any doubts we can solve, or would you like me to explain one of these topics? I can also suggest a video class if you'd prefer.`,
    };
    setMessages([initialMessage]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Mock response since OpenAI API key is not available yet
      let botResponse: string;

      // Check if the user is asking for teaching or has doubts
      const inputLower = input.toLowerCase();
      if (inputLower.includes('teach me') || inputLower.includes('explain')) {
        const topic = extractTopic(inputLower);
        botResponse = `Let's learn about ${topic}! Here's a simple explanation: [Mock explanation for ${topic}]. Would you like to ask a question about this topic, or should I suggest a video class?`;
      } else if (
        inputLower.includes('why') ||
        inputLower.includes('what') ||
        inputLower.includes('how') ||
        inputLower.includes('doubt')
      ) {
        botResponse = `Let me help with your doubt: "${input}". Here's the explanation: [Mock explanation answering why/what/how for "${input}"]. Does that clear your doubt? If not, feel free to ask more!`;
      } else if (inputLower.includes('video')) {
        botResponse = `Here's a suggestion for a video class on this topic: [Mock video link]. Would you like to learn more about this topic or ask a question?`;
      } else {
        botResponse = `I understand you're asking about "${input}". Can you specify if you'd like me to explain this topic, solve a doubt, or suggest a video class?`;
      }

      const botMessage = { role: 'assistant', content: botResponse };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error with AI response:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error: Could not get response' },
      ]);
    }

    setInput('');
  };

  // Helper function to extract the topic from the user's input
  const extractTopic = (input: string): string => {
    // Simple logic to extract the topic (can be improved with NLP later)
    const teachIndex = input.indexOf('teach me');
    const explainIndex = input.indexOf('explain');
    const startIndex = teachIndex !== -1 ? teachIndex + 8 : explainIndex + 7;
    return input.slice(startIndex).trim() || 'this topic';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chatbot</Text>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={item.role === 'user' ? styles.userMessage : styles.botMessage}>
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question or say 'teach me [topic]'..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E90FF',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  messageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#00f',
    padding: 10,
    borderRadius: 5,
  },
  sendButtonText: {
    color: '#fff',
  },
});

export default Chatbot;