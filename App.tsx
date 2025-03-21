// App.tsx
import Constants from 'expo-constants';

// Access environment variables
const API_KEY = Constants.expoConfig?.extra?.API_KEY;
const AUTH_DOMAIN = Constants.expoConfig?.extra?.AUTH_DOMAIN;
const PROJECT_ID = Constants.expoConfig?.extra?.PROJECT_ID;
const STORAGE_BUCKET = Constants.expoConfig?.extra?.STORAGE_BUCKET;
const MESSAGING_SENDER_ID = Constants.expoConfig?.extra?.MESSAGING_SENDER_ID;
const APP_ID = Constants.expoConfig?.extra?.APP_ID;

// Log to verify
console.log('API_KEY:', API_KEY);
console.log('AUTH_DOMAIN:', AUTH_DOMAIN);
console.log('PROJECT_ID:', PROJECT_ID);
console.log('STORAGE_BUCKET:', STORAGE_BUCKET);
console.log('MESSAGING_SENDER_ID:', MESSAGING_SENDER_ID);
console.log('APP_ID:', APP_ID);

// Core components and navigation
import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, TextInput, FlatList, Switch, Alert, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

// Import screens from components/
import ChatScreen from './components/ChatScreen';
import LoginScreen from './components/LoginScreen';
import QuizScreen from './components/QuizScreen';
import PaymentScreen from './components/PaymentScreen';
import PersonalChatScreen from './components/PersonalChatScreen';

// Import the RootTabParamList
import { RootTabParamList } from './types';

// Initialize Firebase with expo-constants
const firebaseConfig = {
  apiKey: API_KEY ?? '',
  authDomain: AUTH_DOMAIN ?? '',
  projectId: PROJECT_ID ?? '',
  storageBucket: STORAGE_BUCKET ?? '',
  messagingSenderId: MESSAGING_SENDER_ID ?? '',
  appId: APP_ID ?? '',
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
  console.warn('Firebase configuration is incomplete. Check app.json extra field and restart the app.');
  if (process.env.NODE_ENV === 'development') {
    throw new Error('Missing Firebase config in app.json');
  }
}

// Initialize Firebase (if not already initialized)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Placeholder logo
const Logo = () => (
  <Image
    source={{ uri: 'https://via.placeholder.com/100x40.png?text=ExamPrep' }}
    style={{ width: 100, height: 40, marginVertical: 10 }}
  />
);

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: string | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
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

const ProfileScreen = () => {
  const [points] = useState(0);
  const [level] = useState(1);
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>Student Profile</Text>
      <Image
        source={{ uri: 'https://via.placeholder.com/100.png?text=Profile' }}
        style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
      />
      <Text style={{ color: '#fff' }}>Name: Not logged in</Text>
      <Text style={{ color: '#fff' }}>Email: Not logged in</Text>
      <Text style={{ color: '#fff' }}>Points: {points}</Text>
      <Text style={{ color: '#fff' }}>Level: {level}</Text>
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
  }, [searchQuery]);

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

  const simulateScan = () => {
    setScannedText('What is the capital of France?');
  };

  const addToQuiz = () => {
    if (scannedText) {
      console.log('Navigating to Quiz with new question:', scannedText);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>Upload Question</Text>
      <TouchableOpacity onPress={simulateScan} style={{ padding: 10, backgroundColor: '#333', marginBottom: 10 }}>
        <Text style={{ color: '#fff' }}>Scan Book/Question</Text>
      </TouchableOpacity>
      {scannedText ? (
        <>
          <Text style={{ color: '#fff' }}>Scanned: {scannedText}</Text>
          <TouchableOpacity onPress={addToQuiz} style={{ padding: 10, backgroundColor: '#00f', marginTop: 10 }}>
            <Text style={{ color: '#fff' }}>Add to Quiz</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={{ color: '#fff' }}>No content scanned yet.</Text>
      )}
    </View>
  );
};

const GroupChatScreen = () => {
  const [groupMessages, setGroupMessages] = useState<any[]>([]);
  const [newGroupMessage, setNewGroupMessage] = useState<string>('');

  useEffect(() => {
    const groupId = 'group1';
    const unsubscribe = firestore()
      .collection('groupChats')
      .doc(groupId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot((snapshot: any) => {
        const messages = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroupMessages(messages);
      });
    return () => unsubscribe();
  }, []);

  const sendGroupMessage = async () => {
    if (!newGroupMessage.trim()) return;
    const groupId = 'group1';
    await firestore()
      .collection('groupChats')
      .doc(groupId)
      .collection('messages')
      .add({
        sender: 'user1',
        text: newGroupMessage,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
    setNewGroupMessage('');
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
        keyExtractor={(item: any) => item.id}
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

const ScanScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    requestPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    Alert.alert('Scan Result', `Scanned data: ${data} (Type: ${type})`);
  };

  if (hasPermission === null) {
    return <Text style={{ color: '#fff' }}>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text style={{ color: '#fff' }}>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>Scan</Text>
      <Camera
        style={{ flex: 1, width: '100%' }}
        type={CameraType.back}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {scanned && (
        <TouchableOpacity onPress={() => setScanned(false)} style={{ padding: 10, backgroundColor: '#00f', marginTop: 10 }}>
          <Text style={{ color: '#fff' }}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Main App Component
const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    console.log('App component rendering...');

    // Check network status
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    // Firebase notifications
    const unsubscribeMessaging = messaging().onMessage(async (remoteMessage: any) => {
      Alert.alert('New Notification', remoteMessage.notification.body);
    });

    return () => {
      unsubscribeNetInfo();
      unsubscribeMessaging();
    };
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      Alert.alert('Image Upload', 'Image received. Processing...');
    }
  };

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
                name="Login"
                component={LoginScreen}
                options={{
                  tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>🔑</Text>,
                }}
              />
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