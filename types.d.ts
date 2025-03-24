import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the parameter list for the bottom tab navigator
export type RootTabParamList = {
  Chat: undefined;
  Quiz: undefined;
  Groups: undefined;
  Upload: undefined;
  History: undefined;
  Profile: undefined;
  Payment: undefined;
  GroupChat: undefined;
  PersonalChat: undefined;
  Scan: undefined;
};

// Define the parameter list for the stack navigator
export type RootStackParamList = {
  SignUp: undefined;
  Login: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  Dashboard: undefined;
};

// Define navigation props for each screen
export type ChatScreenProps = {
  navigation: StackNavigationProp<RootTabParamList, 'Chat'>;
  route: RouteProp<RootTabParamList, 'Chat'>;
};

// Define navigation props for each screen
export interface QuizScreenProps {
  navigation: StackNavigationProp<RootTabParamList, 'Quiz'>; // Correct type for navigation
  route: RouteProp<RootTabParamList, 'Quiz'>; // Add route prop if needed
}

export type GroupsScreenProps = {
  navigation: StackNavigationProp<RootTabParamList, 'Groups'>;
  route: RouteProp<RootTabParamList, 'Groups'>;
};

export type UploadScreenProps = {
  navigation: StackNavigationProp<RootTabParamList, 'Upload'>;
  route: RouteProp<RootTabParamList, 'Upload'>;
};

export type HistoryScreenProps = {
  navigation: StackNavigationProp<RootTabParamList, 'History'>;
  route: RouteProp<RootTabParamList, 'History'>;
};

export type ProfileScreenProps = {
  navigation: StackNavigationProp<RootTabParamList, 'Profile'>;
  route: RouteProp<RootTabParamList, 'Profile'>;
};

export type PaymentScreenProps = {
  navigation: StackNavigationProp<RootTabParamList, 'Payment'>;
  route: RouteProp<RootTabParamList, 'Payment'>;
};

export type GroupChatScreenProps = {
  navigation: StackNavigationProp<RootTabParamList, 'GroupChat'>;
  route: RouteProp<RootTabParamList, 'GroupChat'>;
};

export type PersonalChatScreenProps = {
  navigation: StackNavigationProp<RootTabParamList, 'PersonalChat'>;
  route: RouteProp<RootTabParamList, 'PersonalChat'>;
};

export type ScanScreenProps = {
  navigation: StackNavigationProp<RootTabParamList, 'Scan'>;
  route: RouteProp<RootTabParamList, 'Scan'>;
};

export type SignUpScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'SignUp'>;
  route: RouteProp<RootStackParamList, 'SignUp'>;
};

export type LoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
  route: RouteProp<RootStackParamList, 'Login'>;
};

export type OnboardingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Onboarding'>;
  route: RouteProp<RootStackParamList, 'Onboarding'>;
};

export type MainTabsProps = {
  navigation: StackNavigationProp<RootStackParamList, 'MainTabs'>;
  route: RouteProp<RootStackParamList, 'MainTabs'>;
};

export type DashboardScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Dashboard'>;
  route: RouteProp<RootStackParamList, 'Dashboard'>;
};