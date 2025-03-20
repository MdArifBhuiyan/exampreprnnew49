import { initializeApp } from '@react-native-firebase/app';


// Fallback type definition since FirebaseOptions is not exported
interface FirebaseOptions {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.API_KEY ?? '',
  authDomain: process.env.AUTH_DOMAIN ?? '',
  projectId: process.env.PROJECT_ID ?? '',
  storageBucket: process.env.STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.MESSAGING_SENDER_ID ?? '',
  appId: process.env.APP_ID ?? '',
};

if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
  console.warn('Firebase configuration is incomplete. Check .env file and restart the app.');
  if (process.env.NODE_ENV === 'development') {
    throw new Error('Missing Firebase config in .env');
  }
}

const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;