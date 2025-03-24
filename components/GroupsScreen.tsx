import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const GroupsScreen = () => {
  const [groups] = useState([
    { id: '1', name: 'Math Coaching Center', code: 'MATH123', verified: true, type: 'coaching' },
    { id: '2', name: 'Science College Group', code: 'SCI456', verified: true, type: 'college' },
    { id: '3', name: 'Student Study Group', code: 'STU789', verified: false, type: 'student' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Groups</Text>
      <TextInput
        placeholder="Search by name or code..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.groupItem}>
            <Text style={styles.groupName}>{item.name} ({item.type})</Text>
            {item.verified && <Text style={styles.verified}>✔</Text>}
            <Text style={styles.groupCode}>{item.code}</Text>
          </TouchableOpacity>
        )}
      />
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
    fontSize: 20,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  groupItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  groupName: {
    color: '#fff',
    fontSize: 16,
  },
  verified: {
    color: '#00f',
    fontSize: 16,
  },
  groupCode: {
    color: '#888',
    fontSize: 14,
  },
});

export default GroupsScreen;