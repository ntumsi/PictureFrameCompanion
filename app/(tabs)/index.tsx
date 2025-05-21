// import { useState, useEffect } from 'react';
//   import { StyleSheet, Text, View, Button } from 'react-native';
//   import { useRouter } from 'expo-router';
//   import NetworkService from '../../src/services/NetworkService';

//   interface ServerInfo {
//     ip: string;
//     port: number;
//   }

//   export default function Home() {
//     const router = useRouter();
//     const [isConnected, setIsConnected] = useState(false);
//     const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);

//     useEffect(() => {
//       // Check if we already have connection info
//       const server = NetworkService.connectedServer;
//       if (server) {
//         setIsConnected(true);
//         setServerInfo(server);
//       }
//     }, []);

//     // Go to server discovery
//     const goToDiscovery = () => {
//       router.push('./discover');
//     };

//     // Go to image upload
//     const goToUpload = () => {
//       router.push('./upload');
//     };

//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>PictureFrame Companion</Text>

//         {isConnected ? (
//           <View style={styles.connectedContainer}>
//             <Text style={styles.connectedText}>
//               Connected to PictureFrame Server at {serverInfo?.ip}:{serverInfo?.port}
//             </Text>
//             <Text style={styles.infoText}>
//               Ready to upload images from your phone to your PictureFrame!
//             </Text>
//             <Button
//               title="Upload Images"
//               onPress={goToUpload}
//             />
//               <Button
//               title="View Gallery"
//               onPress={() => router.navigate('/gallery')}
//             />

//           </View>

//         ) : (
//           <View style={styles.disconnectedContainer}>
//             <Text style={styles.infoText}>
//               Connect to your PictureFrame server to get started
//             </Text>
//             <Button
//               title="Find PictureFrame Server"
//               onPress={goToDiscovery}
//             />
//           </View>
//         )}
//       </View>
      
//     );
//   }

//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: '#fff',
//       padding: 20,
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     title: {
//       fontSize: 24,
//       fontWeight: 'bold',
//       marginBottom: 20,
//     },
//     connectedContainer: {
//       alignItems: 'center',
//     },
//     disconnectedContainer: {
//       alignItems: 'center',
//     },
//     connectedText: {
//       fontSize: 18,
//       fontWeight: 'bold',
//       marginBottom: 10,
//       textAlign: 'center',
//     },
//     infoText: {
//       fontSize: 16,
//       textAlign: 'center',
//       marginBottom: 30,
//     },
//   });

  import { useState, useEffect } from 'react';
  import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
  import { router } from 'expo-router';
  import { Ionicons } from '@expo/vector-icons';
  import NetworkService from '../../src/services/NetworkService';
  import { useTheme } from '../../src/context/ThemeContext';

  interface ServerInfo {
    ip: string;
    port: number;
  }

  export default function HomeScreen() {
    const { isDark } = useTheme();
    const [isConnected, setIsConnected] = useState(false);
    const [serverInfo, setServerInfo] = useState<ServerInfo |
  null>(NetworkService.connectedServer);

    useEffect(() => {
      // Check if we already have connection info and set up state
      async function checkConnection() {
        try {
          // Force reload the saved connection
          await NetworkService.loadSavedConnection();
          
          const server = NetworkService.connectedServer;
          console.log('Home screen - Current connection state:', server);
          
          if (server) {
            setIsConnected(true);
            setServerInfo(server);
          } else {
            setIsConnected(false);
            setServerInfo(null);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
          setIsConnected(false);
        }
      }
      
      checkConnection();
    }, []);

    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={[styles.title, isDark && styles.textLight]}>PictureFrame
  Companion</Text>

        {isConnected ? (
          <View style={styles.connectedContainer}>
            <Text style={[styles.connectedText, isDark && styles.textLight]}>
              Connected to PictureFrame Server at {serverInfo?.ip}:{serverInfo?.port}
            </Text>
            <Text style={[styles.infoText, isDark && styles.textMuted]}>
              Ready to upload images from your phone to your PictureFrame!
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.navigate('/(tabs)/upload')}
              >
                <Ionicons name="cloud-upload" size={24} color="white"
  style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Upload Images</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.galleryButton]}
                onPress={() => router.navigate('/(tabs)/gallery')}
              >
                <Ionicons name="images" size={24} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>View Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.disconnectedContainer}>
            <Text style={[styles.infoText, isDark && styles.textMuted]}>
              Connect to your PictureFrame server to get started
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.navigate('/(tabs)/discover')}
            >
              <Ionicons name="wifi" size={24} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Find PictureFrame Server</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    containerDark: {
      backgroundColor: '#121212',
    },
    textLight: {
      color: '#fff',
    },
    textMuted: {
      color: '#aaa',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 30,
      textAlign: 'center',
    },
    connectedContainer: {
      alignItems: 'center',
      width: '100%',
      maxWidth: 500,
    },
    disconnectedContainer: {
      alignItems: 'center',
      width: '100%',
      maxWidth: 500,
    },
    connectedText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
    },
    infoText: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 40,
      color: '#555',
    },
    buttonContainer: {
      width: '100%',
      marginBottom: 20,
    },
    button: {
      backgroundColor: '#007bff',
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 15,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    galleryButton: {
      backgroundColor: '#28a745',
    },
    buttonIcon: {
      marginRight: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    }
  });