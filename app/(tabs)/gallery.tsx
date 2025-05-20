// import React, { useState, useEffect } from 'react';
//   import {
//     View,
//     Text,
//     StyleSheet,
//     Image,
//     FlatList,
//     TouchableOpacity,
//     RefreshControl,
//     Alert,
//     Dimensions
//   } from 'react-native';
//   import { Stack, useRouter } from 'expo-router';
//   import axios from 'axios';
//   import NetworkService from '../../src/services/NetworkService';

//   interface ImageItem {
//     id: string;
//     name: string;
//     url: string;
//     fullUrl: string;
//     path: string;
//   }

//   interface ServerInfo {
//     ip: string;
//     port: number;
//   }

//   export default function GalleryScreen() {
//     const [images, setImages] = useState<ImageItem[]>([]);
//     const [refreshing, setRefreshing] = useState(false);
//     // const [serverInfo] = useState(NetworkService.connectedServer);
//      const [serverInfo] = useState<ServerInfo | null>(NetworkService.connectedServer);
//     const router = useRouter();
//     const screenWidth = Dimensions.get('window').width;
//     const imageSize = (screenWidth - 40) / 2; // 2 images per row with some padding

//     useEffect(() => {
//       // Check connection status
//       if (!NetworkService.connectedServer) {
//         Alert.alert(
//           "Not Connected",
//           "You need to connect to a PictureFrame server first.",
//           [{ text: "Go to Discovery", onPress: () => router.navigate('/discover') }]
//         );
//       } else {
//         loadImages();
//       }
//     }, [router]);

//     // Load images from server
//     const loadImages = async () => {
//       if (!NetworkService.connectedServer) return;

//       setRefreshing(true);
//       const { ip, port } = NetworkService.connectedServer;

//       try {
//         const response = await axios.get<ImageItem[]>(`http://${ip}:${port}/api/images`);
//         setImages(response.data || []);
//       } catch (error) {
//         console.error('Failed to load images:', error);
//         Alert.alert(
//           'Error',
//           'Failed to load images from server. Please check your connection.',
//           [{ text: 'OK' }]
//         );
//       } finally {
//         setRefreshing(false);
//       }
//     };

//     // Handle image tap for full-screen view
//     const handleImagePress = (image: ImageItem) => {
//       // For now we'll just show an alert. In a more complete implementation,
//       // we would navigate to a full-screen image viewer
//       Alert.alert(
//         image.name,
//         'In a future update, this will open a full-screen image viewer with more options.'
//       );
//     };

//     // Delete an image
//     const handleDeleteImage = async (image: ImageItem) => {
//       if (!NetworkService.connectedServer) return;

//       const { ip, port } = NetworkService.connectedServer;

//       Alert.alert(
//         'Confirm Delete',
//         `Are you sure you want to delete ${image.name}?`,
//         [
//           { text: 'Cancel', style: 'cancel' },
//           {
//             text: 'Delete',
//             style: 'destructive',
//             onPress: async () => {
//               try {
//                 await axios.delete(`http://${ip}:${port}/api/images/${image.id}`);
//                 // Remove from local state if successful
//                 setImages(current => current.filter(img => img.id !== image.id));
//               } catch (error) {
//                 console.error('Failed to delete image:', error);
//                 Alert.alert('Error', 'Failed to delete image');
//               }
//             }
//           }
//         ]
//       );
//     };

//     // Render an image in the grid
//     const renderImageItem = ({ item }: { item: ImageItem }) => {
//       // Convert relative URL to absolute URL
//       const { ip, port } = NetworkService.connectedServer || { ip: '', port: 0 };
//       const imageUrl = item.fullUrl || `http://${ip}:${port}${item.url}`;

//       return (
//         <TouchableOpacity
//           style={[styles.imageContainer, { width: imageSize }]}
//           onPress={() => handleImagePress(item)}
//           onLongPress={() => handleDeleteImage(item)}
//         >
//           <Image
//             source={{ uri: imageUrl }}
//             style={[styles.image, { width: imageSize, height: imageSize }]}
//             resizeMode="cover"
//           />
//           <Text style={styles.imageName} numberOfLines={1}>
//             {item.name}
//           </Text>
//         </TouchableOpacity>
//       );
//     };

//     return (
//       <View style={styles.container}>
//         <Stack.Screen options={{ title: 'Image Gallery' }} />

//         <View style={styles.header}>
//           <Text style={styles.title}>Your PictureFrame Images</Text>

//           {serverInfo && (
//             <Text style={styles.serverInfo}>
//               Connected to: {serverInfo?.ip}:{serverInfo?.port}
//             </Text>
//           )}
//         </View>

//         {images.length > 0 ? (
//           <FlatList
//             data={images}
//             renderItem={renderImageItem}
//             keyExtractor={item => item.id}
//             numColumns={2}
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={loadImages}
//               />
//             }
//             contentContainerStyle={styles.imageGrid}
//           />
//         ) : (
//           <View style={styles.emptyContainer}>
//             {refreshing ? (
//               <Text style={styles.emptyText}>Loading images...</Text>
//             ) : (
//               <>
//                 <Text style={styles.emptyText}>No images found</Text>
//                 <TouchableOpacity
//                   style={styles.uploadButton}
//                   onPress={() => router.push('/upload')}
//                 >
//                   <Text style={styles.uploadButtonText}>Upload Images</Text>
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>
//         )}

//         <View style={styles.footer}>
//           <TouchableOpacity
//             style={styles.footerButton}
//             onPress={() => router.push('/')}
//           >
//             <Text style={styles.footerButtonText}>Home</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.footerButton}
//             onPress={() => router.push('/upload')}
//           >
//             <Text style={styles.footerButtonText}>Upload</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.footerButton, styles.activeFooterButton]}
//           >
//             <Text style={[styles.footerButtonText, styles.activeFooterButtonText]}>Gallery</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: '#f5f5f5',
//     },
//     header: {
//       padding: 20,
//       paddingBottom: 10,
//     },
//     title: {
//       fontSize: 24,
//       fontWeight: 'bold',
//       textAlign: 'center',
//     },
//     serverInfo: {
//       fontSize: 14,
//       textAlign: 'center',
//       color: '#666',
//       marginTop: 5,
//     },
//     imageGrid: {
//       padding: 10,
//     },
//     imageContainer: {
//       margin: 5,
//       overflow: 'hidden',
//     },
//     image: {
//       borderRadius: 8,
//     },
//     imageName: {
//       fontSize: 12,
//       marginTop: 4,
//       textAlign: 'center',
//     },
//     emptyContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       padding: 20,
//     },
//     emptyText: {
//       fontSize: 18,
//       color: '#666',
//       marginBottom: 20,
//     },
//     uploadButton: {
//       backgroundColor: '#007bff',
//       padding: 15,
//       borderRadius: 5,
//       alignItems: 'center',
//     },
//     uploadButtonText: {
//       color: 'white',
//       fontWeight: 'bold',
//     },
//     footer: {
//       flexDirection: 'row',
//       borderTopWidth: 1,
//       borderTopColor: '#e1e1e1',
//       backgroundColor: 'white',
//     },
//     footerButton: {
//       flex: 1,
//       padding: 15,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     footerButtonText: {
//       fontSize: 16,
//       color: '#555',
//     },
//     activeFooterButton: {
//       backgroundColor: '#f0f0f0',
//     },
//     activeFooterButtonText: {
//       color: '#007bff',
//       fontWeight: 'bold',
//     },
//   });
 import React, { useState, useEffect } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Dimensions,
    ActivityIndicator
  } from 'react-native';
  import { Stack, useRouter } from 'expo-router';
  import axios from 'axios';
  import { Ionicons } from '@expo/vector-icons';
  import NetworkService from '../../src/services/NetworkService';
  import { useTheme } from '../../src/context/ThemeContext';

  interface ImageItem {
    id: string;
    name: string;
    url: string;
    fullUrl: string;
    path: string;
    selected?: boolean; // For multi-select deletion
  }

  interface ServerInfo {
    ip: string;
    port: number;
  }

  export default function GalleryScreen() {
    const { isDark } = useTheme();
    const [images, setImages] = useState<ImageItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [serverInfo] = useState<ServerInfo | null>(NetworkService.connectedServer);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]); // IDs of selected images
    const [selectMode, setSelectMode] = useState(false);
    // const [hasChanges, setHasChanges] = useState(false);
    const router = useRouter();
    const screenWidth = Dimensions.get('window').width;
    const imageSize = (screenWidth - 40) / 2; // 2 images per row with some padding

    useEffect(() => {
      // Check connection status
      if (!NetworkService.connectedServer) {
        Alert.alert(
          "Not Connected",
          "You need to connect to a PictureFrame server first.",
          [{ text: "Go to Discovery", onPress: () => router.navigate('/(tabs)/discover') }]
        );
      } else {
        loadImages();
      }
    }, [router]);

    // Load images from server
    const loadImages = async () => {
      if (!NetworkService.connectedServer) return;

      setRefreshing(true);
      const { ip, port } = NetworkService.connectedServer;

      try {
        const response = await axios.get<ImageItem[]>(`http://${ip}:${port}/api/images`);
        const sortedImages = (response.data || []).sort((a, b) => {
          // Sort by name (basic chronological if using UUID-based filenames)
          return a.name.localeCompare(b.name);
        });

        setImages(sortedImages);

        // Reset selection whenever images are reloaded
        setSelectedImages([]);
        setSelectMode(false);
      } catch (error) {
        console.error('Failed to load images:', error);
        Alert.alert(
          'Error',
          'Failed to load images from server. Please check your connection.',
          [{ text: 'OK' }]
        );
      } finally {
        setRefreshing(false);
      }
    };

    // Toggle select mode
    const toggleSelectMode = () => {
      setSelectMode(!selectMode);
      if (selectMode) {
        // If leaving select mode, clear selections
        setSelectedImages([]);
      }
    };

    // Toggle image selection for batch operations
    const toggleImageSelection = (imageId: string) => {
      setSelectedImages(prev => {
        if (prev.includes(imageId)) {
          return prev.filter(id => id !== imageId);
        } else {
          return [...prev, imageId];
        }
      });
    };

    // Select all images
    const selectAll = () => {
      setSelectedImages(images.map(img => img.id));
    };


    // Handle batch delete
    const handleBatchDelete = async () => {
      if (selectedImages.length === 0) {
        Alert.alert('No Selection', 'Please select images to delete');
        return;
      }

      Alert.alert(
        'Confirm Delete',
        `Are you sure you want to delete ${selectedImages.length} image${selectedImages.length !== 1 ? 's' : ''}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await batchDelete();
            }
          }
        ]
      );
    };

    // Perform batch delete
    const batchDelete = async () => {
      if (!NetworkService.connectedServer || selectedImages.length === 0) return;

      setIsDeleting(true);
      const { ip, port } = NetworkService.connectedServer;

      const results = { success: 0, failure: 0 };
      const deletedIds: string[] = [];

      try {
        // Process deletions one by one
        for (const imageId of selectedImages) {
          try {
            await axios.delete(`http://${ip}:${port}/api/images/${imageId}`);
            deletedIds.push(imageId);
            results.success++;
          } catch (error) {
            console.error(`Failed to delete image ${imageId}:`, error);
            results.failure++;
          }
        }

        // Update local state to remove deleted images
        if (deletedIds.length > 0) {
          setImages(prevImages => prevImages.filter(img => !deletedIds.includes(img.id)));
          // setHasChanges(true);
        }

        // Reset selection mode and selections
        setSelectedImages([]);
        setSelectMode(false);

        // Show result message
        if (results.failure > 0) {
          Alert.alert(
            'Delete Partially Complete',
            `Successfully deleted ${results.success} images. Failed to delete ${results.failure} images.`
          );
        } else {
          Alert.alert(
            'Delete Complete',
            `Successfully deleted ${results.success} images.`
          );
        }
      } catch (error) {
        console.error('Error in batch delete:', error);
        Alert.alert('Error', 'An error occurred during batch delete');
      } finally {
        setIsDeleting(false);
      }
    };

    // Handle image tap
    const handleImagePress = (image: ImageItem) => {
      if (selectMode) {
        // In select mode, tapping toggles selection
        toggleImageSelection(image.id);
      } else {
        // Not in select mode - show image details or preview
        previewImage(image);
      }
    };

    // Preview a single image
    const previewImage = (image: ImageItem) => {
      // For now just show info, in a full implementation this would open a full-screen viewer
      Alert.alert(
        image.name,
        'In a future update, this will open a full-screen image viewer with more options.'
      );
    };

    // Long press handler - toggle selection mode or select image
    const handleImageLongPress = (image: ImageItem) => {
      if (!selectMode) {
        // Enter select mode and select this image
        setSelectMode(true);
        setSelectedImages([image.id]);
      } else {
        // Already in select mode, toggle this image
        toggleImageSelection(image.id);
      }
    };

    // Render an image in the grid
    const renderImageItem = ({ item }: { item: ImageItem }) => {
      // Convert relative URL to absolute URL
      const { ip, port } = NetworkService.connectedServer || { ip: '', port: 0 };
      const imageUrl = item.fullUrl || `http://${ip}:${port}${item.url}`;

      // Check if this image is selected
      const isSelected = selectedImages.includes(item.id);

      return (
        <TouchableOpacity
          style={[
            styles.imageContainer,
            { width: imageSize },
            isDark && styles.imageContainerDark,
            isSelected && (isDark ? styles.selectedImageContainerDark : styles.selectedImageContainer)
          ]}
          onPress={() => handleImagePress(item)}
          onLongPress={() => handleImageLongPress(item)}
          delayLongPress={300}
        >
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, { width: imageSize, height: imageSize }]}
            resizeMode="cover"
          />

          {isSelected && (
            <View style={styles.selectionOverlay}>
              <Ionicons name="checkmark-circle" size={28} color="#007bff" />
            </View>
          )}

          <Text style={[styles.imageName, isDark && styles.textLight]} numberOfLines={1}>
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    };
    // Go to upload screen
    const goToUpload = () => {
      router.navigate('/(tabs)/upload');
    };

    
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Stack.Screen options={{
          title: selectMode ? `${selectedImages.length} Selected` : 'Gallery',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={[styles.headerButton, selectMode && styles.headerButtonDisabled]}
                onPress={toggleSelectMode}
                disabled={isDeleting}
              >
                <Ionicons name="checkmark" size={24} color={selectMode ? '#007bff' : '#666'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerButton, selectMode && styles.headerButtonDisabled]}
                onPress={selectAll}
                disabled={!selectMode || isDeleting}
              >
                <Text style={[styles.textLight, selectMode && styles.headerButtonDisabled]}>Select All</Text>
              </TouchableOpacity>
            </View>
          )
        }} />

        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.textLight]}>Your PictureFrame Images</Text>

          {serverInfo && (
            <Text style={[styles.serverInfo, isDark && styles.serverInfoDark]}>
              Connected to: {serverInfo.ip}:{serverInfo.port}
            </Text>
          )}
        </View>

        {isDeleting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Deleting images...</Text>
          </View>
        )}

        {images.length > 0 ? (
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={item => item.id}
            numColumns={2}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={loadImages}
                tintColor={isDark ? "#ffffff" : "#007bff"}
              />
            }
            style={isDark ? { backgroundColor: '#121212' } : undefined}
            contentContainerStyle={styles.imageGrid}
          />
        ) : (
          <View style={[styles.emptyContainer, isDark && styles.emptyContainerDark]}>
            {refreshing ? (
              <Text style={[styles.emptyText, isDark && styles.textLight]}>Loading images...</Text>
            ) : (
              <>
                <Text style={[styles.emptyText, isDark && styles.textLight]}>No images found</Text>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={goToUpload}
                >
                  <Text style={styles.uploadButtonText}>Upload Images</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {selectMode && selectedImages.length > 0 && (
          <View style={[styles.batchActionBar, isDark && styles.batchActionBarDark]}>
            <Text style={styles.selectionCount}>
              {selectedImages.length} selected
            </Text>
            <TouchableOpacity
              style={styles.batchDeleteButton}
              onPress={handleBatchDelete}
            >
              <Text style={styles.batchDeleteText}>Delete Selected</Text>
            </TouchableOpacity>
          </View>
        )}
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
    header: {
      padding: 20,
      paddingBottom: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    serverInfo: {
      fontSize: 14,
      textAlign: 'center',
      color: '#666',
      marginTop: 5,
    },
    serverInfoDark: {
      color: '#aaa',
    },
    imageGrid: {
      padding: 10,
    },
    imageContainer: {
      margin: 5,
      overflow: 'hidden',
      position: 'relative',
      borderRadius: 8,
    },
      imageContainerDark: {
      backgroundColor: '#2c2c2c',
    },
    selectedImageContainer: {
      borderWidth: 2,
      borderColor: '#007bff',
    },
     selectedImageContainerDark: {
      borderWidth: 2,
      borderColor: '#0a84ff',
    },
    image: {
      borderRadius: 8,
    },
    selectionOverlay: {
      position: 'absolute',
      top: 5,
      right: 5,
      backgroundColor: 'rgba(255,255,255,0.8)',
      borderRadius: 15,
      padding: 2,
    },
    imageName: {
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyContainerDark: {
      backgroundColor: '#121212',
    },
    emptyText: {
      fontSize: 18,
      color: '#666',
      marginBottom: 20,
    },
    uploadButton: {
      backgroundColor: '#007bff',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
    },
    uploadButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    headerButtons: {
      flexDirection: 'row',
      marginRight: 10,
    },
    headerButtonGroup: {
      flexDirection: 'row',
    },
    headerButton: {
      marginLeft: 15,
    },
    headerButtonDisabled: {
      opacity: 0.5,
    },
    batchActionBar: {
      backgroundColor: '#333',
      padding: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    batchActionBarDark: {
      backgroundColor: '#222',
    },
    selectionCount: {
      color: 'white',
      fontSize: 16,
    },
    batchDeleteButton: {
      backgroundColor: '#dc3545',
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 5,
    },
    batchDeleteText: {
      color: 'white',
      fontWeight: 'bold',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    loadingText: {
      color: 'white',
      marginTop: 10,
      fontSize: 18,
    },
  });