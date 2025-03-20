import SQLite from 'react-native-sqlite-storage';
import firestore from '@react-native-firebase/firestore';

// Open the database
const db = SQLite.openDatabase({ name: 'mcqs.db', location: 'default' });

// Initialize the database
const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS mcqs (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, options TEXT, answer TEXT);',
      [],
      () => console.log('Database initialized'),
      (error) => console.error('Error initializing database:', error)
    );
  });
};

// Save MCQs to the database
const saveMCQs = (mcqs) => {
  db.transaction((tx) => {
    mcqs.forEach((mcq) => {
      tx.executeSql(
        'INSERT INTO mcqs (question, options, answer) VALUES (?, ?, ?);',
        [mcq.question, JSON.stringify(mcq.options), mcq.answer],
        () => console.log('MCQ saved'),
        (error) => console.error('Error saving MCQ:', error)
      );
    });
  });
};

// Fetch MCQs from the database
const fetchMCQs = async (limit = 100) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM mcqs LIMIT ?;',
        [limit],
        (_, result) => {
          const mcqs = result.rows.raw().map((row) => ({
            id: row.id,
            question: row.question,
            options: JSON.parse(row.options),
            answer: row.answer,
          }));
          resolve(mcqs);
        },
        (error) => {
          console.error('Error fetching MCQs:', error);
          reject(error);
        }
      );
    });
  });
};

// Upload MCQs to Firebase
const uploadMCQsToFirebase = async (mcqs) => {
  try {
    const batch = firestore().batch();
    mcqs.forEach((mcq) => {
      const ref = firestore().collection('mcqs').doc();
      batch.set(ref, mcq);
    });
    await batch.commit();
    console.log('MCQs uploaded to Firebase');
  } catch (error) {
    console.error('Error uploading MCQs:', error);
  }
};

// Download MCQs from Firebase
const downloadMCQsFromFirebase = async (limit) => {
  try {
    const snapshot = await firestore().collection('mcqs').limit(limit).get();
    const mcqs = snapshot.docs.map((doc) => doc.data());
    return mcqs;
  } catch (error) {
    console.error('Error downloading MCQs:', error);
    throw error;
  }
};

// Save score to leaderboard
const saveScoreToLeaderboard = async (username, score) => {
  try {
    await firestore().collection('leaderboard').add({
      username,
      score,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    console.log('Score saved to leaderboard');
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

// Fetch leaderboard
const fetchLeaderboard = async () => {
  try {
    const snapshot = await firestore()
      .collection('leaderboard')
      .orderBy('score', 'desc')
      .limit(10)
      .get();
    const leaderboard = snapshot.docs.map((doc) => ({
      username: doc.data().username,
      score: doc.data().score,
    }));
    return leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

export {
  initDatabase,
  saveMCQs,
  fetchMCQs,
  uploadMCQsToFirebase,
  downloadMCQsFromFirebase,
  saveScoreToLeaderboard,
  fetchLeaderboard,
};