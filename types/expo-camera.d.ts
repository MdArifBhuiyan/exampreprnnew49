declare module 'expo-camera' {
    import { Component } from 'react';
    import { ViewStyle } from 'react-native';
  
    export type CameraType = 'front' | 'back';
  
    export interface CameraProps {
      style?: ViewStyle;
      type?: CameraType | string;
      onBarCodeScanned?: (data: { type: string; data: string }) => void;
    }
  
    export class Camera extends Component<CameraProps> {
      static requestCameraPermissionsAsync(): Promise<{ status: string }>;
    }
  
    export const CameraType: {
      back: CameraType;
      front: CameraType;
    };
  }