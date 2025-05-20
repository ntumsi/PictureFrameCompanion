import React, { useState } from 'react';
  import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from
  'react-native';
  import { Stack } from 'expo-router';
  import { useTheme } from '../../src/context/ThemeContext';
  import axios, { isAxiosError } from 'axios';

  export default function NetworkDebugScreen() {
    const { isDark } = useTheme();
    const [testIP, setTestIP] = useState('192.168.1.1');
    const [testPort, setTestPort] = useState('5000');
    const [logs, setLogs] = useState<string[]>([]);
    const [results, setResults] = useState<string>('');

    const addLog = (message: string) => {
      console.log(message);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const clearLogs = () => {
      setLogs([]);
      setResults('');
    };

    const testConnection = async () => {
      try {
        addLog(`Testing connection to ${testIP}:${testPort}...`);

        const timeout = 5000;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await
  axios.get(`http://${testIP}:${parseInt(testPort)}/api/images`, {
            timeout,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          addLog(`Received response: Status ${response.status}`);
          addLog(`Content-Type: ${response.headers['content-type']}`);

          if (Array.isArray(response.data)) {
            addLog(`SUCCESS! Found PictureFrame server with ${response.data.length}
  images`);
            setResults('Connection successful! Server responded with image data.');
          } else {
            addLog(`Received data is not an array: ${typeof response.data}`);
            setResults('Connected to server but response format was unexpected.');
          }
        } catch (axiosError: unknown) {
          clearTimeout(timeoutId);

          if (isAxiosError(axiosError)) {
            if (axiosError.code === 'ECONNABORTED' ||
  axiosError.message.includes('timeout')) {
              addLog(`Connection timed out after ${timeout}ms`);
              setResults('Connection timed out. The server might be unavailable orblocked.');
            } else {
              addLog(`Error: ${axiosError.message}`);
              setResults(`Connection failed: ${axiosError.message}`);
            }
          } else {
            const errorMessage = axiosError instanceof Error
              ? axiosError.message
              : 'Unknown error';
            addLog(`Error: ${errorMessage}`);
            setResults(`Error: ${errorMessage}`);
          }
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Unknown error occurred';
        addLog(`Error: ${errorMessage}`);
        setResults(`Error: ${errorMessage}`);
      }
    };

    const getNetworkInfo = async () => {
      try {
        addLog('Getting network information...');

        try {
          const NetInfo = await import('@react-native-community/netinfo');
          const netInfo = await NetInfo.default.fetch();

          addLog(`Type: ${netInfo.type}`);
          addLog(`Connected: ${netInfo.isConnected}`);

          if (netInfo.type === 'wifi') {
            addLog(`SSID: ${netInfo.details?.ssid || 'Unknown'}`);
            addLog(`BSSID: ${netInfo.details?.bssid || 'Unknown'}`);
            addLog(`IP Address: ${netInfo.details?.ipAddress || 'Unknown'}`);

            if (netInfo.details?.ipAddress) {
              setTestIP(netInfo.details.ipAddress.split('.').slice(0, 3).join('.') + '.1');
            }
          }
        } catch (importError: unknown) {
          const errorMessage = importError instanceof Error
            ? importError.message
            : 'Unknown error';
          addLog(`Error importing NetInfo: ${errorMessage}`);
          addLog('NetInfo might not be installed. Try: npm install@react-native-community/netinfo');
        }

        addLog('Network info retrieval complete');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Unknown error occurred';
        addLog(`Error getting network info: ${errorMessage}`);
      }
    };

    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Stack.Screen options={{ title: 'Network Debug' }} />

        <Text style={[styles.title, isDark && styles.textLight]}>Network Diagnostics</Text>

        <View style={[styles.testContainer, isDark && styles.testContainerDark]}>
          <Text style={[styles.label, isDark && styles.textLight]}>Test Connection</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={testIP}
              onChangeText={setTestIP}
              placeholder="IP Address"
              placeholderTextColor={isDark ? "#666" : "#999"}
            />
            <Text style={[styles.separator, isDark && styles.textLight]}>:</Text>
            <TextInput
              style={[styles.portInput, isDark && styles.inputDark]}
              value={testPort}
              onChangeText={setTestPort}
              placeholder="Port"
              placeholderTextColor={isDark ? "#666" : "#999"}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.testButton]}
              onPress={testConnection}
            >
              <Text style={styles.buttonText}>Test Connection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.infoButton]}
              onPress={getNetworkInfo}
            >
              <Text style={styles.buttonText}>Get Network Info</Text>
            </TouchableOpacity>
          </View>

          {results ? (
            <View style={[styles.resultsContainer, isDark && styles.resultsContainerDark]}>
              <Text style={[styles.resultsText, isDark &&
  styles.textLight]}>{results}</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.logsContainer, isDark && styles.logsContainerDark]}>
          <View style={[styles.logsHeader, isDark && styles.logsHeaderDark]}>
            <Text style={[styles.logsTitle, isDark && styles.textLight]}>Logs</Text>
            <TouchableOpacity
              style={[styles.clearButton, isDark && styles.clearButtonDark]}
              onPress={clearLogs}
            >
              <Text style={[styles.clearButtonText, isDark && { color: '#ff6b6b'
  }]}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={[styles.logs, isDark && styles.logsDark]}>
            {logs.length === 0 ? (
              <Text style={[styles.emptyLogs, isDark && styles.textMuted]}>
                Network activity logs will appear here
              </Text>
            ) : (
              logs.map((log, index) => (
                <Text key={index} style={[styles.logEntry, isDark && styles.logEntryDark]}>
                  {log}
                </Text>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#f5f5f5',
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
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
    },
    testContainer: {
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    testContainerDark: {
      backgroundColor: '#1a1a1a',
      shadowColor: '#000',
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    input: {
      flex: 3,
      height: 40,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 4,
      paddingHorizontal: 8,
    },
    inputDark: {
      backgroundColor: '#2a2a2a',
      borderColor: '#444',
      color: '#fff',
    },
    separator: {
      fontSize: 18,
      fontWeight: 'bold',
      marginHorizontal: 8,
    },
    portInput: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 4,
      paddingHorizontal: 8,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 4,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    testButton: {
      backgroundColor: '#007bff',
    },
    infoButton: {
      backgroundColor: '#17a2b8',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    resultsContainer: {
      marginTop: 16,
      padding: 12,
      backgroundColor: '#f8f9fa',
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    resultsContainerDark: {
      backgroundColor: '#2a2a2a',
      borderColor: '#444',
    },
    resultsText: {
      fontSize: 14,
    },
    logsContainer: {
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      overflow: 'hidden',
    },
    logsContainerDark: {
      backgroundColor: '#1a1a1a',
    },
    logsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    logsHeaderDark: {
      borderBottomColor: '#333',
    },
    logsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    clearButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: '#f8f9fa',
      borderRadius: 4,
    },
    clearButtonDark: {
      backgroundColor: '#2a2a2a',
    },
    clearButtonText: {
      color: '#dc3545',
    },
    logs: {
      flex: 1,
      padding: 12,
    },
    logsDark: {
      backgroundColor: '#1a1a1a',
    },
    emptyLogs: {
      color: '#999',
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 20,
    },
    logEntry: {
      fontSize: 12,
      fontFamily: 'monospace',
      marginBottom: 6,
      color: '#333',
    },
    logEntryDark: {
      color: '#ccc',
    },
  });