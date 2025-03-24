// TeacherDashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { getUserData } from './DatabaseService';

const TeacherDashboard = ({ userId }) => {
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const teacherData = await getUserData(userId);
      setTeacher(teacherData);

      // Fetch students linked to this teacher (simplified)
      const studentsSnapshot = await firestore()
        .collection('users')
        .where('role', '==', 'student')
        .get();
      const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentsData);
    };
    fetchData();
  }, [userId]);

  if (!teacher) return <Text>Loading...</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        Teacher Dashboard
      </Text>

      {/* Student List */}
      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Students</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 5 }}>
            <Text>{item.email}</Text>
            <Text>Badge: {item.badge || 'None'}</Text>
            <Text>Quizzes Completed: {item.progress.quizzesCompleted}</Text>
            <Text>Accuracy by Topic:</Text>
            {Object.entries(item.quizAnalytics.accuracyByTopic).map(([topic, accuracy]) => (
              <Text key={topic}>{topic}: {accuracy}%</Text>
            ))}
            {teacher.isPremium && (
              <>
                <Text>Time Spent Per Question:</Text>
                {item.quizAnalytics.timePerQuestion.map((q) => (
                  <Text key={q.questionId}>{`Question ${q.questionId}: ${q.time} seconds`}</Text>
                ))}
              </>
            )}
          </View>
        )}
      />

      {/* Upgrade Prompt for Free Teachers */}
      {!teacher.isPremium && (
        <Text style={{ marginTop: 10, color: 'blue' }}>
          Upgrade to Premium to Assign Group Quizzes and View Detailed Analytics!
        </Text>
      )}
    </View>
  );
};

export default TeacherDashboard;