
  import React, { useState, useEffect, useCallback } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    
  } from 'react-native';
  import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
  import * as ImageManipulator from 'expo-image-manipulator';
  import * as MediaLibrary from 'expo-media-library';
  import { Ionicons } from '@expo/vector-icons';
  import Slider from '@react-native-community/slider';
   import { useTheme } from '../../src/context/ThemeContext';

  interface EditingOptions {
    rotate: number;
    flip: boolean;
    brightness: number;
    contrast: number;
    crop: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null;
  }

  export default function EditScreen() {
    const { isDark } = useTheme();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [editedImageUri, setEditedImageUri] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [options, setOptions] = useState<EditingOptions>({
      rotate: 0,
      flip: false,
      brightness: 0,
      contrast: 0,
      crop: null
    });

    const router = useRouter();
    const params = useLocalSearchParams<{ uri?: string }>();

    useEffect(() => {
      if (params.uri) {
        setImageUri(params.uri);
      } else {
        Alert.alert('Error', 'No image to edit', [
          { text: 'Go Back', onPress: () => router.back() }
        ]);
      }
    }, [params.uri, router]);

    // Apply current edits to preview
     // Apply current edits to preview - wrapped in useCallback
    const applyEdits = useCallback(async () => {
      if (!imageUri) return;

      setIsProcessing(true);

      try {
        const actions: ImageManipulator.Action[] = [];

        // Add rotation if needed
        if (options.rotate !== 0) {
          actions.push({ rotate: options.rotate });
        }

        // Add flip if enabled
        if (options.flip) {
          actions.push({ flip: ImageManipulator.FlipType.Horizontal });
        }

        // Add crop if specified
        if (options.crop) {
          actions.push({
            crop: {
              originX: options.crop.x,
              originY: options.crop.y,
              width: options.crop.width,
              height: options.crop.height
            }
          });
        }

        // Apply the edits
        const result = await ImageManipulator.manipulateAsync(
          imageUri,
          actions,
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        setEditedImageUri(result.uri);
      } catch (error) {
        console.error('Error applying edits:', error);
        Alert.alert('Error', 'Failed to apply image edits');
      } finally {
        setIsProcessing(false);
      }
    }, [imageUri, options]); // Add dependencies here


    // Rotate image by 90 degrees
    const rotateImage = () => {
      setOptions(prev => {
        const newRotate = (prev.rotate + 90) % 360;
        return { ...prev, rotate: newRotate };
      });
    };

    // Flip image horizontally
    const flipImage = () => {
      setOptions(prev => ({ ...prev, flip: !prev.flip }));
    };

    // Save edited image to device
    const saveToDevice = async () => {
      if (!editedImageUri) {
        // If no edited image yet, apply edits first
        await applyEdits();
        if (!editedImageUri) return;
      }

      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need permission to save to your photo library');
          return;
        }

        await MediaLibrary.saveToLibraryAsync(editedImageUri);
        Alert.alert('Success', 'Image saved to your photo library');
      } catch (error) {
        console.error('Error saving to device:', error);
        Alert.alert('Error', 'Failed to save image to device');
      }
    };

    // Use edited image
    const useEditedImage = () => {
      if (!editedImageUri) {
        // If no edited image yet, apply edits first
        applyEdits().then(() => {
          if (editedImageUri) {
            router.navigate({
              pathname: '/(tabs)/upload',
              params: { imageUri: editedImageUri }
            });
          }
        });
      } else {
        router.navigate({
          pathname: '/(tabs)/upload',
          params: { imageUri: editedImageUri }
        });
      }
    };

  // Effect to apply edits when options change
    useEffect(() => {
      if (imageUri) {
        applyEdits();
      }
    }, [applyEdits, imageUri, options]); 

    if (!imageUri) {
      return (
        <View style={styles.container}>
          <Stack.Screen options={{ title: 'Edit Image' }} />
          <Text>No image to edit</Text>
        </View>
      );
    }

    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Stack.Screen options={{ title: 'Edit Image' }} />

        <ScrollView style={styles.scrollView}>
          <View style={[styles.imageContainer, isDark && styles.imageContainerDark]}>
            {isProcessing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDark ? "#ffffff" : "#007bff"} />
                <Text style={[styles.loadingText, isDark && { color: '#aaa' }]}>Processing image...</Text>
              </View>
            ) : (
              <Image
                source={{ uri: editedImageUri || imageUri }}
                style={styles.image}
                resizeMode="contain"
              />
            )}
          </View>

          <View style={styles.editControls}>
            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.editButton} onPress={rotateImage}>
                <Ionicons name="refresh" size={24} color="white" />
                <Text style={styles.editButtonText}>Rotate</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.editButton} onPress={flipImage}>
                <Ionicons name="swap-horizontal" size={24} color="white" />
                <Text style={styles.editButtonText}>Flip</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sliderContainer}>
              <Text style={[styles.sliderLabel, isDark && styles.textLight]}>
                Rotation: {options.rotate}°
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={359}
                step={90}
                value={options.rotate}
                onValueChange={(value) => setOptions(prev => ({ ...prev, rotate: value }))}
                minimumTrackTintColor={isDark ? "#0a84ff" : "#007bff"}
                maximumTrackTintColor={isDark ? "#555" : "#ccc"}
                thumbTintColor={isDark ? "#ffffff" : undefined}
              />
            </View>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, isDark && styles.bottomBarDark]}>
          <TouchableOpacity style={[styles.bottomButton, isDark && styles.bottomButtonDark]} onPress={() =>
  router.back()}>
            <Ionicons name="close" size={24} color="white" />
            <Text style={styles.bottomButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.bottomButton, isDark && styles.bottomButtonDark]}
  onPress={saveToDevice}>
            <Ionicons name="download" size={24} color="white" />
            <Text style={styles.bottomButtonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.bottomButton, styles.useButton]} onPress={useEditedImage}>
            <Ionicons name="checkmark" size={24} color="white" />
            <Text style={styles.bottomButtonText}>Use</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    containerDark: {
      backgroundColor: '#121212',
    },
    textLight: {
        color: '#fff',
    },
    scrollView: {
      flex: 1,
    },
    imageContainer: {
      height: 350,
      margin: 20,
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      overflow: 'hidden',
    },
      imageContainerDark: {
      borderColor: '#444',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 10,
      color: 'white',
    },
    editControls: {
      padding: 20,
    },
    controlsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    editButton: {
      backgroundColor: '#007bff',
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: 120,
    },
    editButtonText: {
      color: 'white',
      fontWeight: 'bold',
      marginLeft: 8,
    },
    sliderContainer: {
      marginVertical: 10,
    },
    sliderLabel: {
      fontSize: 16,
      marginBottom: 5,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    bottomBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#333',
      padding: 15,
    },
    bottomBarDark: {
      backgroundColor: '#1a1a1a',
    },
    bottomButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 5,
      backgroundColor: '#555',
      flex: 1,
      marginHorizontal: 5,
    },
     bottomButtonDark: {
      backgroundColor: '#2a2a2a',
    },
    bottomButtonText: {
      color: 'white',
      fontWeight: 'bold',
      marginLeft: 5,
    },
    useButton: {
      backgroundColor: '#28a745',
    },
  });