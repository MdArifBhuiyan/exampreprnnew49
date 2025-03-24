import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const UploadScreen = () => {
  const [scannedText, setScannedText] = useState('');

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setScannedText('Processing your image...');
        // Add your image processing logic here
      }
    } catch (error) {
      console.error('Error during image upload:', error);
      setScannedText('Sorry, I couldn’t process the image. Please try again.');
    }
  };

  const handlePDFUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.assets && result.assets.length > 0) { // Fix: Check for assets
        setScannedText('Processing your PDF...');
        // Add your PDF processing logic here
      }
    } catch (error) {
      console.error('Error during PDF upload:', error);
      setScannedText('Sorry, I couldn’t process the PDF. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Question</Text>
      <TouchableOpacity onPress={handleImageUpload} style={styles.button}>
        <Text style={styles.buttonText}>Upload Image</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePDFUpload} style={styles.button}>
        <Text style={styles.buttonText}>Upload PDF</Text>
      </TouchableOpacity>
      {scannedText ? (
        <Text style={styles.scannedText}>{scannedText}</Text>
      ) : (
        <Text style={styles.placeholderText}>No content uploaded yet.</Text>
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
  title: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#333',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  scannedText: {
    color: '#fff',
    marginTop: 10,
  },
  placeholderText: {
    color: '#fff',
    marginTop: 10,
  },
});

export default UploadScreen;