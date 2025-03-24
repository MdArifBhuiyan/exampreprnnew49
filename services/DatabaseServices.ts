// C:\Projects\ExamPrepRNNew\services\DatabaseServices.ts
import SQLite from 'react-native-sqlite-storage';
import firestore from '@react-native-firebase/firestore';

export interface MCQ {
  id?: number; // Optional id for SQLite
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  difficulty: string;
  question: string;
  options: string[];
  answer: string;
}

export interface UserData {
  email: string;
  role: string;
  joinDate: any;
  isPremium: boolean;
  isVanguard: boolean;
  vanguardTier: string | null;
  badge: string | null;
  progress: {
    quizzesCompleted: number;
    totalTimeSpent: number;
    dailyQuestionCount: number;
    lastQuestionDate: any;
  };
  quizAnalytics: {
    timePerQuestion: { questionId: string; time: number }[];
    accuracyByTopic: { [key: string]: number };
  };
  groups: string[];
}

// SQLite database instance
let db: SQLite.SQLiteDatabase | null = null;

const initializeSQLite = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabase({ name: 'mcqs.db', location: 'default' });
    console.log('SQLite database opened');
  } catch (error) {
    console.error('Error opening SQLite database:', error);
    throw new Error(`Failed to open SQLite database: ${error}`);
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.close();
    console.log('SQLite database closed');
    db = null;
  }
};

export const initDatabase = async (): Promise<void> => {
  if (!db) {
    await initializeSQLite();
  }
  try {
    await new Promise<void>((resolve, reject) => {
      db!.transaction((tx) => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS mcqs (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, options TEXT, answer TEXT);',
          [],
          () => {
            console.log('Database initialized');
            resolve();
          },
          (error) => {
            console.error('Error initializing database:', error);
            reject(new Error(`Failed to initialize database: ${error}`));
            return false;
          }
        );
      });
    });
  } catch (error) {
    console.error('Error in database transaction:', error);
    throw new Error(`Database transaction failed: ${error}`);
  }
};

export const saveMCQs = async (mcqs: MCQ[]): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  try {
    await new Promise<void>((resolve, reject) => {
      db!.transaction(
        (tx) => {
          mcqs.forEach((mcq) => {
            tx.executeSql(
              'INSERT INTO mcqs (question, options, answer) VALUES (?, ?, ?);',
              [mcq.question, JSON.stringify(mcq.options), mcq.answer],
              () => console.log(`MCQ saved: ${mcq.question}`),
              (error) => {
                console.error('Error saving MCQ:', error);
                reject(new Error(`Failed to save MCQ: ${error}`));
                return false;
              }
            );
          });
        },
        (error) => {
          console.error('Transaction error:', error);
          reject(new Error(`Transaction failed: ${error}`));
        },
        () => {
          console.log('Transaction completed');
          resolve();
        }
      );
    });
  } catch (error) {
    console.error('Error saving MCQs:', error);
    throw new Error(`Failed to save MCQs: ${error}`);
  }
};

export const fetchMCQs = async (limit: number = 100): Promise<MCQ[]> => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  try {
    return await new Promise<MCQ[]>((resolve, reject) => {
      db!.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM mcqs LIMIT ?;',
          [limit],
          (_, result) => {
            const mcqs: MCQ[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              mcqs.push({
                id: row.id,
                question: row.question,
                options: JSON.parse(row.options),
                answer: row.answer,
              });
            }
            resolve(mcqs);
          },
          (error) => {
            console.error('Error fetching MCQs:', error);
            reject(new Error(`Failed to fetch MCQs: ${error}`));
            return false;
          }
        );
      });
    });
  } catch (error) {
    console.error('Error in fetchMCQs:', error);
    throw new Error(`Failed to fetch MCQs: ${error}`);
  }
};

export const uploadMCQsToFirebase = async (mcqs: MCQ[]): Promise<void> => {
  try {
    const batch = firestore().batch();
    mcqs.forEach((mcq) => {
      const ref = firestore().collection('mcqs').doc();
      batch.set(ref, { ...mcq, id: mcq.id ?? null });
    });
    await batch.commit();
    console.log('MCQs uploaded to Firebase');
  } catch (error) {
    console.error('Error uploading MCQs to Firebase:', error);
    throw new Error(`Failed to upload MCQs to Firebase: ${error}`);
  }
};

export const downloadMCQsFromFirebase = async (limit: number): Promise<MCQ[]> => {
  try {
    const snapshot = await firestore().collection('mcqs').limit(limit).get();
    const mcqs: MCQ[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id ?? undefined,
        question: data.question,
        options: data.options,
        answer: data.answer,
      };
    });
    return mcqs;
  } catch (error) {
    console.error('Error downloading MCQs from Firebase:', error);
    throw new Error(`Failed to download MCQs from Firebase: ${error}`);
  }
};

export const saveScoreToLeaderboard = async (username: string, score: number): Promise<void> => {
  try {
    await firestore().collection('leaderboard').add({
      username,
      score,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    console.log('Score saved to leaderboard');
  } catch (error) {
    console.error('Error saving score to leaderboard:', error);
    throw new Error(`Failed to save score to leaderboard: ${error}`);
  }
};

export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const snapshot = await firestore()
      .collection('leaderboard')
      .orderBy('score', 'desc')
      .limit(10)
      .get();
    const leaderboard: LeaderboardEntry[] = snapshot.docs.map((doc) => ({
      username: doc.data().username,
      score: doc.data().score,
    }));
    return leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw new Error(`Failed to fetch leaderboard: ${error}`);
  }
};

const usersRef = firestore().collection('users');
const quizzesRef = firestore().collection('quizzes');

export const initializeUser = async (userId: string, email: string, role: string): Promise<void> => {
  try {
    await usersRef.doc(userId).set({
      email,
      role,
      joinDate: firestore.FieldValue.serverTimestamp(),
      isPremium: false,
      isVanguard: false,
      vanguardTier: null,
      badge: null,
      progress: {
        quizzesCompleted: 0,
        totalTimeSpent: 0,
        dailyQuestionCount: 0,
        lastQuestionDate: null,
      },
      quizAnalytics: {
        timePerQuestion: [],
        accuracyByTopic: {},
      },
      groups: [],
    });
    console.log(`User initialized: ${userId}`);
  } catch (error) {
    console.error('Error initializing user:', error);
    throw new Error(`Failed to initialize user: ${error}`);
  }
};

const resetDailyQuestionCountIfNeeded = async (userId: string): Promise<void> => {
  const userRef = usersRef.doc(userId);
  const user = await userRef.get();
  const userData = user.data() as UserData | undefined;
  const lastQuestionDate = userData?.progress.lastQuestionDate?.toDate();
  const today = new Date();
  const isNewDay = !lastQuestionDate || lastQuestionDate.toDateString() !== today.toDateString();

  if (isNewDay) {
    await userRef.update({
      'progress.dailyQuestionCount': 0,
      'progress.lastQuestionDate': firestore.FieldValue.serverTimestamp(),
    });
  }
};

export const assignPatreonBadge = async (userId: string, isPremium: boolean): Promise<string | null> => {
  const userRef = usersRef.doc(userId);
  const user = await userRef.get();
  const joinDate = user.data()?.joinDate;

  if (!isPremium) {
    const freeUserCount = await usersRef.where('badge', '==', 'First Torchbearer').get();
    if (freeUserCount.size < 100) {
      await userRef.update({ badge: 'First Torchbearer' });
      return 'First Torchbearer';
    }
  } else {
    const premiumUserCount = await usersRef.where('isVanguard', '==', true).get();
    if (premiumUserCount.size < 300) {
      const tier = premiumUserCount.size < 50 ? 'Prime' : premiumUserCount.size < 150 ? 'Ancient' : 'New';
      await userRef.update({ isVanguard: true, vanguardTier: tier, badge: `Vanguard of Wisdom (${tier})` });
      return `Vanguard of Wisdom (${tier})`;
    }
  }
  return null;
};

export const updateQuizAnalytics = async (
  userId: string,
  quizId: string,
  timePerQuestion: { questionId: string; time: number }[],
  accuracyByTopic: { [key: string]: number }
): Promise<void> => {
  const userRef = usersRef.doc(userId);
  await userRef.update({
    'quizAnalytics.timePerQuestion': firestore.FieldValue.arrayUnion(...timePerQuestion),
    'quizAnalytics.accuracyByTopic': accuracyByTopic,
    'progress.quizzesCompleted': firestore.FieldValue.increment(1),
  });
};

export const canAnswerQuestion = async (userId: string, isPremium: boolean): Promise<boolean> => {
  if (isPremium) return true;

  await resetDailyQuestionCountIfNeeded(userId);
  const userRef = usersRef.doc(userId);
  const user = await userRef.get();
  const userData = user.data() as UserData | undefined;
  const dailyQuestionCount = userData?.progress.dailyQuestionCount ?? 0;

  return dailyQuestionCount < 100;
};

export const incrementDailyQuestionCount = async (userId: string): Promise<void> => {
  const userRef = usersRef.doc(userId);
  await userRef.update({
    'progress.dailyQuestionCount': firestore.FieldValue.increment(1),
    'progress.lastQuestionDate': firestore.FieldValue.serverTimestamp(),
  });
};

export const getQuizQuestions = async (userId: string, topic: string, isPremium: boolean): Promise<QuizQuestion[]> => {
  const canAnswer = await canAnswerQuestion(userId, isPremium);
  if (!canAnswer) {
    throw new Error('You have reached your daily limit of 100 questions. Upgrade to premium for unlimited access!');
  }

  const query = quizzesRef.where('topic', '==', topic);
  const snapshot = await query.get();
  let questions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as QuizQuestion[];

  const user = await getUserData(userId);
  if (isPremium && (user?.quizAnalytics.accuracyByTopic[topic] ?? 0) > 80) {
    questions = questions.filter((q) => q.difficulty === 'hard');
  } else {
    questions = questions.filter((q) => q.difficulty === 'medium');
  }

  return questions;
};

export const getUserData = async (userId: string): Promise<UserData | null> => {
  const user = await usersRef.doc(userId).get();
  return user.exists ? (user.data() as UserData) : null;
};