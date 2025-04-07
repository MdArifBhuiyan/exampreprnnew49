import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { AppRegistry, Text, View, Image, Switch, Alert, StyleSheet } from 'react-native'; // Removed AppState import here since it's used in WelcomeScreen
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Network from 'expo-network';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import { RootStackParamList, RootDrawerParamList } from './types';
import ChatScreen from './components/ChatScreen';
import LoginScreen from './components/LoginScreen';
import QuizScreen from './components/QuizScreen';
import PaymentScreen from './components/PaymentScreen';
import PersonalChatScreen from './components/PersonalChatScreen';
import SignUpScreen from './components/SignUpScreen';
import OnboardingScreen from './components/OnboardingScreen';
import DashboardScreen from './components/DashboardScreen';
import ProfileScreen from './components/ProfileScreen';
import WelcomeScreen from './components/WelcomeScreen';
import GroupChatScreen from './components/GroupChatScreen';
import GroupsScreen from './components/GroupsScreen';
import HistoryScreen from './components/HistoryScreen';
import UploadScreen from './components/UploadScreen';

interface CustomUser {
  uid: string;
  email: string | null;
}

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

const Logo = () => (
  <Image
    source={{ uri: 'https://via.placeholder.com/100x40.png?text=ExamPrep' }}
    style={{ width: 100, height: 40, marginVertical: 10 }}
  />
);

const Drawer = createDrawerNavigator<RootDrawerParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Welcome">
      <Drawer.Screen name="Welcome" component={WelcomeScreen} options={{ title: 'Home' }} />
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Upload" component={UploadScreen} />
      <Drawer.Screen name="Quiz" component={QuizScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const setupNotifications = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
      }
      messaging().onMessage(async (remoteMessage) => {
        Alert.alert('New Notification', remoteMessage.notification?.body || 'You have a new message!');
      });
    };

    setupNotifications();
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message received:', remoteMessage);
    });

    const unsubscribe = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser ? { uid: currentUser.uid, email: currentUser.email } : null);
      if (initializing) setInitializing(false);
    });

    const checkNetworkStatus = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setIsOnline(networkState.isConnected ?? true);
      } catch (error) {
        setIsOnline(true);
      }
    };

    checkNetworkStatus();
    const intervalId = setInterval(checkNetworkStatus, 10000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [initializing]);

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
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
            <Stack.Navigator>
              {user ? (
                <>
                  <Stack.Screen name="Drawer" component={DrawerNavigator} options={{ headerShown: false }} />
                  <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="Dashboard" component={DashboardScreen} />
                  <Stack.Screen name="Upload" component={UploadScreen} />
                  <Stack.Screen name="Quiz" component={QuizScreen} />
                  <Stack.Screen name="Profile" component={ProfileScreen} />
                  <Stack.Screen name="Chat" component={ChatScreen} />
                  <Stack.Screen name="Payment" component={PaymentScreen} />
                  <Stack.Screen name="PersonalChat" component={PersonalChatScreen} />
                  <Stack.Screen name="GroupChat" component={GroupChatScreen} />
                  <Stack.Screen name="Groups" component={GroupsScreen} />
                  <Stack.Screen name="History" component={HistoryScreen} />
                </>
              ) : (
                <>
                  <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
          <View style={styles.floatingButton}>
            <Text style={styles.floatingButtonText} onPress={pickImage}>📸</Text>
          </View>
        </View>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#00f',
    borderRadius: 30,
    padding: 15,
  },
  floatingButtonText: { color: '#fff', fontSize: 20 },
});

AppRegistry.registerComponent('ExamPrepRNNew', () => App);