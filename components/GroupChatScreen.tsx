// C:\Projects\ExamPrepRNNew\components\GroupChatScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

const GroupChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const groupID = 'mock-group-id'; // Mock group ID for now

  useEffect(() => {
    // Fetch messages from Firestore
    const messagesRef = firestore().collection('groups').doc(groupID).collection('messages');
    const q = messagesRef.orderBy('timestamp', 'asc');
    const unsubscribe = q.onSnapshot((snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [groupID]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const user = auth().currentUser;
    if (!user) return;

    try {
      await firestore()
        .collection('groups')
        .doc(groupID)
        .collection('messages')
        .add({
          sender: user.email || 'Anonymous',
          text: newMessage,
          timestamp: new Date().toISOString(),
        });
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Group Chat</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={item.sender === auth().currentUser?.email ? styles.userMessage : styles.message}>
            <Text style={styles.senderText}>{item.sender}</Text>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
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
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
  },
  message: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#00ff00',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  senderText: {
    fontSize: 12,
    color: '#fff',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    color: '#ccc',
  }, 
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  sendButtonText: {
    color: '#fff',
  },
});

export default GroupChatScreen;