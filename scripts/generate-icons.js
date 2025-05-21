// This script uses expo-file-system to save a base64 image representation
// After building the app, you would run this script to generate the icon files

import React from 'react';
import { View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import ViewShot from 'react-native-view-shot';
import { createTextIcon } from '../components/TextIcon';

// Sizes for different icon requirements
const ICON_SIZES = {
  appIcon: 1024,
  adaptiveIcon: 1024,
  favicon: 192,
  splashIcon: 200,
};

// Function to generate the icon
async function generateIcon(size, options = {}) {
  const viewShotRef = React.createRef();
  
  // Create the component to capture
  const IconComponent = () => {
    return (
      <View ref={viewShotRef} style={{ width: size, height: size }}>
        {createTextIcon('PFC', size, options)}
      </View>
    );
  };
  
  try {
    // Capture the icon as a base64 string
    const uri = await viewShotRef.current.capture();
    return uri;
  } catch (e) {
    console.error('Failed to generate icon:', e);
    return null;
  }
}

// Generate and save icons
async function generateAndSaveIcons() {
  // App icon with blue gradient
  const appIconUri = await generateIcon(ICON_SIZES.appIcon, {
    backgroundColor: ['#4c669f', '#3b5998', '#192f6a'],
  });
  
  // Adaptive icon with a different color (for Android)
  const adaptiveIconUri = await generateIcon(ICON_SIZES.adaptiveIcon, {
    backgroundColor: ['#3498db', '#2980b9', '#1f6da3'],
  });
  
  // Favicon
  const faviconUri = await generateIcon(ICON_SIZES.favicon, {
    backgroundColor: ['#4c669f', '#3b5998', '#192f6a'],
  });
  
  // Splash icon
  const splashIconUri = await generateIcon(ICON_SIZES.splashIcon, {
    backgroundColor: ['#4c669f', '#3b5998', '#192f6a'],
  });
  
  // Save the files
  await FileSystem.writeAsStringAsync(
    `${FileSystem.documentDirectory}icon.png`,
    appIconUri.split(',')[1],
    { encoding: FileSystem.EncodingType.Base64 }
  );
  
  await FileSystem.writeAsStringAsync(
    `${FileSystem.documentDirectory}adaptive-icon.png`,
    adaptiveIconUri.split(',')[1],
    { encoding: FileSystem.EncodingType.Base64 }
  );
  
  await FileSystem.writeAsStringAsync(
    `${FileSystem.documentDirectory}favicon.png`,
    faviconUri.split(',')[1],
    { encoding: FileSystem.EncodingType.Base64 }
  );
  
  await FileSystem.writeAsStringAsync(
    `${FileSystem.documentDirectory}splash-icon.png`,
    splashIconUri.split(',')[1],
    { encoding: FileSystem.EncodingType.Base64 }
  );
  
  console.log('Icons generated and saved to:', FileSystem.documentDirectory);
}

// Run the function
generateAndSaveIcons().catch(console.error);