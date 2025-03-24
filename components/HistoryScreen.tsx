import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const HistoryScreen = () => {
  const [history] = useState([
    { id: '1', action: 'Quiz Attempt', timestamp: '2023-10-01 10:00 AM' },
    { id: '2', action: 'MCQ Upload', timestamp: '2023-10-02 02:00 PM' },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Text style={styles.action}>{item.action}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
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
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  action: {
    color: '#fff',
    fontSize: 16,
  },
  timestamp: {
    color: '#888',
    fontSize: 14,
  },
});

export default HistoryScreen;