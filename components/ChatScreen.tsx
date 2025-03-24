// C:\Projects\ExamPrepRNNew\components\ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet, Animated, Easing } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { extractMCQsFromImage, extractMCQsFromPDF } from '../MCQExtractor';
import { saveMCQs } from '../services/DatabaseServices';
import auth from '@react-native-firebase/auth'; // Direct import from @react-native-firebase/auth
import { fetchLeaderboard } from '../services/DatabaseServices';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  id?: number;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [extractedMCQs, setExtractedMCQs] = useState<MCQ[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchWeakTopics = async () => {
      try {
        const user = auth().currentUser; // Use auth() directly
        if (!user) {
          setWeakTopics(['Algebra', 'World History']);
          return;
        }

        const leaderboard = await fetchLeaderboard();
        const userScores = leaderboard.filter((entry) => entry.username === user.email);
        if (userScores.length === 0) {
          setWeakTopics(['Algebra', 'World History']);
          return;
        }

        const weakAreas = userScores
          .filter((entry) => entry.score < 5)
          .map(() => 'Algebra');
        setWeakTopics(weakAreas.length > 0 ? weakAreas : ['Algebra', 'World History']);
      } catch (error) {
        console.error('Error fetching weak topics:', error);
        setWeakTopics(['Algebra', 'World History']);
      }
    };

    fetchWeakTopics();

    const initialMessage: Message = {
      role: 'assistant',
      content: weakTopics.length > 0
        ? `I noticed you're weak in ${weakTopics.join(
            ' and '
          )}. Do you have any doubts we can solve, or would you like me to explain one of these topics? I can also suggest a video class if you'd prefer. You can also upload an image or PDF to extract MCQs.`
        : 'I don’t have your quiz results yet. Do you have any doubts, or would you like me to explain a topic? You can also upload an image or PDF to extract MCQs.',
    };
    setMessages([initialMessage]);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [weakTopics, fadeAnim]);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Processing your image...' },
        ]);

        const mcqs = await extractMCQsFromImage(result.assets[0].uri);
        await saveMCQs(mcqs);
        setExtractedMCQs(mcqs);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Here are the extracted MCQs:\n${JSON.stringify(mcqs, null, 2)}` },
        ]);
      }
    } catch (error) {
      console.error('Error during image upload:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I couldn’t process the image. Please try again.' },
      ]);
    }
  };

  const handlePDFUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if ('assets' in result && result.assets && result.assets.length > 0) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Processing your PDF...' },
        ]);

        const mcqs = await extractMCQsFromPDF(result.assets[0].uri);
        await saveMCQs(mcqs);
        setExtractedMCQs(mcqs);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Here are the extracted MCQs:\n${JSON.stringify(mcqs, null, 2)}` },
        ]);
      }
    } catch (error) {
      console.error('Error during PDF upload:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I couldn’t process the PDF. Please try again.' },
      ]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);

    const inputLower = input.toLowerCase();
    if (inputLower.includes('upload image')) {
      handleImageUpload();
      setInput('');
      return;
    } else if (inputLower.includes('upload pdf')) {
      handlePDFUpload();
      setInput('');
      return;
    }

    let botResponse: string;
    if (inputLower.includes('teach me') || inputLower.includes('explain')) {
      const topic = extractTopic(inputLower);
      botResponse = `Let's learn about ${topic}! Here's a simple explanation: [Mock explanation for ${topic}]. Would you like to ask a question about this topic, or should I suggest a video class?`;
    } else if (
      inputLower.includes('why') ||
      inputLower.includes('what') ||
      inputLower.includes('how') ||
      inputLower.includes('doubt')
    ) {
      botResponse = `Let me help with your doubt: "${input}". Here's the explanation: [Mock explanation answering why/what/how for "${input}"]. Does that clear your doubt? If not, feel free to ask more!`;
    } else if (inputLower.includes('video')) {
      botResponse = `Here's a suggestion for a video class on this topic: [Mock video link]. Would you like to learn more about this topic or ask a question?`;
    } else {
      botResponse = `I understand you're asking about "${input}". Can you specify if you'd like me to explain this topic, solve a doubt, or suggest a video class? You can also say "upload image" or "upload pdf" to extract MCQs.`;
    }

    const botMessage: Message = { role: 'assistant', content: botResponse };
    setMessages((prev) => [...prev, botMessage]);

    setInput('');
  };

  const extractTopic = (input: string): string => {
    const inputLower = input.toLowerCase();
    const teachIndex = inputLower.indexOf('teach me');
    const explainIndex = inputLower.indexOf('explain');
    const startIndex = teachIndex !== -1 ? teachIndex + 8 : explainIndex + 7;
    return startIndex > 0 ? inputLower.slice(startIndex).trim() : 'this topic';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chatbot</Text>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => `${item.role}-${index}`}
        renderItem={({ item }) => (
          <Animated.View style={[item.role === 'user' ? styles.userMessage : styles.botMessage, { opacity: fadeAnim }]}>
            <Text style={styles.messageText}>{item.content}</Text>
          </Animated.View>
        )}
        contentContainerStyle={styles.chatContainer}
      />
      {extractedMCQs.length > 0 && (
        <ScrollView style={styles.mcqContainer}>
          <Text style={styles.mcqTitle}>Extracted MCQs:</Text>
          {extractedMCQs.map((mcq, index) => (
            <View key={index} style={styles.mcqItem}>
              <Text style={styles.mcqText}>{mcq.question}</Text>
              {mcq.options.map((option, idx) => (
                <Text key={idx} style={styles.mcqOption}>{option}</Text>
              ))}
              <Text style={styles.mcqAnswer}>Answer: {mcq.answer}</Text>
            </View>
          ))}
        </ScrollView>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question, say 'teach me [topic]', or 'upload image/pdf'..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          onPress={() => {
            animateButton();
            sendMessage();
          }}
          style={styles.sendButton}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Ionicons name="send" size={24} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
      <View style={styles.uploadButtonsContainer}>
        <TouchableOpacity
          onPress={() => {
            animateButton();
            handleImageUpload();
          }}
          style={styles.uploadButton}
        >
          <Animated.View style={[styles.uploadButtonInner, { transform: [{ scale: buttonScale }] }]}>
            <Ionicons name="image-outline" size={24} color="#fff" />
            <Text style={styles.uploadButtonText}>Image</Text>
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            animateButton();
            handlePDFUpload();
          }}
          style={styles.uploadButton}
        >
          <Animated.View style={[styles.uploadButtonInner, { transform: [{ scale: buttonScale }] }]}>
            <Ionicons name="document-outline" size={24} color="#fff" />
            <Text style={styles.uploadButtonText}>PDF</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  chatContainer: {
    paddingBottom: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    padding: 12,
    marginVertical: 5,
    borderRadius: 15,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    padding: 12,
    marginVertical: 5,
    borderRadius: 15,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  mcqContainer: {
    marginTop: 10,
    maxHeight: 200,
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 10,
  },
  mcqTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mcqItem: {
    backgroundColor: '#333',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  mcqText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mcqOption: {
    color: '#aaa',
    fontSize: 14,
    marginLeft: 10,
  },
  mcqAnswer: {
    color: '#00ff00',
    fontSize: 14,
    marginTop: 5,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#222',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#fff',
    padding: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 10,
  },
  uploadButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  uploadButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  uploadButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default ChatScreen;