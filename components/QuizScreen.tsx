import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MCQ, LeaderboardEntry, initDatabase, fetchMCQs, saveScoreToLeaderboard, fetchLeaderboard } from '../services/DatabaseServices';

// Define new navigation types
type RootStackParamList = {
  Welcome: undefined;
  Dashboard: undefined;
  Upload: undefined;
  Quiz: { newQuestion?: string };
  Profile: undefined;
  // Add other screens as needed
};

type QuizScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Quiz'>;

const QuizScreen: React.FC = () => {
  const navigation = useNavigation<QuizScreenNavigationProp>();
  const [mcqs, setMCQs] = useState<MCQ[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [quizMode, setQuizMode] = useState<'one-by-one' | 'fixed-size' | 'unlimited' | null>(null);
  const [examSize, setExamSize] = useState<number>(30);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const initializeAndLoadMCQs = async () => {
      setLoading(true);
      setError(null);
      try {
        await initDatabase();
        const fetchSize = quizMode === 'fixed-size' ? examSize : quizMode === 'unlimited' ? 5 : 1;
        const data: MCQ[] = await fetchMCQs(fetchSize);
        if (data.length === 0) {
          throw new Error('No questions available in the database.');
        }
        setMCQs(data);
      } catch (err: any) {
        console.error('Failed to fetch MCQs:', err);
        setError(err.message || 'Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (quizMode) {
      initializeAndLoadMCQs();
    }
  }, [quizMode, examSize]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        await initDatabase();
        const data: LeaderboardEntry[] = await fetchLeaderboard();
        setLeaderboard(data);
      } catch (err: any) {
        console.error('Failed to fetch leaderboard:', err.message || err);
      }
    };

    loadLeaderboard();
  }, []);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === mcqs[currentQuestionIndex]?.answer) {
      setScore((prevScore) => prevScore + 1);
    }
    setShowExplanation(true);
  };

  const nextQuestion = async () => {
    if (quizMode === 'one-by-one' && currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else if (quizMode === 'unlimited') {
      if (currentQuestionIndex < mcqs.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } else {
        setLoading(true);
        setError(null);
        try {
          const data: MCQ[] = await fetchMCQs(5);
          if (data.length === 0) {
            setIsQuizFinished(true);
            if (username) {
              await saveScoreToLeaderboard(username, score);
              const updatedLeaderboard = await fetchLeaderboard();
              setLeaderboard(updatedLeaderboard);
            }
            return;
          }
          setMCQs((prevMCQs) => [...prevMCQs, ...data]);
          setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
          setSelectedAnswer(null);
          setShowExplanation(false);
        } catch (err: any) {
          console.error('Failed to fetch next question:', err);
          setError(err.message || 'Failed to load the next question. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    } else if (quizMode === 'fixed-size' && currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsQuizFinished(true);
      if (!username) {
        Alert.alert('Enter Username', 'Please enter your username to save your score to the leaderboard.');
      } else {
        await saveScoreToLeaderboard(username, score);
        const updatedLeaderboard = await fetchLeaderboard();
        setLeaderboard(updatedLeaderboard);
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsQuizFinished(false);
    setShowExplanation(false);
    setMCQs([]);
    setQuizMode(quizMode);
  };

  const handleExamSizeChange = (text: string) => {
    const size = parseInt(text);
    if (!isNaN(size) && size > 0) {
      setExamSize(size);
    } else {
      setExamSize(30);
    }
  };

  const toggleExplanation = () => {
    setShowExplanation((prev) => !prev);
  };

  const currentQuestion: MCQ | undefined = mcqs[currentQuestionIndex];

  if (!quizMode) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select Quiz Mode</Text>
        <TouchableOpacity
          onPress={() => setQuizMode('one-by-one')}
          style={styles.modeButton}
          accessible={true}
          accessibilityLabel="Select One-by-One Practice mode"
        >
          <Text style={styles.modeButtonText}>One-by-One Practice</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setQuizMode('fixed-size')}
          style={styles.modeButton}
          accessible={true}
          accessibilityLabel="Select Fixed-Size Exam mode"
        >
          <Text style={styles.modeButtonText}>Fixed-Size Exam</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setQuizMode('unlimited')}
          style={styles.modeButton}
          accessible={true}
          accessibilityLabel="Select Unlimited mode"
        >
          <Text style={styles.modeButtonText}>Unlimited Mode</Text>
        </TouchableOpacity>
        {quizMode === 'fixed-size' && (
          <TextInput
            placeholder="Enter exam size (e.g., 30)"
            placeholderTextColor="#888"
            value={examSize.toString()}
            onChangeText={handleExamSizeChange}
            keyboardType="numeric"
            style={styles.input}
            accessible={true}
            accessibilityLabel="Enter number of questions for Fixed-Size Exam"
          />
        )}
      </View>
    );
  }

  if (isQuizFinished) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Quiz Finished!</Text>
        <Text style={styles.scoreText}>Your Score: {score}/{mcqs.length}</Text>
        <TextInput
          placeholder="Enter your name"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          accessible={true}
          accessibilityLabel="Enter your username for the leaderboard"
        />
        <TouchableOpacity
          onPress={restartQuiz}
          style={styles.button}
          accessible={true}
          accessibilityLabel="Restart the quiz"
        >
          <Text style={styles.buttonText}>Restart Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setQuizMode(null)}
          style={styles.button}
          accessible={true}
          accessibilityLabel="Change quiz mode"
        >
          <Text style={styles.buttonText}>Change Mode</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        {leaderboard.length > 0 ? (
          leaderboard.map((entry, index) => (
            <View key={index} style={styles.leaderboardEntry}>
              <Text style={styles.leaderboardText}>{entry.username}</Text>
              <Text style={styles.leaderboardText}>{entry.score}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noLeaderboardText}>No leaderboard entries yet.</Text>
        )}
        <TouchableOpacity
          onPress={() => navigation.navigate('Welcome')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Back to Welcome</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00f" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={() => setQuizMode(quizMode)}
          style={styles.button}
          accessible={true}
          accessibilityLabel="Retry loading questions"
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setQuizMode(null)}
          style={styles.button}
          accessible={true}
          accessibilityLabel="Change quiz mode"
        >
          <Text style={styles.buttonText}>Change Mode</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text style={styles.noQuestionsText}>No questions available. Please try again later.</Text>
        <TouchableOpacity
          onPress={() => setQuizMode(null)}
          style={styles.button}
          accessible={true}
          accessibilityLabel="Change quiz mode"
        >
          <Text style={styles.buttonText}>Change Mode</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz</Text>
      <View>
        <Text style={styles.questionText}>
          Question {currentQuestionIndex + 1}/{mcqs.length}: {currentQuestion.question}
        </Text>
        {currentQuestion.options.map((option: string, index: number) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleAnswer(option)}
            disabled={selectedAnswer !== null}
            style={[
              styles.optionButton,
              ...(selectedAnswer === option
                ? [{ backgroundColor: option === currentQuestion.answer ? '#0f0' : '#f00' }]
                : []),
              ...(selectedAnswer && option === currentQuestion.answer
                ? [{ backgroundColor: '#0f0' }]
                : []),
            ]}
            accessible={true}
            accessibilityLabel={`Option ${index + 1}: ${option}`}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
        {selectedAnswer && (
          <Text style={styles.statusText}>
            Status: {selectedAnswer === currentQuestion.answer ? 'Correct' : 'Incorrect'}
          </Text>
        )}
        {selectedAnswer && (
          <TouchableOpacity
            onPress={toggleExplanation}
            style={styles.explanationToggle}
            accessible={true}
            accessibilityLabel={showExplanation ? 'Hide explanation' : 'Show explanation'}
          >
            <Text style={styles.explanationToggleText}>
              {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
            </Text>
          </TouchableOpacity>
        )}
        {showExplanation && (
          <Text style={styles.explanationText}>
            Explanation: {currentQuestion.explanation || 'No explanation available.'}
          </Text>
        )}
        <TouchableOpacity
          onPress={nextQuestion}
          style={[styles.button, !selectedAnswer && styles.buttonDisabled]}
          disabled={!selectedAnswer}
          accessible={true}
          accessibilityLabel="Go to the next question"
        >
          <Text style={styles.buttonText}>Next Question</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.scoreText}>Score: {score}/{mcqs.length}</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Welcome')}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>Back to Welcome</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    marginBottom: 20,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 10,
  },
  modeButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  questionText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  optionButton: {
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 10,
    marginVertical: 5,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  statusText: {
    color: '#fff',
    marginTop: 10,
  },
  explanationText: {
    color: '#fff',
    marginTop: 10,
    fontStyle: 'italic',
  },
  explanationToggle: {
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  explanationToggleText: {
    color: '#00f',
    fontSize: 16,
  },
  noQuestionsText: {
    color: '#fff',
    fontSize: 16,
  },
  scoreText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
  },
  button: {
    padding: 15,
    backgroundColor: '#00f',
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#f00',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginBottom: 5,
  },
  leaderboardText: {
    color: '#fff',
    fontSize: 16,
  },
  noLeaderboardText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#555',
    borderRadius: 5,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default QuizScreen;