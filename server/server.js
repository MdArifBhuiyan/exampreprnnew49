const express = require('express');
const axios = require('axios');
const admin = require('firebase-admin');
const { fetchStudyResources, solveEquation, collectStudentQuestion, collectAdmissionTestQuestions } = require('./acadBuddyService');

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// bKash API credentials (replace with your actual credentials)
const bkashConfig = {
  baseURL: 'https://checkout.sandbox.bkash.com/v1.2.0-beta', // Sandbox URL
  appKey: 'your_bkash_app_key',
  appSecret: 'your_bkash_app_secret',
  username: 'your_bkash_username',
  password: 'your_bkash_password',
};

// Rocket API credentials (replace with your actual credentials)
const rocketConfig = {
  baseURL: 'https://api.rocket.com/v1', // Replace with actual Rocket API URL
  apiKey: 'your_rocket_api_key',
};

// bKash: Create Payment
app.post('/bkash/create-payment', async (req, res) => {
  try {
    const { amount, userId } = req.body;

    const response = await axios.post(
      `${bkashConfig.baseURL}/checkout/payment/create`,
      {
        amount,
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: `INV${Date.now()}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${bkashConfig.username}:${bkashConfig.password}`).toString('base64')}`,
          'X-APP-Key': bkashConfig.appKey,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rocket: Create Payment (mocked, as Rocket API details may vary)
app.post('/rocket/create-payment', async (req, res) => {
  try {
    const { amount, userId } = req.body;

    const response = await axios.post(
      `${rocketConfig.baseURL}/payment/create`,
      {
        amount,
        currency: 'BDT',
        userId,
      },
      {
        headers: {
          'Authorization': `Bearer ${rocketConfig.apiKey}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AcadBuddy Endpoints
app.post('/fetch-study-resources', async (req, res) => {
  const { subject, language } = req.body;
  if (!subject) {
    return res.status(400).json({ error: 'Subject is required' });
  }
  const result = await fetchStudyResources(subject, language);
  res.json(result);
});

app.post('/solve-equation', async (req, res) => {
  const { equation } = req.body;
  if (!equation) {
    return res.status(400).json({ error: 'Equation is required' });
  }
  const result = await solveEquation(equation);
  res.json(result);
});

app.post('/collect-student-question', async (req, res) => {
  const { studentId, question } = req.body;
  if (!studentId || !question) {
    return res.status(400).json({ error: 'studentId and question are required' });
  }
  const docId = await collectStudentQuestion(studentId, question);
  res.json({ docId });
});

app.post('/collect-admission-test-questions', async (req, res) => {
  const success = await collectAdmissionTestQuestions();
  res.json({ success });
});

// New Endpoint for General Question Answering
app.post('/answer-question', async (req, res) => {
  const { question, language } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `You are AcadBuddy, a digital mentor for students. Answer the question in ${language === 'bn' ? 'Bangla' : 'English'}.` },
          { role: 'user', content: question },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer your-openai-api-key`, // Replace with your OpenAI API key
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ answer: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check for upcoming reminders and send FCM notifications
const checkReminders = async () => {
  try {
    const now = new Date();
    const usersSnapshot = await db.collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (!userData.fcmToken) continue;

      const remindersSnapshot = await db
        .collection('users')
        .doc(userDoc.id)
        .collection('reminders')
        .where('time', '<=', now.toISOString())
        .get();

      for (const reminderDoc of remindersSnapshot.docs) {
        const reminder = reminderDoc.data();

        // Send FCM notification
        const message = {
          notification: {
            title: 'Study Reminder',
            body: 'Time to study! Keep up the good work!',
          },
          token: userData.fcmToken,
        };

        await admin.messaging().send(message);
        console.log(`Notification sent to user ${userDoc.id} for reminder ${reminderDoc.id}`);

        // Delete the reminder after sending
        await reminderDoc.ref.delete();
      }
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
};

// Run every minute
setInterval(checkReminders, 60 * 1000);

// Start the server
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});