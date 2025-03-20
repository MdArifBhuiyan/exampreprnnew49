import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Define the param list for the Tab Navigator
export type RootTabParamList = {
  Login: undefined;
  Chat: undefined;
  Quiz: { newQuestion?: string };
  Summarize: undefined;
  Groups: undefined;
  Upload: undefined;
  History: undefined;
  Profile: undefined;
};

// Update SummarizeScreenProps to use BottomTabScreenProps
export type SummarizeScreenProps = BottomTabScreenProps<RootTabParamList, 'Summarize'>;