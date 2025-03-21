import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';

const ChatScreen = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), text: inputText, sender: 'user' }]);
    setInputText('');
    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: 'This is a bot response.', sender: 'bot' }]);
    }, 1000);
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>Chat</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: item.sender === 'user' ? '#1E90FF' : '#333',
              padding: 10,
              marginVertical: 5,
              borderRadius: 5,
            }}
          >
            <Text style={{ color: '#fff' }}>{item.text}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <TextInput
          style={{ flex: 1, backgroundColor: '#333', color: '#fff', padding: 10, borderRadius: 5, marginRight: 10 }}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={sendMessage}>
          <Text style={{ fontSize: 24, color: '#00f' }}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;