// C:\Projects\ExamPrepRNNew\types.ts
export type RootTabParamList = {
  Chat: undefined;
  Quiz: { newQuestion?: string };
  Groups: undefined;
  Upload: undefined;
  History: undefined;
  Profile: undefined;
  Payment: undefined;
  GroupChat: undefined;
  PersonalChat: undefined;
  Scan: undefined;
  StudentDashboard: { userId: string };
};

export type RootStackParamList = {
  SignUp: undefined;
  Login: undefined;
  Onboarding: { role: string }; // Updated to allow role parameter
  MainTabs: undefined;
  Dashboard: { userId: string };
};