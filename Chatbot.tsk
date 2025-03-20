import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import OpenAI from 'openai';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  // Initialize OpenAI with your API key
  const openai = new OpenAI({
    apiKey: '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', // Replace with your OpenAI API key
  });

  // Function to handle sending a message to the chatbot
  const handleSend = async () => {
    try {
      // Send the user's input to OpenAI
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: input }],
        model: 'gpt-3.5-turbo',
      });

      // Set the response from OpenAI
      setResponse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Input field for the user's message */}
      <TextInput
        style={styles.input}
        placeholder="Type your message..."
        value={input}
        onChangeText={setInput}
      />

      {/* Button to send the message */}
      <Button title="Send" onPress={handleSend} />

      {/* Display the chatbot's response */}
      <Text style={styles.response}>{response}</Text>
    </View>
  );
};

// Styles for the Chatbot component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  response: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
});

export default Chatbot;