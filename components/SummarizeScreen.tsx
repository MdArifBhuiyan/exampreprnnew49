import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { SummarizeScreenProps } from '../types'; // Fix path
import { summarizeText } from '../services/chatService'; // Fix path

const SummarizeScreen: React.FC<SummarizeScreenProps> = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!inputText) {
      setError('Please enter some text to summarize.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const result = await summarizeText(inputText);
      setSummary(result);
    } catch (err) {
      setError('Failed to summarize text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Summarize Text</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter text to summarize"
        placeholderTextColor="#888"
        value={inputText}
        onChangeText={setInputText}
        multiline
      />
      <Button title="Summarize" onPress={handleSummarize} disabled={loading} />
      {loading && <Text style={styles.loadingText}>Summarizing...</Text>}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {summary ? (
        <View style={styles.summaryContainer}>
          <Text style={styles.subtitle}>Summary:</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
      ) : null}
      <Button title="Go to Chat" onPress={() => navigation.navigate('Chat')} />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    height: 100,
    textAlignVertical: 'top',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#fff',
  },
  summaryContainer: {
    marginTop: 20,
  },
  summaryText: {
    fontSize: 14,
    color: '#fff',
  },
  loadingText: {
    color: '#00f',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default SummarizeScreen;