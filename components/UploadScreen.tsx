import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { db } from '../firebaseConfig';
import { collection, addDoc } from '@react-native-firebase/firestore';
import { fetchStudyResources, solveEquation, collectStudentQuestion } from '../services/acadBuddyService';
import { createQuizQuestion } from '../services/teacherToolsService';

const UploadScreen = () => {
  const [scannedText, setScannedText] = useState('');
  const [resources, setResources] = useState<any>(null);
  const [solution, setSolution] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [subject, setSubject] = useState('math');
  const [difficulty, setDifficulty] = useState('medium');
  const [needsStudyPlan, setNeedsStudyPlan] = useState(false);

  const processScannedContent = (type: string) => {
    return type === 'image' ? '1.89 \\times 10^{-2}' : 'Sample PDF equation: 2x + 3 = 7';
  };

  const saveEquationToFirestore = async (equation: string) => {
    try {
      const docRef = await addDoc(collection(db, 'equations'), {
        equation,
        timestamp: new Date().toISOString(),
      });
      Alert.alert('Success', `Equation saved with ID: ${docRef.id}`);
    } catch (e) {
      console.error('Error saving equation: ', e);
      Alert.alert('Error', 'Failed to save equation.');
    }
  };

  const loadStudyResources = async (subject: string) => {
    const data = await fetchStudyResources(subject);
    setResources(data);
  };

  const handleSolveEquation = async () => {
    if (!scannedText) {
      Alert.alert('Error', 'No scanned equation to solve.');
      return;
    }
    const result = await solveEquation(scannedText);
    setSolution(result.solution);
  };

  const addToStudyPlan = async () => {
    try {
      const studentId = 'sample-student-id';
      await addDoc(collection(db, 'studyPlans'), {
        studentId,
        topic: `Understanding ${subject} equations`,
        timestamp: new Date().toISOString(),
      });
      Alert.alert('Success', 'Topic added to your study plan!');
      setNeedsStudyPlan(false);
    } catch (e) {
      console.error('Error adding to study plan: ', e);
      Alert.alert('Error', 'Failed to add to study plan.');
    }
  };

  const createQuizFromScannedContent = async () => {
    if (!scannedText) {
      Alert.alert('Error', 'No scanned content to create a quiz from.');
      return;
    }
    const question = `Solve the equation: ${scannedText}`;
    const answer = 'Sample answer';
    const questionId = await createQuizQuestion(question, answer, subject, difficulty);
    if (questionId) {
      Alert.alert('Success', 'Quiz question created successfully!');
      const studentId = 'sample-student-id';
      await collectStudentQuestion(studentId, question);
    } else {
      Alert.alert('Error', 'Failed to create quiz question.');
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setScannedText('Processing your image...');
        const equation = processScannedContent('image');
        setScannedText(equation);
        await saveEquationToFirestore(equation);
        await loadStudyResources('math');
      }
    } catch (error) {
      console.error('Error during image upload:', error);
      setScannedText('Sorry, I couldn’t process the image. Please try again.');
    }
  };

  const handlePDFUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.assets && result.assets.length > 0) {
        setScannedText('Processing your PDF...');
        const equation = processScannedContent('pdf');
        setScannedText(equation);
        await saveEquationToFirestore(equation);
        await loadStudyResources('math');
      }
    } catch (error) {
      console.error('Error during PDF upload:', error);
      setScannedText('Sorry, I couldn’t process the PDF. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Question</Text>
      <TouchableOpacity onPress={handleImageUpload} style={styles.button}>
        <Text style={styles.buttonText}>Upload Image</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePDFUpload} style={styles.button}>
        <Text style={styles.buttonText}>Upload PDF</Text>
      </TouchableOpacity>
      {scannedText ? (
        <View>
          <Text style={styles.scannedText}>Scanned Equation: {scannedText}</Text>
          <Text style={styles.scannedText}>
            Study Resources: {resources ? JSON.stringify(resources) : 'Loading...'}
          </Text>
          <Text style={styles.scannedText}>Solution: {solution || 'Press Solve to get the solution.'}</Text>
          <TouchableOpacity onPress={handleSolveEquation} style={styles.button}>
            <Text style={styles.buttonText}>Solve Equation</Text>
          </TouchableOpacity>
          {solution && (
            <TouchableOpacity
              onPress={() => setNeedsStudyPlan(true)}
              style={[styles.button, { backgroundColor: needsStudyPlan ? '#555' : '#333' }]}
            >
              <Text style={styles.buttonText}>I don’t understand the solution</Text>
            </TouchableOpacity>
          )}
          {needsStudyPlan && (
            <TouchableOpacity onPress={addToStudyPlan} style={styles.button}>
              <Text style={styles.buttonText}>Add to Study Plan</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Text style={styles.placeholderText}>No content uploaded yet.</Text>
      )}
      <TouchableOpacity
        onPress={() => setIsTeacher(!isTeacher)}
        style={[styles.button, { backgroundColor: isTeacher ? '#555' : '#333' }]}
      >
        <Text style={styles.buttonText}>
          {isTeacher ? 'Switch to Student Mode' : 'Switch to Teacher Mode'}
        </Text>
      </TouchableOpacity>
      {isTeacher && (
        <View>
          <Text style={styles.scannedText}>Subject:</Text>
          <TouchableOpacity
            onPress={() => setSubject(subject === 'math' ? 'science' : 'math')}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{subject}</Text>
          </TouchableOpacity>
          <Text style={styles.scannedText}>Difficulty:</Text>
          <TouchableOpacity
            onPress={() => setDifficulty(difficulty === 'easy' ? 'medium' : difficulty === 'medium' ? 'hard' : 'easy')}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{difficulty}</Text>
          </TouchableOpacity>
          {scannedText && (
            <TouchableOpacity onPress={createQuizFromScannedContent} style={styles.button}>
              <Text style={styles.buttonText}>Create Quiz Question</Text>
            </TouchableOpacity>
          )}
        </View>
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
    color: '#fff',
    fontSize: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#333',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  scannedText: {
    color: '#fff',
    marginTop: 10,
  },
  placeholderText: {
    color: '#fff',
    marginTop: 10,
  },
});

export default UploadScreen;