
// //  
// import React, { useState, useEffect,useCallback } from 'react';
//   import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     FlatList,
//     Image,
//     Alert,
//     ActivityIndicator
//   } from 'react-native';
//   import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
//   import * as ImagePicker from 'expo-image-picker';
//   import axios from 'axios';
//   import NetworkService from '../../src/services/NetworkService';
//   // import * as FileSystem from 'expo-file-system';
//   // import * as Crypto from 'expo-crypto';
  

//   interface ImageInfo {
//     uri: string;
//     name: string;
//     type: string;
//     id: string;
//     hash?: string; // MD5 hash for duplicate detection
//     isUploading?: boolean;
//     uploadProgress?: number;
//     uploadError?: string;
//     isUploaded?: boolean;
//   }

//   interface ServerInfo {
//     ip: string;
//     port: number;
//   }

//   interface ServerImage {
//     id: string;
//     name: string;
//     url: string;
//     fullUrl?: string;
//     path?: string;
//   }

//   export default function UploadScreen() {
//     const [selectedImages, setSelectedImages] = useState<ImageInfo[]>([]);
//     const [uploading, setUploading] = useState(false);
//     const [serverInfo] = useState<ServerInfo | null>(NetworkService.connectedServer);
//     const [serverImages, setServerImages] = useState<ServerImage[]>([]);
//     // const [ setLoadingServerImages] = useState(false);
//     const router = useRouter();
//     const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();

//     useEffect(() => {
//       // Check connection status
//       if (!NetworkService.connectedServer) {
//         Alert.alert(
//           "Not Connected",
//           "You need to connect to a PictureFrame server first.",
//           [{ text: "Go to Discovery", onPress: () => router.navigate('/discover') }]
//         );
//       } else {
//         // Fetch existing images from the server for duplicate detection
//         fetchServerImages();
//       }
//     }, [router]);

//     // Process camera photo if passed as param
//     // useEffect(() => {
//     //   if (imageUri) {
//     //     processNewImage(imageUri);
//     //   }
//     // }, [imageUri, serverImages,processNewImage]);

//     // Fetch existing images from the server
//     const fetchServerImages = async () => {
//       if (!NetworkService.connectedServer) return;

//       // setLoadingServerImages(true);
//       const { ip, port } = NetworkService.connectedServer;

//       try {
//         const response = await axios.get<ServerImage[]>(`http://${ip}:${port}/api/images`);
//         setServerImages(response.data || []);
//       } catch (error) {
//         console.error('Failed to fetch server images:', error);
//       } finally {
//         // setLoadingServerImages(false);
//       }
//     };

    
//     const processNewImage = useCallback(async (uri: string) => {
//     try {
//       // Create the new image object without hash
//       const fileName = uri.split('/').pop() || `image-${Date.now()}.jpg`;

//       const newImage: ImageInfo = {
//         uri: uri,
//         name: fileName,
//         type: `image/${(uri.split('.').pop() || 'jpeg').toLowerCase()}`,
//         id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
//       };

//       // Check if a similar image might already exist on the server by name only
//       if (serverImages.some(img => img.name.toLowerCase() === fileName.toLowerCase())) {
//         Alert.alert(
//           'Possible Duplicate',
//           `An image with the name "${fileName}" may already exist on the server. Upload anyway?`,
//           [
//             { text: 'Cancel', style: 'cancel' },
//             { text: 'Upload Anyway', onPress: () => setSelectedImages(prev => [...prev, newImage]) }
//           ]
//         );
//       } else {
//         setSelectedImages(prev => [...prev, newImage]);
//       }
//     } catch (error) {
//       console.error('Error processing image:', error);
//     }
//   }, [serverImages]);

//     useEffect(() => {
//       if (imageUri) {
//         processNewImage(imageUri);
//       }
//     }, [imageUri, serverImages,processNewImage]);

//     // Request permission to access media library
//     const requestPermissions = async () => {
//       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission Denied', 'We need permission to access your photos');
//         return false;
//       }
//       return true;
//     };

//     // Take a photo using the device camera
//     const takePhoto = async () => {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();

//       if (status !== 'granted') {
//         Alert.alert('Permission Denied', 'We need camera permission to take photos');
//         return;
//       }

//       try {
//         const result = await ImagePicker.launchCameraAsync({
//           mediaTypes: "images",
//           allowsEditing: true,
//           aspect: [4, 3],
//           quality: 0.8,
//         });

//         if (!result.canceled && result.assets && result.assets.length > 0) {
//           // Process images one by one to check for duplicates
//           for (const asset of result.assets) {
//             await processNewImage(asset.uri);
//           }
//         }
//       } catch (error) {
//         console.error('Error taking photo:', error);
//         Alert.alert('Error', 'Failed to take photo');
//       }
//     };

//     // Pick images from gallery
//     const pickImages = async () => {
//       const hasPermission = await requestPermissions();
//       if (!hasPermission) return;

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: "images",
//         allowsMultipleSelection: true,
//         quality: 0.8,
//         selectionLimit: 10,
//       });

//       if (!result.canceled && result.assets.length > 0) {
//         // Process images one by one to check for duplicates
//         for (const asset of result.assets) {
//           await processNewImage(asset.uri);
//         }
//       }
//     };

//     // Upload a single image
//     const uploadImage = async (image: ImageInfo) => {
//       if (!NetworkService.connectedServer) {
//         return {
//           ...image,
//           uploadError: 'Not connected to server',
//           isUploading: false
//         };
//       }

//       const { ip, port } = NetworkService.connectedServer;
//       const uploadUrl = `http://${ip}:${port}/api/upload`;

//       try {
//         // Create form data
//         const formData = new FormData();
//         formData.append('image', {
//           uri: image.uri,
//           type: image.type,
//           name: image.name,
//         } as any); // Type assertion to work around React Native FormData types

//         // Upload with axios
//         const response = await axios.post(uploadUrl, formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//           timeout: 30000, // 30 seconds
//         });

//         console.log('Upload success:', response.data);

//         return {
//           ...image,
//           isUploaded: true,
//           isUploading: false,
//         };
//       } catch (error) {
//         console.error('Upload error:', error);
//         return {
//           ...image,
//           uploadError: error instanceof Error ? error.message : 'Upload failed',
//           isUploading: false,
//         };
//       }
//     };

//     // Upload all selected images
//     const uploadSelectedImages = async () => {
//       if (selectedImages.length === 0) {
//         Alert.alert('No Images', 'Please select images to upload first');
//         return;
//       }

//       setUploading(true);

//       // Mark all as uploading
//       setSelectedImages(images =>
//         images.map(img => ({
//           ...img,
//           isUploading: true,
//           uploadProgress: 0,
//           uploadError: undefined,
//           isUploaded: false,
//         }))
//       );

//       // Upload images sequentially to avoid overwhelming the server
//       const results: ImageInfo[] = [];

//       for (const image of selectedImages) {
//         const result = await uploadImage(image);
//         results.push(result);

//         // Update the state after each upload
//         setSelectedImages(prevImages =>
//           prevImages.map(img => img.id === result.id ? result : img)
//         );
//       }

//       setUploading(false);

//       // Check if all uploads were successful
//       const allSuccessful = results.every(img => img.isUploaded);

//       if (allSuccessful) {
//         // Add a slight delay before clearing to give users a chance to see the success status
//         setTimeout(() => {
//           // Clear successfully uploaded images from the UI
//           setSelectedImages(prevImages => prevImages.filter(img => !img.isUploaded));

//           // Refresh server images list
//           fetchServerImages();

//           Alert.alert(
//             'Upload Complete',
//             'All images were successfully uploaded to your PictureFrame.',
//             [{ text: 'OK', onPress: () => router.navigate('/') }]
//           );
//         }, 1500);
//       } else {
//         // Some uploads failed
//         const failedCount = results.filter(img => img.uploadError).length;

//         // Only keep failed images in the UI
//         setSelectedImages(prevImages => prevImages.filter(img => !img.isUploaded));

//         Alert.alert(
//           'Upload Incomplete',
//           `${failedCount} of ${results.length} images failed to upload. You can retry the failed uploads.`
//         );

//         // Refresh server images list
//         fetchServerImages();
//       }
//     };

//     // Remove an image from the selection
//     const removeImage = (id: string) => {
//       setSelectedImages(images => images.filter(img => img.id !== id));
//     };

//     // Remove all successfully uploaded images
//     const clearUploaded = () => {
//       setSelectedImages(prevImages => prevImages.filter(img => !img.isUploaded));
//     };

//     // Render an image item
//     const renderImageItem = ({ item }: { item: ImageInfo }) => (
//       <View style={styles.imageItem}>
//         <Image source={{ uri: item.uri }} style={styles.thumbnail} />

//         <View style={styles.imageDetails}>
//           <Text style={styles.imageName} numberOfLines={1}>{item.name}</Text>

//           {item.isUploading && !item.isUploaded && !item.uploadError && (
//             <View style={styles.uploadingContainer}>
//               <Text>Uploading...</Text>
//               <ActivityIndicator size="small" color="#0000ff" />
//             </View>
//           )}

//           {item.isUploaded && (
//             <Text style={styles.successText}>Uploaded ✓</Text>
//           )}

//           {item.uploadError && (
//             <Text style={styles.errorText} numberOfLines={1}>Error: {item.uploadError}</Text>
//           )}
//         </View>

//         {!item.isUploading && !item.isUploaded && (
//           <TouchableOpacity
//             style={styles.removeButton}
//             onPress={() => removeImage(item.id)}
//           >
//             <Text style={styles.removeButtonText}>✕</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     );

//     // Count of successfully uploaded images
//     const uploadedCount = selectedImages.filter(img => img.isUploaded).length;

//     return (
//       <View style={styles.container}>
//         <Stack.Screen options={{ title: 'Upload Images' }} />

//         <Text style={styles.title}>Upload to PictureFrame</Text>

//         {serverInfo ? (
//           <Text style={styles.serverInfo}>
//             Connected to: {serverInfo?.ip}:{serverInfo?.port}
//           </Text>
//         ) : (
//           <Text style={styles.errorText}>Not connected to a server</Text>
//         )}

//         <View style={styles.buttonContainer}>
//           <TouchableOpacity
//             style={styles.selectButton}
//             onPress={pickImages}
//             disabled={uploading}
//           >
//             <Text style={styles.selectButtonText}>Select Images</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.selectButton, styles.cameraButton]}
//             onPress={takePhoto}
//             disabled={uploading}
//           >
//             <Text style={styles.selectButtonText}>Take Photo</Text>
//           </TouchableOpacity>
//         </View>

//         {selectedImages.length > 0 && (
//           <>
//             <View style={styles.imageStatusContainer}>
//               <Text style={styles.subtitle}>
//                 {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
//               </Text>

//               {uploadedCount > 0 && (
//                 <TouchableOpacity
//                   style={styles.clearButton}
//                   onPress={clearUploaded}
//                 >
//                   <Text style={styles.clearButtonText}>Clear Uploaded</Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             <FlatList
//               data={selectedImages}
//               renderItem={renderImageItem}
//               keyExtractor={(item) => item.id}
//               style={styles.imageList}
//             />

//             <TouchableOpacity
//               style={[
//                 styles.uploadButton,
//                 uploading ? styles.uploadButtonDisabled : null
//               ]}
//               onPress={uploadSelectedImages}
//               disabled={uploading}
//             >
//               <Text style={styles.uploadButtonText}>
//                 {uploading ? 'Uploading...' : 'Upload to PictureFrame'}
//               </Text>
//             </TouchableOpacity>
//           </>
//         )}
//       </View>
//     );
//   }

//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       padding: 20,
//       backgroundColor: '#f5f5f5',
//     },
//     title: {
//       fontSize: 24,
//       fontWeight: 'bold',
//       marginBottom: 10,
//       textAlign: 'center',
//     },
//     serverInfo: {
//       fontSize: 16,
//       textAlign: 'center',
//       marginBottom: 20,
//       color: '#555',
//     },
//     subtitle: {
//       fontSize: 18,
//       fontWeight: 'bold',
//       marginBottom: 10,
//     },
//     imageStatusContainer: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginTop: 20,
//     },
//     buttonContainer: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       marginTop: 20,
//     },
//     selectButton: {
//       backgroundColor: '#007bff',
//       padding: 15,
//       borderRadius: 5,
//       flex: 1,
//       alignItems: 'center',
//       marginRight: 5,
//     },
//     cameraButton: {
//       backgroundColor: '#6610f2',
//       marginLeft: 5,
//       marginRight: 0,
//     },
//     selectButtonText: {
//       color: 'white',
//       fontSize: 16,
//       fontWeight: 'bold',
//     },
//     clearButton: {
//       backgroundColor: '#6c757d',
//       paddingVertical: 5,
//       paddingHorizontal: 10,
//       borderRadius: 5,
//     },
//     clearButtonText: {
//       color: 'white',
//       fontSize: 12,
//     },
//     imageList: {
//       marginTop: 10,
//       flex: 1,
//     },
//     imageItem: {
//       flexDirection: 'row',
//       padding: 10,
//       borderWidth: 1,
//       borderColor: '#ddd',
//       borderRadius: 5,
//       marginBottom: 10,
//       backgroundColor: 'white',
//       alignItems: 'center',
//     },
//     thumbnail: {
//       width: 60,
//       height: 60,
//       borderRadius: 5,
//       marginRight: 10,
//     },
//     imageDetails: {
//       flex: 1,
//     },
//     imageName: {
//       fontSize: 16,
//       marginBottom: 5,
//     },
//     uploadingContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//     },
//     successText: {
//       color: 'green',
//     },
//     errorText: {
//       color: 'red',
//     },
//     removeButton: {
//       width: 30,
//       height: 30,
//       borderRadius: 15,
//       backgroundColor: '#ff6b6b',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     removeButtonText: {
//       color: 'white',
//       fontSize: 16,
//       fontWeight: 'bold',
//     },
//     uploadButton: {
//       backgroundColor: '#28a745',
//       padding: 15,
//       borderRadius: 5,
//       alignItems: 'center',
//       marginVertical: 20,
//     },
//     uploadButtonDisabled: {
//       backgroundColor: '#6c757d',
//     },
//     uploadButtonText: {
//       color: 'white',
//       fontSize: 16,
//       fontWeight: 'bold',
//     },
//   });
import React, { useState, useEffect, useCallback, useRef } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Alert,
    ActivityIndicator
  } from 'react-native';
  import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
  import * as ImagePicker from 'expo-image-picker';
  import axios from 'axios';
  import * as FileSystem from 'expo-file-system';
  import { Ionicons } from '@expo/vector-icons';
  import NetworkService from '../../src/services/NetworkService';
  import { useTheme } from '../../src/context/ThemeContext';

  interface ImageInfo {
    uri: string;
    name: string;
    type: string;
    id: string;
    size?: number; // File size for better duplicate detection
    isUploading?: boolean;
    uploadProgress?: number;
    uploadError?: string;
    isUploaded?: boolean;
  }

  interface ServerInfo {
    ip: string;
    port: number;
  }

  interface ServerImage {
    id: string;
    name: string;
    url: string;
    fullUrl?: string;
    path?: string;
  }

  export default function UploadScreen() {
    const { isDark } = useTheme();
    const [selectedImages, setSelectedImages] = useState<ImageInfo[]>([]);
    const [uploading, setUploading] = useState(false);
    const [serverInfo] = useState<ServerInfo | null>(NetworkService.connectedServer);
    const [serverImages, setServerImages] = useState<ServerImage[]>([]);
    const router = useRouter();
    const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
    const initialFetchDone = useRef(false);

    // Fetch existing images from server immediately when screen loads
    useEffect(() => {
      // Check connection status
      if (!NetworkService.connectedServer) {
        Alert.alert(
          "Not Connected",
          "You need to connect to a PictureFrame server first.",
          [{ text: "Go to Discovery", onPress: () => router.navigate('/(tabs)/discover') }]
        );
      } else if (!initialFetchDone.current) {
        // Only fetch on first load
        fetchServerImages();
        initialFetchDone.current = true;
      }
    }, [router]);

    // Process camera photo if passed as param
    // useEffect(() => {
    //   if (imageUri) {
    //     processNewImage(imageUri);
    //   }
    // }, [imageUri, processNewImage]);

    // Fetch existing images from the server
    const fetchServerImages = async () => {
      if (!NetworkService.connectedServer) return;

      console.log('Fetching server images for duplicate detection...');
      const { ip, port } = NetworkService.connectedServer;

      try {
        const response = await axios.get<ServerImage[]>(`http://${ip}:${port}/api/images`);
        const images = response.data || [];
        setServerImages(images);
        console.log(`Fetched ${images.length} images from server for duplicate checking`);

        // Log a few image names for debugging
        if (images.length > 0) {
          console.log('Sample server image names:');
          for (let i = 0; i < Math.min(3, images.length); i++) {
            console.log(`- ${images[i].name}`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch server images:', error);
      }
    };

    // Process a new image (checking for duplicates)
    const processNewImage = useCallback(async (uri: string) => {
      try {
        console.log('Processing new image:', uri);
        // Get file info including size
        const fileInfo = await FileSystem.getInfoAsync(uri);

        // Extract filename and normalize it (remove special chars, convert to lowercase)
        const fullFileName = uri.split('/').pop() || `image-${Date.now()}.jpg`;
        const fileName = fullFileName.toLowerCase().replace(/[^a-z0-9.]/g, '');

        console.log('Image file name:', fullFileName);
        console.log('Normalized name for comparison:', fileName);

        // Create the new image object
        const newImage: ImageInfo = {
          uri: uri,
          name: fullFileName,
          type: `image/${(uri.split('.').pop() || 'jpeg').toLowerCase()}`,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          size: fileInfo.exists ? fileInfo.size : undefined,
        };

        // Log server images count
        console.log(`Checking for duplicates among ${serverImages.length} server images`);

        // Check for potential duplicates using multiple signals
        const potentialDuplicates = serverImages.filter(serverImg => {
          // Normalize the server image name
          const serverImgName = serverImg.name.toLowerCase().replace(/[^a-z0-9.]/g, '');

          // Check for exact name match (ignoring case and special chars)
          const nameMatch = serverImgName === fileName;

          // Also detect similar names (e.g., "IMG_1234.jpg" vs "IMG_1234 (1).jpg")
          // by removing common affixes like " (1)", " - Copy", etc.
          const serverImgBaseName = serverImgName.replace(/\(\d+\)|\s*-?\s*copy(\d*)|\s*\(\d+\)|\.\w+$/gi, '');
          const newImgBaseName = fileName.replace(/\(\d+\)|\s*-?\s*copy(\d*)|\s*\(\d+\)|\.\w+$/gi, '');
          const baseNameMatch = serverImgBaseName === newImgBaseName && serverImgBaseName.length > 5;

          if (nameMatch || baseNameMatch) {
            console.log('Potential duplicate found:', serverImg.name);
            return true;
          }

          return false;
        });

        if (potentialDuplicates.length > 0) {
          console.log(`Found ${potentialDuplicates.length} potential duplicates`);

          // Show a thumbnail of the first potential duplicate if available
          const duplicateNames = potentialDuplicates
            .map(img => img.name)
            .join(', ')
            .substring(0, 50) + (potentialDuplicates.length > 1 ? '...' : '');

          Alert.alert(
            'Potential Duplicate Detected',
            `This image may already exist on the server as: ${duplicateNames}. Upload anyway?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Upload Anyway', onPress: () => setSelectedImages(prev => [...prev, newImage]) }
            ]
          );
        } else {
          console.log('No duplicates found, adding to selection');
          setSelectedImages(prev => [...prev, newImage]);
        }
      } catch (error) {
        console.error('Error processing image:', error);
        // If there's an error in duplicate detection, still add the image
        const newImage: ImageInfo = {
          uri: uri,
          name: uri.split('/').pop() || `image-${Date.now()}.jpg`,
          type: `image/${(uri.split('.').pop() || 'jpeg').toLowerCase()}`,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        };
        setSelectedImages(prev => [...prev, newImage]);
      }
    }, [serverImages]);

    useEffect(() => {
      if (imageUri) {
        processNewImage(imageUri);
      }
    }, [imageUri, processNewImage]);

    // Request permission to access media library
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need permission to access your photos');
        return false;
      }
      return true;
    };

    // Take a photo using the device camera
    const takePhoto = async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera permission to take photos');
        return;
      }

      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          // Process images one by one to check for duplicates
          for (const asset of result.assets) {
            await processNewImage(asset.uri);
          }
        }
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'Failed to take photo');
      }
    };

    // Pick images from gallery
    const pickImages = async () => {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10,
      });

      if (!result.canceled && result.assets.length > 0) {
        console.log(`Selected ${result.assets.length} images from gallery`);
        // Process images one by one to check for duplicates
        for (const asset of result.assets) {
          await processNewImage(asset.uri);
        }
      }
    };

    // Upload a single image
    const uploadImage = async (image: ImageInfo) => {
      if (!NetworkService.connectedServer) {
        return {
          ...image,
          uploadError: 'Not connected to server',
          isUploading: false
        };
      }

      const { ip, port } = NetworkService.connectedServer;
      const uploadUrl = `http://${ip}:${port}/api/upload`;

      try {
        // Create form data
        const formData = new FormData();
        formData.append('image', {
          uri: image.uri,
          type: image.type,
          name: image.name,
        } as any); // Type assertion to work around React Native FormData types

        // Upload with axios
        const response = await axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 seconds
        });

        console.log('Upload success:', response.data);

        return {
          ...image,
          isUploaded: true,
          isUploading: false,
        };
      } catch (error) {
        console.error('Upload error:', error);
        return {
          ...image,
          uploadError: error instanceof Error ? error.message : 'Upload failed',
          isUploading: false,
        };
      }
    };

    // Upload all selected images
    const uploadSelectedImages = async () => {
      if (selectedImages.length === 0) {
        Alert.alert('No Images', 'Please select images to upload first');
        return;
      }

      setUploading(true);

      // Mark all as uploading
      setSelectedImages(images =>
        images.map(img => ({
          ...img,
          isUploading: true,
          uploadProgress: 0,
          uploadError: undefined,
          isUploaded: false,
        }))
      );

      // Upload images sequentially to avoid overwhelming the server
      const results: ImageInfo[] = [];

      for (const image of selectedImages) {
        const result = await uploadImage(image);
        results.push(result);

        // Update the state after each upload
        setSelectedImages(prevImages =>
          prevImages.map(img => img.id === result.id ? result : img)
        );
      }

      setUploading(false);

      // Check if all uploads were successful
      const allSuccessful = results.every(img => img.isUploaded);
      const uploadedCount = results.filter(img => img.isUploaded).length;

      // Refresh server images list regardless of success/failure
      await fetchServerImages();

      if (allSuccessful) {
        // Add a slight delay before clearing to give users a chance to see the success status
        setTimeout(() => {
          // Clear successfully uploaded images from the UI
          setSelectedImages(prevImages => prevImages.filter(img => !img.isUploaded));

          Alert.alert(
            'Upload Complete',
            `All ${uploadedCount} images were successfully uploaded to your PictureFrame.`,
            [{ text: 'OK' }]
          );
        }, 1500);
      } else {
        // Some uploads failed
        const failedCount = results.filter(img => img.uploadError).length;

        setTimeout(() => {
          // Only keep failed images in the UI
          setSelectedImages(prevImages => prevImages.filter(img => !img.isUploaded));

          Alert.alert(
            'Upload Incomplete',
            `${uploadedCount} of ${results.length} images uploaded successfully. ${failedCount} failed.`,
            [{ text: 'OK' }]
          );
        }, 1500);
      }
    };

    // Remove an image from the selection
    const removeImage = (id: string) => {
      setSelectedImages(images => images.filter(img => img.id !== id));
    };

    // Remove all successfully uploaded images
    const clearUploaded = () => {
      setSelectedImages(prevImages => prevImages.filter(img => !img.isUploaded));
    };

    // Render an image item
    const renderImageItem = ({ item, isDark }: { item: ImageInfo, isDark: boolean }) => (
    <View style={[styles.imageItem, isDark && styles.imageItemDark]}>
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />

      <View style={styles.imageDetails}>
        <Text style={[styles.imageName, isDark && styles.textLight]} numberOfLines={1}>{item.name}</Text>

        {item.isUploading && !item.isUploaded && !item.uploadError && (
          <View style={styles.uploadingContainer}>
            <Text style={isDark && styles.textLight}>Uploading...</Text>
            <ActivityIndicator size="small" color={isDark ? "#4da6ff" : "#0000ff"} />
          </View>
        )}

        {item.isUploaded && (
          <Text style={styles.successText}>Uploaded ✓</Text>
        )}

        {item.uploadError && (
          <Text style={styles.errorText} numberOfLines={1}>Error: {item.uploadError}</Text>
        )}
      </View>

      {!item.isUploading && !item.isUploaded && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.navigate({
              pathname: '/(tabs)/edit',
              params: { uri: item.uri }
            })}
          >
            <Ionicons name="create-outline" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeImage(item.id)}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

    // Count of successfully uploaded images
    const uploadedCount = selectedImages.filter(img => img.isUploaded).length;

     return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Stack.Screen options={{
          title: 'Upload Images',
          // Add headerStyle for dark mode if needed
        }} />

        <Text style={[styles.title, isDark && styles.textLight]}>Upload to PictureFrame</Text>

        {serverInfo ? (
          <Text style={[styles.serverInfo, isDark && styles.textLight]}>
            Connected to: {serverInfo?.ip}:{serverInfo?.port}
          </Text>
        ) : (
          <Text style={styles.errorText}>Not connected to a server</Text>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={pickImages}
            disabled={uploading}
          >
            <Text style={styles.selectButtonText}>Select Images</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectButton, styles.cameraButton]}
            onPress={takePhoto}
            disabled={uploading}
          >
            <Text style={styles.selectButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {selectedImages.length > 0 && (
          <>
            <View style={styles.imageStatusContainer}>
              <Text style={[styles.subtitle, isDark && styles.textLight]}>
                {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
              </Text>

              {uploadedCount > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearUploaded}
                >
                  <Text style={styles.clearButtonText}>Clear Uploaded</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={selectedImages}
              renderItem={({ item }) => renderImageItem({ item, isDark })}
              keyExtractor={(item) => item.id}
              style={styles.imageList}
            />

            <TouchableOpacity
              style={[
                styles.uploadButton,
                uploading ? styles.uploadButtonDisabled : null
              ]}
              onPress={uploadSelectedImages}
              disabled={uploading}
            >
              <Text style={styles.uploadButtonText}>
                {uploading ? 'Uploading...' : 'Upload to PictureFrame'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    containerDark: {
      backgroundColor: '#121212',
    },
    textLight: {
      color: '#f5f5f5',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
    },
    serverInfo: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
      color: '#555',
    },
    imageItem: {
      flexDirection: 'row',
      padding: 10,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 5,
      marginBottom: 10,
      backgroundColor: 'white',
      alignItems: 'center',
    },
    imageItemDark: {
      backgroundColor: '#1a1a1a',
      borderColor: '#333',
    },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    imageStatusContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    selectButton: {
      backgroundColor: '#007bff',
      padding: 15,
      borderRadius: 5,
      flex: 1,
      alignItems: 'center',
      marginRight: 5,
    },
    cameraButton: {
      backgroundColor: '#6610f2',
      marginLeft: 5,
      marginRight: 0,
    },
    selectButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    clearButton: {
      backgroundColor: '#6c757d',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    clearButtonText: {
      color: 'white',
      fontSize: 12,
    },
    imageList: {
      marginTop: 10,
      flex: 1,
    },
 
    thumbnail: {
      width: 60,
      height: 60,
      borderRadius: 5,
      marginRight: 10,
    },
    imageDetails: {
      flex: 1,
    },
    imageName: {
      fontSize: 16,
      marginBottom: 5,
    },
    uploadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    successText: {
      color: 'green',
    },
    errorText: {
      color: 'red',
    },
    editButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#007bff',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    removeButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#ff6b6b',
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    uploadButton: {
      backgroundColor: '#28a745',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      marginVertical: 20,
    },
    uploadButtonDisabled: {
      backgroundColor: '#6c757d',
    },
    uploadButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });