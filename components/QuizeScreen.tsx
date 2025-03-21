// QuizScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchMCQs, saveScoreToLeaderboard, fetchLeaderboard } from '../Database';
import { QuizScreenProps } from '../types';

type MCQ = {
  id: string;
  question: string;
  options: string;
  answer: string;
  explanation?: string;
};

type LeaderboardEntry = {
  username: string;
  score: number;
};

const QuizScreen: React.FC<QuizScreenProps> = ({ route }) => {
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
    const loadMCQs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data: MCQ[] = await fetchMCQs(quizMode === 'fixed-size' ? examSize : 1);
        setMCQs(data);
      } catch (error) {
        console.error('Failed to fetch MCQs:', error);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (quizMode) {
      loadMCQs();
    }
  }, [quizMode, examSize]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data: LeaderboardEntry[] = await fetchLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    };

    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (route.params?.newQuestion) {
      const newMCQ: MCQ = {
        id: (mcqs.length + 1).toString(),
        question: route.params.newQuestion,
        options: JSON.stringify(['Paris', 'London', 'Berlin']),
        answer: 'Paris',
        explanation: 'This is a sample question added from UploadScreen.',
      };
      setMCQs((prevMCQs) => [...prevMCQs, newMCQ]);
    }
  }, [route.params?.newQuestion]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === mcqs[currentQuestionIndex].answer) {
      setScore((prevScore) => prevScore + 1);
      if (!showExplanation) {
        nextQuestion();
      }
    } else {
      setShowExplanation(true);
    }
  };

  const nextQuestion = async () => {
    if (quizMode === 'one-by-one' && currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else if (quizMode === 'unlimited') {
      setLoading(true);
      setError(null);
      try {
        const data: MCQ[] = await fetchMCQs(1);
        setMCQs((prevMCQs) => [...prevMCQs, ...data]);
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } catch (error) {
        console.error('Failed to fetch next question:', error);
        setError('Failed to load the next question. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (quizMode === 'fixed-size' && currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsQuizFinished(true);
      if (username) {
        saveScoreToLeaderboard(username, score);
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsQuizFinished(false);
    setShowExplanation(false);
  };

  const currentQuestion: MCQ | undefined = mcqs[currentQuestionIndex];

  if (!quizMode) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select Quiz Mode</Text>
        <TouchableOpacity onPress={() => setQuizMode('one-by-one')} style={styles.modeButton}>
          <Text style={styles.modeButtonText}>One-by-One Practice</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setQuizMode('fixed-size')} style={styles.modeButton}>
          <Text style={styles.modeButtonText}>Fixed-Size Exam</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setQuizMode('unlimited')} style={styles.modeButton}>
          <Text style={styles.modeButtonText}>Unlimited Mode</Text>
        </TouchableOpacity>
        {quizMode === 'fixed-size' && (
          <TextInput
            placeholder="Enter exam size"
            placeholderTextColor="#888"
            value={examSize.toString()}
            onChangeText={(text) => setExamSize(parseInt(text) || 30)}
            style={styles.input}
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
        />
        <TouchableOpacity onPress={restartQuiz} style={styles.button}>
          <Text style={styles.buttonText}>Restart Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setQuizMode(null)} style={styles.button}>
          <Text style={styles.buttonText}>Change Mode</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        {leaderboard.map((entry, index) => (
          <View key={index} style={styles.leaderboardEntry}>
            <Text style={styles.leaderboardText}>{entry.username}</Text>
            <Text style={styles.leaderboardText}>{entry.score}</Text>
          </View>
        ))}
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
        <TouchableOpacity onPress={() => setQuizMode(null)} style={styles.button}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz</Text>
      {currentQuestion ? (
        <View>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          {JSON.parse(currentQuestion.options).map((option: string, index: number) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleAnswer(option)}
              style={[
                styles.optionButton,
                selectedAnswer === option && {
                  backgroundColor: option === currentQuestion.answer ? '#0f0' : '#f00',
                },
              ]}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          {selectedAnswer && (
            <Text style={styles.statusText}>
              Status: {selectedAnswer === currentQuestion.answer ? 'Correct' : 'Incorrect'}
            </Text>
          )}
          {showExplanation && (
            <Text style={styles.explanationText}>
              Explanation: {currentQuestion.explanation || 'No explanation available.'}
            </Text>
          )}
          <TouchableOpacity onPress={nextQuestion} style={styles.button}>
            <Text style={styles.buttonText}>Next Question</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.noQuestionsText}>No more questions!</Text>
      )}
      <Text style={styles.scoreText}>Score: {score}/{mcqs.length}</Text>
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
});

export default QuizScreen;