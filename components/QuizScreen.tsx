// components/QuizScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const QuizScreen: React.FC = () => {
  const [score, setScore] = useState(0);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz</Text>
      <Text style={styles.question}>What is the capital of France?</Text>
      <TouchableOpacity onPress={() => handleAnswer(true)} style={styles.option}>
        <Text style={styles.optionText}>Paris</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleAnswer(false)} style={styles.option}>
        <Text style={styles.optionText}>London</Text>
      </TouchableOpacity>
      <Text style={styles.score}>Score: {score}</Text>
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
    fontSize: 24,
    marginBottom: 20,
  },
  question: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  option: {
    backgroundColor: '#333',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  score: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
});

export default QuizScreen;