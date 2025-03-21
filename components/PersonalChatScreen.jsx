import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

const PersonalChatScreen = () => {
  const data = [
    { id: '1', sender: 'user1', message: 'Hey, how are you?' },
    { id: '2', sender: 'user2', message: 'I’m good, thanks!' },
  ];

  const renderItem = ({ item }) => (
    <View
      style={{
        alignSelf: item.sender === 'user1' ? 'flex-end' : 'flex-start',
        backgroundColor: item.sender === 'user1' ? '#121212' : '#333',
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 16 }}>{item.message}</Text>
    </View>
  );

  const sendMessage = () => {
    // Implement send message logic later
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>Personal Chat</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <View
        style={{
          alignSelf: 'center',
          backgroundColor: '#333',
          padding: 10,
          marginVertical: 10,
          borderRadius: 10,
        }}
      >
        <Text style={{ fontSize: 24, color: '#080' }}></Text>
        <TouchableOpacity onPress={sendMessage}>
          <Text style={{ fontSize: 24, color: '#080' }}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PersonalChatScreen;