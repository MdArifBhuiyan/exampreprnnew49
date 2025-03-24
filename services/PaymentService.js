// C:\Projects\ExamPrepRNNew\services\PaymentService.ts
import { Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { assignPatreonBadge } from './DatabaseService';

const usersRef = firestore().collection('users');

// Simulate payment with bKash, Rocket, or Nagad
export const createCheckoutSession = async (userId, plan, paymentMethod) => {
  try {
    const price = plan === 'premium' ? 150 : 50; // ৳150 for premium, ৳50 for quiz pack
    Alert.alert(
      'Payment Successful',
      `You have purchased the ${plan} plan for ৳${price} using ${paymentMethod}!`
    );
    return { success: true, plan };
  } catch (error) {
    Alert.alert('Payment Failed', error.message);
    return { success: false, error: error.message };
  }
};

// Update user to premium after payment
export const updateUserToPremium = async (userId) => {
  const userRef = usersRef.doc(userId);
  await userRef.update({ isPremium: true });
  const badge = await assignPatreonBadge(userId, true);
  return badge;
};