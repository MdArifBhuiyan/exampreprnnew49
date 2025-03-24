// C:\Projects\ExamPrepRNNew\components\OnboardingScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type OnboardingScreenRouteProp = RouteProp<RootStackParamList, 'Onboarding'>;
type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC = () => {
  const route = useRoute<OnboardingScreenRouteProp>();
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const role = route.params.role; // Safe now due to updated types

  const handleContinue = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ExamPrep!</Text>
      <Text style={styles.text}>You signed up as a {role}.</Text>
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
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
  text: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
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

export default OnboardingScreen;