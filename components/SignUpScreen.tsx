// C:\Projects\ExamPrepRNNew\components\SignUpScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { RootStackParamList } from '../types';

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const navigation = useNavigation<SignUpScreenNavigationProp>();

  const handleSignUp = async () => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          email,
          role,
          isPremium: false,
          createdAt: new Date().toISOString(),
        });
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Onboarding', { role }); // This should now work with the updated types
    } catch (error: any) {
      console.error('Error signing up:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Role (student/teacher)"
        placeholderTextColor="#888"
        value={role}
        onChangeText={setRole}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default SignUpScreen;