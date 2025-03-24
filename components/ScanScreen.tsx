import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera';

const ScanScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    Alert.alert('Scanned Data', `Data: ${data}`);
  };

  if (hasPermission === null) {
    return <Text style={styles.permissionText}>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text style={styles.permissionText}>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan</Text>
      <Camera
        style={styles.camera}
        type={CameraType.back}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {scanned && (
        <TouchableOpacity
          onPress={() => setScanned(false)}
          style={styles.scanAgainButton}
        >
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  scanAgainButton: {
    padding: 10,
    backgroundColor: '#00f',
    marginTop: 10,
    alignItems: 'center',
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ScanScreen;