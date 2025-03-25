// C:\Projects\ExamPrepRNNew\components\ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { db } from '../firebaseConfig';
import { doc, getDoc } from '@react-native-firebase/firestore';

// Define the UserData interface to match Firestore data
interface UserData {
  name?: string;
  email?: string;
  points?: number;
  level?: number;
}

const ProfileScreen = () => {
  const [userData, setUserData] = useState<UserData>({
    name: 'Loading...',
    email: 'Loading...',
    points: 0,
    level: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentUser = auth().currentUser as FirebaseAuthTypes.User | null;
        if (currentUser) {
          const userId = currentUser.uid;
          const userDocRef = doc(db, 'users', userId); // Directly reference the document
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists) { // Changed from userDoc.exists() to userDoc.exists
            const data = userDoc.data() as UserData;
            setUserData({
              name: data.name || 'Unknown',
              email: currentUser.email || 'No email',
              points: data.points || 0,
              level: data.level || 1,
            });
          } else {
            setError('User data not found.');
          }
        } else {
          setError('No user is currently signed in.');
        }
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to fetch user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00f" />
        <Text style={styles.text}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Image
        source={{ uri: 'https://via.placeholder.com/100.png?text=Profile' }}
        style={styles.profileImage}
      />
      <Text style={styles.text}>Name: {userData.name}</Text>
      <Text style={styles.text}>Email: {userData.email}</Text>
      <Text style={styles.text}>Points: {userData.points}</Text>
      <Text style={styles.text}>Level: {userData.level}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    color: '#f00',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProfileScreen;