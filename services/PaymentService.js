import { Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { assignPatreonBadge } from './DatabaseService';

const usersRef = firestore().collection('users');
const transactionsRef = firestore().collection('transactions');

// Simulate payment with bKash, Rocket, or Nagad
export const createCheckoutSession = async (userId, plan, paymentMethod, currency = 'BDT') => {
  try {
    const priceBDT = plan === 'premium' ? 150 : 50; // ৳150 for premium, ৳50 for quiz pack
    const priceUSD = plan === 'premium' ? 1.5 : 0.5; // $1.5 for premium, $0.5 for quiz pack
    const price = currency === 'BDT' ? priceBDT : priceUSD;
    const currencySymbol = currency === 'BDT' ? '৳' : '$';

    // Simulate payment
    Alert.alert(
      'Payment Successful',
      `You have purchased the ${plan} plan for ${currencySymbol}${price} using ${paymentMethod}!`
    );

    // Log transaction to Firestore
    await transactionsRef.add({
      userId: userId,
      plan: plan,
      amount: price,
      currency: currency,
      paymentMethod: paymentMethod,
      timestamp: new Date().toISOString(),
    });

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

// Get transaction history for a user
export const getTransactionHistory = async (userId) => {
  try {
    const snapshot = await transactionsRef.where('userId', '==', userId).get();
    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    return transactions;
  } catch (e) {
    console.error('Error fetching transaction history: ', e);
    return [];
  }
};