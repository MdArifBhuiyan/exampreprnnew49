import React from 'react';
import { View, StyleSheet } from 'react-native';
import Chatbot from './Chatbot'; // Import the Chatbot component

const ChatScreen = () => {
  return (
    <View style={styles.container}>
      <Chatbot /> {/* Replace the placeholder content with the Chatbot component */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212', // Match the dark theme of your app
  },
});

export default ChatScreen;