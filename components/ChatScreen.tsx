import React from 'react';
import { View, StyleSheet } from 'react-native';
import Chatbot from '../Chatbot';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../types';

type ChatScreenProps = BottomTabScreenProps<RootTabParamList, 'Chat'>;

const ChatScreen: React.FC<ChatScreenProps> = () => {
  return (
    <View style={styles.container}>
      <Chatbot />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
});

export default ChatScreen;