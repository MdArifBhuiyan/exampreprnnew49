// types.ts
import { RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'; // Use BottomTabNavigationProp

export type RootTabParamList = {
  Login: undefined;
  Chat: undefined;
  Quiz: { newQuestion?: string };
  Summarize: undefined;
  Groups: undefined;
  Upload: undefined;
  History: undefined;
  Profile: undefined;
  Payment: undefined;
  GroupChat: undefined;
  PersonalChat: undefined;
  Scan: undefined;
};

// Define QuizScreenProps
export type QuizScreenProps = {
  navigation: BottomTabNavigationProp<RootTabParamList, 'Quiz'>;
  route: RouteProp<RootTabParamList, 'Quiz'>;
};

// Define SummarizeScreenProps
export type SummarizeScreenProps = {
  navigation: BottomTabNavigationProp<RootTabParamList, 'Summarize'>;
};