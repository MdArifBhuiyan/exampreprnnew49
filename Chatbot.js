import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { extractMCQsFromImage, extractMCQsFromPDF } from './MCQExtractor';
import { saveMCQs } from './Database'; // Import the saveMCQs function

const Chatbot = () => {
  const [messages, setMessages] = useState([]);

  // Handle image upload
  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.cancelled) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Processing your image...' },
        ]);

        const mcqs = await extractMCQsFromImage(result.uri);
        saveMCQs(mcqs); // Save MCQs to the database
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Here are the extracted MCQs:\n${JSON.stringify(mcqs, null, 2)}` },
        ]);
      }
    } catch (error) {
      console.error('Error during image upload:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I couldn’t process the image. Please try again.' },
      ]);
    }
  };

  // Handle PDF upload
  const handlePDFUpload = async () => {
    try {
      const file = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
      });

      if (file.type === 'success') {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Processing your PDF...' },
        ]);

        const mcqs = await extractMCQsFromPDF(file.uri);
        saveMCQs(mcqs); // Save MCQs to the database
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Here are the extracted MCQs:\n${JSON.stringify(mcqs, null, 2)}` },
        ]);
      }
    } catch (error) {
      console.error('Error during PDF upload:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I couldn’t process the PDF. Please try again.' },
      ]);
    }
  };

  // Handle user input
  const handleUserInput = (text) => {
    setMessages((prev) => [...prev, { role: 'user', content: text }]);

    if (text.toLowerCase().includes('upload image')) {
      handleImageUpload();
    } else if (text.toLowerCase().includes('upload pdf')) {
      handlePDFUpload();
    } else {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Please tell me what you want to do. For example, say "Upload image" or "Upload PDF".' },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ScrollView>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.role === 'user' ? '#DCF8C6' : '#ECECEC',
              padding: 10,
              borderRadius: 10,
              marginVertical: 5,
              maxWidth: '80%',
            }}
          >
            <Text>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>
      {/* Add a text input here for user interaction */}
    </View>
  );
};

export default Chatbot;