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
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
const Tab = createBottomTabNavigator();

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

const UploadScreen = ({ navigation }: BottomTabScreenProps<any, 'Upload'>) => {
  const [scannedText, setScannedText] = useState('');

  const simulateScan = () => {
    setScannedText('What is the capital of France?');
  };

  const addToQuiz = () => {
    if (scannedText) {
      navigation.navigate('Quiz', { newQuestion: scannedText });
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

const ChatScreen = ({ navigation }: BottomTabScreenProps<any, 'Chat'>) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ id: string; text: string; sender: string }[]>([]);

  const sendMessage = () => {
    if (message) {
      setMessages([...messages, { id: Date.now().toString(), text: message, sender: 'user' }]);
      setMessage('');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>Chat</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, alignSelf: item.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <Text style={{ color: '#fff', backgroundColor: item.sender === 'user' ? '#00f' : '#555', padding: 5 }}>
              {item.text}
            </Text>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          style={{ flex: 1, backgroundColor: '#333', color: '#fff', padding: 10, marginRight: 10 }}
        />
        <TouchableOpacity onPress={() => navigation.navigate('Quiz')}>
          <Text style={{ color: '#fff', backgroundColor: '#00f', padding: 10 }}>Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={sendMessage}>
          <Text style={{ color: '#fff', backgroundColor: '#00f', padding: 10, marginLeft: 10 }}>➡️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const QuizScreen = ({ route }: BottomTabScreenProps<any, 'Quiz'>) => {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [questions, setQuestions] = useState([
    { id: 1, text: 'What is 2 + 2?', options: ['3', '4', '5'], correct: '4' },
    { id: 2, text: 'Capital of France?', options: ['London', 'Paris', 'Berlin'], correct: 'Paris' },
  ]);

  useEffect(() => {
    if (route.params?.newQuestion) {
      setQuestions([
        ...questions,
        { id: questions.length + 1, text: route.params.newQuestion, options: ['Paris', 'London', 'Berlin'], correct: 'Paris' },
      ]);
    }
  }, [route.params?.newQuestion]);

  const handleAnswer = (questionId: number, selected: string) => {
    setAnswers({ ...answers, [questionId]: selected });
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>Quiz</Text>
      {questions.map((q) => (
        <View key={q.id} style={{ marginVertical: 10 }}>
          <Text style={{ color: '#fff' }}>{q.text}</Text>
          {q.options.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => handleAnswer(q.id, option)}
              style={{
                padding: 10,
                backgroundColor: answers[q.id] === option ? (option === q.correct ? '#0f0' : '#f00') : '#333',
                marginVertical: 5,
              }}
            >
              <Text style={{ color: '#fff' }}>{option}</Text>
            </TouchableOpacity>
          ))}
          <Text style={{ color: '#fff' }}>
            Status: {answers[q.id] ? (answers[q.id] === q.correct ? 'Correct' : 'Incorrect') : 'Not answered'}
          </Text>
        </View>
      ))}
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
                name="Chat"
                component={ChatScreen}
                options={{
                  tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>💬</Text>,
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
                name="Quiz"
                component={QuizScreen}
                options={{
                  tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>❓</Text>,
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