// StudentDashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { getUserData, getQuizQuestions, updateQuizAnalytics } from './DatabaseService';
import { createCheckoutSession, updateUserToPremium } from './services/PaymentService';
import { LineChart } from 'react-native-chart-kit';

const StudentDashboard = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [analytics, setAnalytics] = useState({ timePerQuestion: [], accuracyByTopic: {} });

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData(userId);
      setUser(userData);
      setAnalytics(userData.quizAnalytics);
      const quizQuestions = await getQuizQuestions(userId, 'Mechanics', userData.isPremium);
      setQuestions(quizQuestions);
    };
    fetchUserData();
  }, [userId]);

  const takeQuiz = async () => {
    // Simulate taking a quiz
    const timePerQuestion = questions.map((q, index) => ({
      questionId: q.id,
      time: Math.floor(Math.random() * 60) + 30, // Random time between 30-90 seconds
    }));
    const accuracyByTopic = { Mechanics: Math.floor(Math.random() * 100) };
    await updateQuizAnalytics(userId, 'quiz1', timePerQuestion, accuracyByTopic);
    Alert.alert('Quiz Completed', 'Your quiz has been submitted!');
    const updatedUser = await getUserData(userId);
    setUser(updatedUser);
    setAnalytics(updatedUser.quizAnalytics);
  };

  const upgradeToPremium = async () => {
    const result = await createCheckoutSession(userId, 'premium');
    if (result.success) {
      const badge = await updateUserToPremium(userId);
      Alert.alert('Welcome to Premium!', `You’ve earned the ${badge} badge!`);
      const updatedUser = await getUserData(userId);
      setUser(updatedUser);
    }
  };

  if (!user) return <Text>Loading...</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        Welcome, {user.email}!
      </Text>
      <Text>Badge: {user.badge || 'None'}</Text>
      <Text>Quizzes Completed: {user.progress.quizzesCompleted}</Text>

      {/* Progress Tracking */}
      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Progress</Text>
      <Text>{user.progress.quizzesCompleted}/20 Quizzes Completed</Text>

      {/* Quiz Analytics */}
      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Quiz Analytics</Text>
      <Text>Accuracy by Topic:</Text>
      {Object.entries(analytics.accuracyByTopic).map(([topic, accuracy]) => (
        <Text key={topic}>{topic}: {accuracy}%</Text>
      ))}
      {user.isPremium && (
        <>
          <Text>Time Spent Per Question:</Text>
          <FlatList
            data={analytics.timePerQuestion}
            keyExtractor={(item) => item.questionId}
            renderItem={({ item }) => (
              <Text>{`Question ${item.questionId}: ${item.time} seconds`}</Text>
            )}
          />
        </>
      )}

      {/* Upgrade Prompt for Free Users */}
      {!user.isPremium && (
        <Text style={{ marginTop: 10, color: 'blue' }} onPress={upgradeToPremium}>
          Upgrade to Premium for Full Analytics, Adaptive Quizzes, and More!
        </Text>
      )}

      {/* Take a Quiz */}
      <Text style={{ marginTop: 10, color: 'green' }} onPress={takeQuiz}>
        Take a Mechanics Quiz
      </Text>
    </View>
  );
};

export default StudentDashboard;