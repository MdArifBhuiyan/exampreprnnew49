// C:\Projects\ExamPrepRNNew\App.tsx
import React, { useState, useEffect } from 'react';
import {
  AppRegistry,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Switch,
  Alert,
  StyleSheet,
  AppState,
  type AppStateStatus,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'; // Add this import

// Import environment variables
import {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
} from 'react-native-dotenv';

// Firebase imports
import auth from '@react-native-firebase/auth';
import { db } from './firebaseConfig';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { onAuthStateChanged, signOut } from '@react-native-firebase/auth';
import { collection, addDoc, onSnapshot, orderBy, serverTimestamp, query, doc, getDoc } from '@react-native-firebase/firestore';

// Import MCQ extraction functions
import { extractMCQsFromImage, extractMCQsFromPDF } from './MCQExtractor';
import { saveMCQs } from './services/DatabaseServices';

// Import screens
import ScanScreen from './components/ScanScreen';
import ChatScreen from './components/ChatScreen';
import LoginScreen from './components/LoginScreen';
import QuizScreen from './components/QuizScreen';
import PaymentScreen from './components/PaymentScreen';
import PersonalChatScreen from './components/PersonalChatScreen';
import SignUpScreen from './components/SignUpScreen';
import OnboardingScreen from './components/OnboardingScreen';
import DashboardScreen from './components/DashboardScreen';

// Import types
import { RootTabParamList, RootStackParamList } from './types';

// Access environment variables with fallback to react-native-dotenv
const apiKey = Constants.expoConfig?.extra?.API_KEY || API_KEY;
const authDomain = Constants.expoConfig?.extra?.AUTH_DOMAIN || AUTH_DOMAIN;
const projectId = Constants.expoConfig?.extra?.PROJECT_ID || PROJECT_ID;
const storageBucket = Constants.expoConfig?.extra?.STORAGE_BUCKET || STORAGE_BUCKET;
const messagingSenderId = Constants.expoConfig?.extra?.MESSAGING_SENDER_ID || MESSAGING_SENDER_ID;
const appId = Constants.expoConfig?.extra?.APP_ID || APP_ID;

// Define a custom User type since the import from @react-native-firebase/auth is not working
interface CustomUser {
  uid: string;
  email: string | null;
  // Add other properties as needed, e.g., displayName, photoURL, etc.
}

// Placeholder logo
const Logo = () => (
  <Image
    source={{ uri: 'https://via.placeholder.com/100x40.png?text=ExamPrep' }}
    style={{ width: 100, height: 40, marginVertical: 10 }}
  />
);

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
          <Text style={{ color: '#fff' }}>Something went wrong: {this.state.error}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Tab Screens
const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const ProfileScreen = () => {
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    points: number;
    level: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth().currentUser as CustomUser | null; // Type assertion to CustomUser
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid); // Removed 'as any' since db type issue is resolved
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists) {
            const data = userDoc.data();
            setUserData({
              name: data?.name ?? 'Unknown',
              email: currentUser.email ?? 'No email',
              points: data?.points ?? 0,
              level: data?.level ?? 1,
            });
          } else {
            console.log('No such user document!');
            setUserData({
              name: 'Not logged in',
              email: 'Not logged in',
              points: 0,
              level: 1,
            });
          }
        } else {
          console.log('No user is logged in');
          setUserData({
            name: 'Not logged in',
            email: 'Not logged in',
            points: 0,
            level: 1,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({
          name: 'Error',
          email: 'Error',
          points: 0,
          level: 1,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <Text style={{ color: '#fff' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>Student Profile</Text>
      <Image
        source={{ uri: 'https://via.placeholder.com/100.png?text=Profile' }}
        style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
      />
      <Text style={{ color: '#fff' }}>Name: {userData?.name}</Text>
      <Text style={{ color: '#fff' }}>Email: {userData?.email}</Text>
      <Text style={{ color: '#fff' }}>Points: {userData?.points}</Text>
      <Text style={{ color: '#fff' }}>Level: {userData?.level}</Text>
    </View>
  );
};

const HistoryScreen = () => {
  const [history] = useState<{ id: string; action: string; timestamp: string }[]>([]);

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#333' }}>
            <Text style={{ color: '#fff' }}>{item.action} - {item.timestamp}</Text>
          </View>
        )}
      />
    </View>
  );
};

const GroupsScreen = () => {
  const [groups] = useState([
    { id: '1', name: 'Math Coaching Center', code: 'MATH123', verified: true, type: 'coaching' },
    { id: '2', name: 'Science College Group', code: 'SCI456', verified: true, type: 'college' },
    { id: '3', name: 'Student Study Group', code: 'STU789', verified: false, type: 'student' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGroups, setFilteredGroups] = useState(groups);

  useEffect(() => {
    const filtered = groups.filter(
      (group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredGroups(filtered);
  }, [searchQuery, groups]);

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>Groups</Text>
      <TextInput
        placeholder="Search by name or code..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ backgroundColor: '#333', color: '#fff', padding: 10, marginBottom: 10, borderRadius: 5 }}
      />
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#333' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#fff', flex: 1 }}>
                {item.name} ({item.type})
              </Text>
              {item.verified && (
                <Text style={{ color: '#00f', fontSize: 16, marginRight: 5 }}>✔</Text>
              )}
              <Text style={{ color: '#888' }}>{item.code}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const UploadScreen = () => {
  const [scannedText, setScannedText] = useState('');
  const [extractedMCQs, setExtractedMCQs] = useState<any[]>([]);

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setScannedText('Processing your image...');
        const mcqs = await extractMCQsFromImage(result.assets[0].uri);
        saveMCQs(mcqs);
        setExtractedMCQs(mcqs);
        setScannedText(`Extracted ${mcqs.length} MCQs from the image.`);
      }
    } catch (error) {
      console.error('Error during image upload:', error);
      setScannedText('Sorry, I couldn’t process the image. Please try again.');
    }
  };

  const handlePDFUpload = async () => {
    try {
      const file = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
      });
      if (!file.canceled) {
        setScannedText('Processing your PDF...');
        const mcqs = await extractMCQsFromPDF(file.assets[0].uri);
        saveMCQs(mcqs);
        setExtractedMCQs(mcqs);
        setScannedText(`Extracted ${mcqs.length} MCQs from the PDF.`);
      }
    } catch (error) {
      console.error('Error during PDF upload:', error);
      setScannedText('Sorry, I couldn’t process the PDF. Please try again.');
    }
  };

  const addToQuiz = () => {
    if (scannedText) {
      console.log('Navigating to Quiz with new question:', scannedText);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>Upload Question</Text>
      <TouchableOpacity onPress={handleImageUpload} style={{ padding: 10, backgroundColor: '#333', marginBottom: 10 }}>
        <Text style={{ color: '#fff' }}>Upload Image</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePDFUpload} style={{ padding: 10, backgroundColor: '#333', marginBottom: 10 }}>
        <Text style={{ color: '#fff' }}>Upload PDF</Text>
      </TouchableOpacity>
      {scannedText ? (
        <>
          <Text style={{ color: '#fff' }}>{scannedText}</Text>
          {extractedMCQs.length > 0 && (
            <FlatList
              data={extractedMCQs}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={{ padding: 10, backgroundColor: '#333', marginVertical: 5, borderRadius: 5 }}>
                  <Text style={{ color: '#fff' }}>{item.question}</Text>
                  {item.options.map((option: string, idx: number) => (
                    <Text key={idx} style={{ color: '#aaa' }}>{option}</Text>
                  ))}
                  <Text style={{ color: '#0f0' }}>Answer: {item.answer}</Text>
                </View>
              )}
            />
          )}
          <TouchableOpacity onPress={addToQuiz} style={{ padding: 10, backgroundColor: '#00f', marginTop: 10 }}>
            <Text style={{ color: '#fff' }}>Add to Quiz</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={{ color: '#fff' }}>No content uploaded yet.</Text>
      )}
    </View>
  );
};

interface GroupMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: any;
}

const GroupChatScreen = () => {
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [newGroupMessage, setNewGroupMessage] = useState<string>('');

  useEffect(() => {
    const groupId = 'group1';
    const messagesRef = collection(db, 'groupChats', groupId, 'messages'); // Removed 'as any'
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GroupMessage[];
      setGroupMessages(messages);
    }, (error) => {
      console.error('Error fetching group messages:', error);
    });

    return () => unsubscribe();
  }, []);

  const sendGroupMessage = async () => {
    if (!newGroupMessage.trim()) return;
    const groupId = 'group1';
    const messagesRef = collection(db, 'groupChats', groupId, 'messages'); // Removed 'as any'
    try {
      await addDoc(messagesRef, {
        sender: 'user1',
        text: newGroupMessage,
        timestamp: serverTimestamp(),
      });
      setNewGroupMessage('');
    } catch (error) {
      console.error('Error sending group message:', error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>Group Chat</Text>
      <FlatList
        data={groupMessages}
        renderItem={({ item }) => (
          <View style={item.sender === 'user1' ? styles.userMessage : styles.botMessage}>
            <Text style={{ color: '#fff' }}>{item.text}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newGroupMessage}
          onChangeText={setNewGroupMessage}
          placeholder="Type a message..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={sendGroupMessage}>
          <Text style={{ fontSize: 24, color: '#00f' }}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main App Component
const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [user, setUser] = useState<CustomUser | null>(null); // Use CustomUser instead of User

  useEffect(() => {
    console.log('App component rendering...');

    // Request notification permissions and get FCM token
    const setupNotifications = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        console.log('Notification permission granted.');
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
      } else {
        console.log('Notification permission denied.');
      }

      // Handle foreground messages
      messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground message received:', remoteMessage);
        Alert.alert('New Notification', remoteMessage.notification?.body || 'You have a new message!');
      });
    };

    setupNotifications();

    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Background message received:', remoteMessage);
    });

    // Check authentication state on app launch
    const unsubscribe = onAuthStateChanged(auth(), async (currentUser: CustomUser | null) => {
      console.log('onAuthStateChanged triggered');
      setUser(currentUser);
      if (currentUser) {
        console.log('Fetching user data from Firestore...');
        const userDocRef = doc(db, 'users', currentUser.uid); // Removed 'as any'
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.exists ? userDoc.data() : undefined; // Fixed userDoc.exists() to userDoc.exists
        console.log('User data from Firestore:', userData);
        if (userData?.role === 'institution') {
          console.log('User is an institution, signing out');
          await signOut(auth());
          setUser(null);
        } else {
          // Persistent login for students/teachers
          await AsyncStorage.setItem('userToken', currentUser.uid);
        }
      }
    });

    // Force logout for institutions on app close
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        const currentUser: CustomUser | null = auth().currentUser; // Use CustomUser
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid); // Removed 'as any'
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists && userDoc.data()?.role === 'institution') { // Fixed userDoc.exists() to userDoc.exists
            await signOut(auth());
            setUser(null);
          }
        }
      }
    });

    // Check network status using expo-network
    const checkNetworkStatus = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setIsOnline(networkState.isConnected ?? true);
        console.log('Network state:', networkState);
      } catch (error) {
        console.error('Error fetching network status with expo-network:', error);
        setIsOnline(true);
      }
    };

    // Initial check
    checkNetworkStatus();

    // Poll network status every 10 seconds
    const intervalId = setInterval(checkNetworkStatus, 10000);

    return () => {
      unsubscribe();
      subscription.remove();
      clearInterval(intervalId);
    };
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        Alert.alert('Image Upload', 'Image received. Processing...');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const MainTabs = () => (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: isDarkMode ? '#333' : '#ddd' },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>❓</Text>,
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>📤</Text>,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>📜</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>👤</Text>,
        }}
      />
      <Tab.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>💳</Text>,
        }}
      />
      <Tab.Screen
        name="GroupChat"
        component={GroupChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>📢</Text>,
        }}
      />
      <Tab.Screen
        name="PersonalChat"
        component={PersonalChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>📷</Text>,
        }}
      />
    </Tab.Navigator>
  );

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <View style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#fff' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
            <Logo />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: isDarkMode ? '#fff' : '#000', marginRight: 10 }}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
              <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
            </View>
          </View>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={user ? 'MainTabs' : 'SignUp'}>
              <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
              <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
              <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>

          {/* Floating Image Upload Button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              backgroundColor: '#00f',
              borderRadius: 30,
              padding: 15,
            }}
            onPress={pickImage}
          >
            <Text style={{ color: '#fff', fontSize: 20 }}>📸</Text>
          </TouchableOpacity>
        </View>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

// Styles for GroupChatScreen
const styles = StyleSheet.create({
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E90FF',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#333333',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
});

export default App;

// Register the main component for Expo
AppRegistry.registerComponent('ExamPrepRNNew', () => App);