// Load environment variables at the top
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  require('dotenv').config();
} else {
  import('dotenv').then((dotenv) => dotenv.config());
}

// Core components and navigation
import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, TextInput, FlatList, Switch } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens from components/
import ChatScreen from './components/ChatScreen';
import LoginScreen from './components/LoginScreen';
import QuizeScreen from './components/QuizeScreen';
import SummarizeScreen from './components/SummarizeScreen';

// Import the RootTabParamList
import { RootTabParamList } from './types';

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

const ProfileScreen = () => (
  <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
    <Text style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>Student Profile</Text>
    <Image
      source={{ uri: 'https://via.placeholder.com/100.png?text=Profile' }}
      style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
    />
    <Text style={{ color: '#fff' }}>Name: Not logged in</Text>
    <Text style={{ color: '#fff' }}>Email: Not logged in</Text>
  </View>
);

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
      // navigation.navigate('Quiz', { newQuestion: scannedText });
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

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

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
                component={QuizeScreen}
                options={{
                  tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>❓</Text>,
                }}
              />
              <Tab.Screen
                name="Summarize"
                component={SummarizeScreen}
                options={{
                  tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>📝</Text>,
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
            </Tab.Navigator>
          </NavigationContainer>
        </View>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;