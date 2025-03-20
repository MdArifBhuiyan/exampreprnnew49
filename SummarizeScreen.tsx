import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { SummarizeScreenProps } from './types';

const SummarizeScreen: React.FC<SummarizeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ExamPrep</Text>
      <Text style={styles.subtitle}>Prepare for your exams with ease!</Text>
      <Button title="Go to Chat" onPress={() => navigation.navigate('Chat')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
});

export default SummarizeScreen;
