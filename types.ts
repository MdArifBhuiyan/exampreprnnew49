import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Summarize: undefined;
  Chat: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type SummarizeScreenProps = NativeStackScreenProps<RootStackParamList, 'Summarize'>;
export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;
