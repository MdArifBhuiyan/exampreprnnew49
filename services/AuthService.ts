// C:\Projects\ExamPrepRNNew\services\AuthService.ts
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const signUp = async (email: string, password: string): Promise<{ success: boolean; user?: FirebaseAuthTypes.User; error?: string }> => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    await userCredential.user.sendEmailVerification();
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signIn = async (email: string, password: string): Promise<{ success: boolean; user?: FirebaseAuthTypes.User; error?: string }> => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    if (!userCredential.user.emailVerified) {
      throw new Error('Please verify your email before signing in.');
    }
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await auth().sendPasswordResetEmail(email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await auth().signOut();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};