// import React, { useState, useEffect as reactUseEffect } from 'react';
// import {
//     Platform, 
//     View, Text, 
//     TextInput, 
//     Button, 
//     StyleSheet, 
//     ActivityIndicator, 
//     FlatList, 
//     TouchableOpacity, 
//     Alert 
//   } from 'react-native';
//   import { Stack, useRouter } from 'expo-router';
//   import NetworkService from '../../src/services/NetworkService';
//   import { useTheme } from '../../src/context/ThemeContext';
//   import * as Permissions from 'expo-permissions';
  
  

//   interface ServerInfo {
//     ip: string;
//     port: number;
//   }

//   export default function ServerDiscovery() {
//     const { isDark } = useTheme();
//     const [manualIp, setManualIp] = useState('');
//     const [manualPort, setManualPort] = useState('5000');
//     const [isScanning, setIsScanning] = useState(false);
//     const [foundServers, setFoundServers] = useState<ServerInfo[]>([]);
//     const [error, setError] = useState('');
//     const router = useRouter();

//     // Try manual connection
//     const connectManually = async () => {
//       if (!manualIp) {
//         setError('Please enter an IP address');
//         return;
//       }

//       setIsScanning(true);
//       setError('');

//       try {
//         const result = await NetworkService.checkServer(manualIp, parseInt(manualPort) || 5000);

//         if (result.success) {
//           await NetworkService.saveConnection(manualIp, parseInt(manualPort) || 5000);
//           Alert.alert('Success', `Connected to server at ${manualIp}:${manualPort}`);
//           router.navigate('/');
//         } else {
//           setError(`Could not connect: ${result.reason}`);
//         }
//       } catch (err) {
//         setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
//       } finally {
//         setIsScanning(false);
//       }
//     };

//     // Scan for servers
//     const scanNetwork = async () => {
//       setIsScanning(true);
//       setError('');
//       setFoundServers([]);

//       try {
//         const result = await NetworkService.scanNetwork();

//         if (result.success && result.servers) {
//           setFoundServers(result.servers);
//         } else {
//           setError(`Scan failed: ${result.reason}`);
//         }
//       } catch (err) {
//         setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
//       } finally {
//         setIsScanning(false);
//       }
//     };

//     // Connect to a found server
//     const connectToServer = async (server: ServerInfo) => {
//       await NetworkService.saveConnection(server.ip, server.port);
//       Alert.alert('Success', `Connected to server at ${server.ip}:${server.port}`);
//       router.push('/');
//     };
//     useEffect(() => {
//     async function requestPermissions() {
//       if (Platform.OS === 'android') {
//         // Request location permission which is needed for network discovery on newerAndroid versions
//         const { status } = await Permissions.askAsync(Permissions.LOCATION);
//         if (status !== 'granted') {
//           setError('Network scanning requires location permission');
//         }
//       }
//     }

//     requestPermissions();
//   }, []);

//     // (removed unused renderServer function)
//     return (
//       <View style={[styles.container, isDark && styles.containerDark]}>
//         <Stack.Screen options={{ title: 'Connect to Picture Frame' }} />

//         <Text style={[styles.title, isDark && styles.textLight]}>Connect to Picture Frame</Text>

//         {/* Manual Connection */}
//         <View style={styles.inputContainer}>
//           <Text style={[styles.label, isDark && styles.textLight]}>IP Address:</Text>
//           <TextInput
//             style={[styles.input, isDark && styles.inputDark]}
//             value={manualIp}
//             onChangeText={setManualIp}
//             placeholder="192.168.1.xxx"
//             placeholderTextColor={isDark ? "#666" : "#999"}
//             keyboardType="numeric"
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Text style={[styles.label, isDark && styles.textLight]}>Port:</Text>
//           <TextInput
//             style={[styles.input, isDark && styles.inputDark]}
//             value={manualPort}
//             onChangeText={setManualPort}
//             placeholder="5000"
//             placeholderTextColor={isDark ? "#666" : "#999"}
//             keyboardType="numeric"
//           />
//         </View>

//         <Button
//           title="Connect Manually"
//           onPress={connectManually}
//           disabled={isScanning}
//           color={isDark ? "#0a84ff" : "#007bff"}
//         />

//         <View style={styles.divider}>
//           <Text style={[styles.dividerText, isDark && { color: '#aaa' }]}>OR</Text>
//         </View>

//         <Button
//           title={isScanning ? "Scanning..." : "Scan Network"}
//           onPress={scanNetwork}
//           disabled={isScanning}
//           color={isDark ? "#0a84ff" : "#007bff"}
//         />

//         {isScanning && (
//           <ActivityIndicator
//             size="large"
//             color={isDark ? "#ffffff" : "#0000ff"}
//             style={styles.spinner}
//           />
//         )}

//         {error ? <Text style={styles.error}>{error}</Text> : null}

//         {foundServers.length > 0 && (
//           <>
//             <Text style={[styles.subtitle, isDark && styles.textLight]}>Found Servers:</Text>
//             <FlatList
//               data={foundServers}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[styles.serverItem, isDark && styles.serverItemDark]}
//                   onPress={() => connectToServer(item)}
//                 >
//                   <Text style={[styles.serverText, isDark && styles.textLight]}>
//                     {item.ip}:{item.port}
//                   </Text>
//                   <Text style={styles.connectText}>Connect</Text>
//                 </TouchableOpacity>
//               )}
//               keyExtractor={(item) => `${item.ip}:${item.port}`}
//               style={styles.serverList}
//             />
//           </>
//         )}
//       </View>
//     );
//   }

  
import React, { useState, useEffect } from 'react';
  import {
    Platform,
    View, Text,
    TextInput,
    Button,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    Alert
  } from 'react-native';
  import { Stack, useRouter } from 'expo-router';
  import NetworkService from '../../src/services/NetworkService';
  import { useTheme } from '../../src/context/ThemeContext';
  import * as Location from 'expo-location';

  interface ServerInfo {
    ip: string;
    port: number;
  }

  export default function ServerDiscovery() {
    const { isDark } = useTheme();
    const [manualIp, setManualIp] = useState('');
    const [manualPort, setManualPort] = useState('5000');
    const [isScanning, setIsScanning] = useState(false);
    const [foundServers, setFoundServers] = useState<ServerInfo[]>([]);
    const [error, setError] = useState('');
    const router = useRouter();

    // Request permissions on component mount
    useEffect(() => {
      async function requestPermissions() {
        if (Platform.OS === 'android') {
          // Request location permission which is needed for network discovery
          // Use the newer expo-location instead of deprecated expo-permissions
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setError('Network scanning requires location permission');
          }
        }
      }

      requestPermissions();
    }, []);

    // Try manual connection
    const connectManually = async () => {
      if (!manualIp) {
        setError('Please enter an IP address');
        return;
      }

      setIsScanning(true);
      setError('');

      try {
        const result = await NetworkService.checkServer(manualIp, parseInt(manualPort) ||
  5000);

        if (result.success) {
          await NetworkService.saveConnection(manualIp, parseInt(manualPort) || 5000);
          Alert.alert('Success', `Connected to server at ${manualIp}:${manualPort}`);
          router.navigate('/');  // Fixed to use consistent navigation path
        } else {
          setError(`Could not connect: ${result.reason}`);
        }
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsScanning(false);
      }
    };

    // Scan for servers
    const scanNetwork = async () => {
      setIsScanning(true);
      setError('');
      setFoundServers([]);

      try {
        const result = await NetworkService.scanNetwork();

        if (result.success && result.servers) {
          setFoundServers(result.servers);
        } else {
          setError(`Scan failed: ${result.reason}`);
        }
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsScanning(false);
      }
    };

    // Connect to a found server
    const connectToServer = async (server: ServerInfo) => {
      await NetworkService.saveConnection(server.ip, server.port);
      Alert.alert('Success', `Connected to server at ${server.ip}:${server.port}`);
      router.navigate('/');  // Fixed to use consistent navigation path
    };

    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Stack.Screen options={{ title: 'Connect to Picture Frame' }} />

        <Text style={[styles.title, isDark && styles.textLight]}>Connect to Picture
  Frame</Text>

        {/* Manual Connection */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, isDark && styles.textLight]}>IP Address:</Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={manualIp}
            onChangeText={setManualIp}
            placeholder="192.168.1.xxx"
            placeholderTextColor={isDark ? "#666" : "#999"}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, isDark && styles.textLight]}>Port:</Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={manualPort}
            onChangeText={setManualPort}
            placeholder="5000"
            placeholderTextColor={isDark ? "#666" : "#999"}
            keyboardType="numeric"
          />
        </View>

        <Button
          title="Connect Manually"
          onPress={connectManually}
          disabled={isScanning}
          color={isDark ? "#0a84ff" : "#007bff"}
        />

        <View style={styles.divider}>
          <Text style={[styles.dividerText, isDark && { color: '#aaa' }]}>OR</Text>
        </View>

        <Button
          title={isScanning ? "Scanning..." : "Scan Network"}
          onPress={scanNetwork}
          disabled={isScanning}
          color={isDark ? "#0a84ff" : "#007bff"}
        />

        {isScanning && (
          <ActivityIndicator
            size="large"
            color={isDark ? "#ffffff" : "#0000ff"}
            style={styles.spinner}
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {foundServers.length > 0 && (
          <>
            <Text style={[styles.subtitle, isDark && styles.textLight]}>Found
  Servers:</Text>
            <FlatList
              data={foundServers}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.serverItem, isDark && styles.serverItemDark]}
                  onPress={() => connectToServer(item)}
                >
                  <Text style={[styles.serverText, isDark && styles.textLight]}>
                    {item.ip}:{item.port}
                  </Text>
                  <Text style={styles.connectText}>Connect</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => `${item.ip}:${item.port}`}
              style={styles.serverList}
            />
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
      color: '#fff',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },

    subtitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    label: {
      width: 100,
      fontSize: 16,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 8,
      fontSize: 16,
    },
     inputDark: {
      borderColor: '#444',
      backgroundColor: '#2a2a2a',
      color: 'white',
    },

    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    dividerText: {
      flex: 1,
      textAlign: 'center',
      color: '#888',
    },
    error: {
      color: 'red',
      marginTop: 10,
      textAlign: 'center',
    },
    spinner: {
      marginTop: 20,
    },
    serverList: {
      marginTop: 10,
    },
    serverItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 5,
      marginBottom: 10,
      backgroundColor: 'white',
    },
     serverItemDark: {
      backgroundColor: '#2a2a2a',
      borderColor: '#444',
    },
    serverText: {
      fontSize: 16,
    },
    connectText: {
      color: 'blue',
      fontWeight: 'bold',
    },
  });

