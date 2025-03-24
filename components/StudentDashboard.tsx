// C:\Projects\ExamPrepRNNew\components\StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {
  getUserData,
  getQuizQuestions,
  updateQuizAnalytics,
  incrementDailyQuestionCount,
  fetchMCQs,
  initDatabase,
  saveMCQs,
} from '../services/DatabaseService';
import { createCheckoutSession, updateUserToPremium } from '../services/PaymentService';
import { extractTextFromImage, extractTextFromPDF, parseQuestionsFromText } from '../services/OCRService';

interface StudentDashboardProps {
  userId: string;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ userId }) => {
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({ timePerQuestion: [], accuracyByTopic: {} });

  useEffect(() => {
    const initialize = async () => {
      // Initialize SQLite database
      await initDatabase();

      // Fetch user data
      const userData = await getUserData(userId);
      setUser(userData);
      setAnalytics(userData.quizAnalytics);

      try {
        // Fetch questions from Firestore
        const quizQuestions = await getQuizQuestions(userId, 'Mechanics', userData.isPremium);
        setQuestions(quizQuestions);

        // If no questions in Firestore, fetch from SQLite
        if (quizQuestions.length === 0) {
          const localMCQs = await fetchMCQs(100);
          setQuestions(localMCQs);
        }
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    };
    initialize();
  }, [userId]);

  const takeQuiz = async () => {
    try {
      await incrementDailyQuestionCount(userId);
      const timePerQuestion = [{ questionId: questions[0]?.id, time: Math.floor(Math.random() * 60) + 30 }];
      const accuracyByTopic = { Mechanics: Math.floor(Math.random() * 100) };
      await updateQuizAnalytics(userId, 'quiz1', timePerQuestion, accuracyByTopic);
      Alert.alert('Question Answered', 'Your answer has been submitted!');
      const updatedUser = await getUserData(userId);
      setUser(updatedUser);
      setAnalytics(updatedUser.quizAnalytics);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const upgradeToPremium = async (paymentMethod: 'bkash' | 'rocket' | 'nagad') => {
    const result = await createCheckoutSession(userId, 'premium', paymentMethod);
    if (result.success) {
      const badge = await updateUserToPremium(userId);
      Alert.alert('Welcome to Premium!', `You’ve earned the ${badge} badge!`);
      const updatedUser = await getUserData(userId);
      setUser(updatedUser);
    }
  };

  const uploadResource = async (type: 'pdf' | 'image') => {
    try {
      let result;
      if (type === 'pdf') {
        result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
      }

      if (result.canceled) return;

      const uri = type === 'pdf' ? result.assets[0].uri : result.assets[0].uri;
      let text = '';
      if (type === 'pdf') {
        text = await extractTextFromPDF(uri);
      } else {
        text = await extractTextFromImage(uri);
      }

      const extractedQuestions = parseQuestionsFromText(text);
      const mcqs = extractedQuestions.map((q, index) => ({
        question: q,
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'], // Placeholder options
        answer: 'Option 1', // Placeholder answer
      }));
      await saveMCQs(mcqs);
      Alert.alert('Questions Extracted', `Saved ${mcqs.length} questions to the database.`);
      setQuestions(mcqs);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to upload resource: ' + error.message);
    }
  };

  if (!user) return <Text style={{ color: '#fff' }}>Loading...</Text>;

  return (
    <View style={{ padding: 20, backgroundColor: '#121212' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
        Welcome, {user.email}!
      </Text>
      <Text style={{ color: '#fff' }}>Badge: {user.badge || 'None'}</Text>
      <Text style={{ color: '#fff' }}>
        Questions Answered Today: {user.progress.dailyQuestionCount}/100
      </Text>

      {/* Progress Tracking */}
      <Text style={{ marginTop: 10, fontWeight: 'bold', color: '#fff' }}>Progress</Text>
      <Text style={{ color: '#fff' }}>{user.progress.quizzesCompleted} Quizzes Completed</Text>

      {/* Quiz Analytics */}
      <Text style={{ marginTop: 10, fontWeight: 'bold', color: '#fff' }}>Quiz Analytics</Text>
      <Text style={{ color: '#fff' }}>Accuracy by Topic:</Text>
      {Object.entries(analytics.accuracyByTopic).map(([topic, accuracy]) => (
        <Text key={topic} style={{ color: '#fff' }}>{topic}: {accuracy}%</Text>
      ))}
      {user.isPremium && (
        <>
          <Text style={{ color: '#fff' }}>Time Spent Per Question:</Text>
          <FlatList
            data={analytics.timePerQuestion}
            keyExtractor={(item) => item.questionId}
            renderItem={({ item }) => (
              <Text style={{ color: '#fff' }}>{`Question ${item.questionId}: ${item.time} seconds`}</Text>
            )}
          />
        </>
      )}

      {/* Upload Resources */}
      <Text style={{ marginTop: 10, fontWeight: 'bold', color: '#fff' }}>Upload Resources</Text>
      <TouchableOpacity onPress={() => uploadResource('pdf')}>
        <Text style={{ color: '#00ff00', marginTop: 5 }}>Upload PDF</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => uploadResource('image')}>
        <Text style={{ color: '#00ff00', marginTop: 5 }}>Upload Image</Text>
      </TouchableOpacity>

      {/* Upgrade Prompt for Free Users */}
      {!user.isPremium && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: '#fff' }}>
            Upgrade to Premium for Unlimited Questions, Full Analytics, and More!
          </Text>
          <TouchableOpacity onPress={() => upgradeToPremium('bkash')}>
            <Text style={{ color: '#00ff00', marginTop: 5 }}>Pay with bKash</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => upgradeToPremium('rocket')}>
            <Text style={{ color: '#00ff00', marginTop: 5 }}>Pay with Rocket</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => upgradeToPremium('nagad')}>
            <Text style={{ color: '#00ff00', marginTop: 5 }}>Pay with Nagad</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Take a Quiz */}
      {questions.length > 0 && (
        <TouchableOpacity onPress={takeQuiz}>
          <Text style={{ marginTop: 10, color: '#00ff00' }}>Answer a Mechanics Question</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default StudentDashboard;