// C:\Projects\ExamPrepRNNew\components\StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getUserData, getQuizQuestions, updateQuizAnalytics, incrementDailyQuestionCount, fetchMCQs, initDatabase, saveMCQs, UserData, QuizQuestion, MCQ } from '../services/DatabaseServices'; // Fixed import path
import { createCheckoutSession, updateUserToPremium } from '../services/PaymentService';
import { extractTextFromImage, extractTextFromPDF, parseQuestionsFromText } from '../services/OCRService';

interface StudentDashboardProps {
  userId: string;
}

interface AnalyticsEntry {
  questionId: string;
  time: number;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ userId }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEntry[]>([]); // Explicitly typed
  const [accuracyByTopic, setAccuracyByTopic] = useState<Record<string, number>>({});

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        const user = await getUserData(userId);
        setUserData(user);

        if (user) {
          const questions = await getQuizQuestions(userId, 'math', user.isPremium);
          setQuizQuestions(questions);

          const fetchedMcqs = await fetchMCQs(10); // Added limit parameter as per DatabaseServices.ts
          setMcqs(fetchedMcqs);

          // Initialize analytics with sample data
          setAnalytics([
            { questionId: '1', time: 10 },
            { questionId: '2', time: 15 },
          ]);

          setAccuracyByTopic({
            math: user.quizAnalytics?.accuracyByTopic?.math || 0,
            science: user.quizAnalytics?.accuracyByTopic?.science || 0,
          });
        }
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      }
    };

    initialize();
  }, [userId]);

  const handleAnswerQuestion = async (questionId: string, timeTaken: number, isCorrect: boolean) => {
    try {
      await incrementDailyQuestionCount(userId);
      await updateQuizAnalytics(userId, questionId, [{ questionId, time: timeTaken }], { math: isCorrect ? 100 : 0 });
      setAnalytics((prev) => [...prev, { questionId, time: timeTaken }]);
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  };

  const handleUpgradeToPremium = async () => {
    try {
      const session = await createCheckoutSession(userId, 'premium', 'bKash');
      if (session.success) {
        await updateUserToPremium(userId);
        Alert.alert('Success', 'You are now a premium user!');
        const updatedUser = await getUserData(userId);
        setUserData(updatedUser);
      }
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      Alert.alert('Error', 'Failed to upgrade to premium. Please try again.');
    }
  };

  const handleExtractText = async (type: 'image' | 'pdf') => {
    try {
      let text = '';
      if (type === 'image') {
        text = await extractTextFromImage('mock-image-path.jpg');
      } else {
        text = await extractTextFromPDF('mock-pdf-path.pdf');
      }
      const questions: MCQ[] = parseQuestionsFromText(text);
      await saveMCQs(questions);
      setMcqs((prev) => [...prev, ...questions]);
      Alert.alert('Success', `Extracted ${questions.length} questions!`);
    } catch (error) {
      console.error('Error extracting text:', error);
      Alert.alert('Error', 'Failed to extract text. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Dashboard</Text>
      {userData ? (
        <>
          <Text style={styles.text}>Welcome, {userData.email}</Text>
          <Text style={styles.text}>Role: {userData.role}</Text>
          <Text style={styles.text}>Premium: {userData.isPremium ? 'Yes' : 'No'}</Text>
          {!userData.isPremium && (
            <TouchableOpacity style={styles.button} onPress={handleUpgradeToPremium}>
              <Text style={styles.buttonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.button} onPress={() => handleExtractText('image')}>
            <Text style={styles.buttonText}>Extract from Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleExtractText('pdf')}>
            <Text style={styles.buttonText}>Extract from PDF</Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>Accuracy by Topic</Text>
          {Object.entries(accuracyByTopic).map(([topic, accuracy]) => (
            <Text key={topic} style={{ color: '#fff' }}>{`${topic}: ${Number(accuracy)}%`}</Text>
          ))}
          <Text style={styles.subtitle}>Analytics</Text>
          <FlatList
            data={analytics}
            keyExtractor={(item: AnalyticsEntry) => item.questionId}
            renderItem={({ item }: { item: AnalyticsEntry }) => (
              <Text style={{ color: '#fff' }}>{`Question ${item.questionId}: ${item.time} seconds`}</Text>
            )}
          />
          <Text style={styles.subtitle}>Your Quiz Questions</Text>
          <FlatList
            data={quizQuestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.questionContainer}>
                <Text style={styles.text}>{item.question}</Text>
                {item.options.map((option: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleAnswerQuestion(item.id, 10, option === item.answer)}
                  >
                    <Text style={styles.option}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          <Text style={styles.subtitle}>Extracted MCQs</Text>
          <FlatList
            data={mcqs}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.questionContainer}>
                <Text style={styles.text}>{item.question}</Text>
                {item.options.map((option: string, index: number) => (
                  <Text key={index} style={styles.option}>{option}</Text>
                ))}
                <Text style={styles.answer}>Answer: {item.answer}</Text>
              </View>
            )}
          />
        </>
      ) : (
        <Text style={styles.text}>Loading...</Text>
      )}
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
    color: '#fff',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  questionContainer: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  option: {
    color: '#aaa',
    marginLeft: 10,
    marginBottom: 5,
  },
  answer: {
    color: '#0f0',
    marginTop: 5,
  },
});

export default StudentDashboard;