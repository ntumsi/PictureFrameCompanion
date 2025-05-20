import React, { useState, useEffect } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    Alert,
    ScrollView
  } from 'react-native';
  import { Stack, useRouter } from 'expo-router';
  import { Ionicons } from '@expo/vector-icons';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import NetworkService from '../../src/services/NetworkService';
  import { useTheme, THEME_KEYS } from '../../src/context/ThemeContext';

  // Settings keys
  const KEYS = {
    AUTO_CLEAR_UPLOADS: 'settings_auto_clear_uploads',
    IMAGE_QUALITY: 'settings_image_quality',
    CHECK_DUPLICATES: 'settings_check_duplicates',
    SCAN_TIMEOUT: 'settings_scan_timeout'
  };

  // Quality options
  const QUALITY_OPTIONS = [
    { label: 'Low (0.5)', value: 0.5 },
    { label: 'Medium (0.7)', value: 0.7 },
    { label: 'High (0.9)', value: 0.9 },
    { label: 'Original (1.0)', value: 1.0 }
  ];

  // Timeout options
  const TIMEOUT_OPTIONS = [
    { label: 'Fast (1s)', value: 1000 },
    { label: 'Normal (3s)', value: 3000 },
    { label: 'Thorough (5s)', value: 5000 }
  ];

  interface SettingsState {
    autoClearUploads: boolean;
    imageQuality: number;
    checkDuplicates: boolean;
    darkMode: boolean;
    scanTimeout: number;
  }

  interface ServerInfo {
    ip: string;
    port: number;
  }

  export default function SettingsScreen() {
    const { isDark, setDarkMode } = useTheme();
    const [settings, setSettings] = useState<SettingsState>({
      autoClearUploads: true,
      imageQuality: 0.9,
      checkDuplicates: true,
      darkMode: isDark,
      scanTimeout: 3000
    });
    const router = useRouter();
    const serverInfo = NetworkService.connectedServer as ServerInfo | null;

    // Function to render a section header
    const renderSectionHeader = (title: string) => (
      <View style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>
        <Text style={[styles.sectionHeaderText, isDark && styles.textDark]}>{title}</Text>
      </View>
    );

    // Function to render a switch setting item
    const renderSwitchItem = (
      title: string,
      value: boolean,
      onValueChange: (value: boolean) => void,
      description?: string
    ) => (
      <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, isDark && styles.textDark]}>{title}</Text>
          {description && <Text style={[styles.settingDescription, isDark &&
  styles.descriptionDark]}>{description}</Text>}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={value ? '#007bff' : (isDark ? '#e0e0e0' : '#f4f3f4')}
        />
      </View>
    );

    // Function to render an option selector (for quality and timeout)
    const renderOptionSelector = (
      title: string,
      options: { label: string, value: number }[],
      selectedValue: number,
      onSelect: (value: number) => void,
      description?: string
    ) => (
      <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, isDark && styles.textDark]}>{title}</Text>
          {description && <Text style={[styles.settingDescription, isDark &&
  styles.descriptionDark]}>{description}</Text>}
        </View>
        <View style={styles.optionsContainer}>
          {options.map(option => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.optionButton,
                isDark && styles.optionButtonDark,
                selectedValue === option.value && (isDark ? styles.selectedOptionDark : styles.selectedOption)
              ]}
              onPress={() => onSelect(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  isDark && styles.optionTextDark,
                  selectedValue === option.value && styles.selectedOptionText
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );

    // Function to render a button setting item
    const renderButtonItem = (
      title: string,
      icon: string,
      onPress: () => void,
      description?: string,
      color: string = '#007bff'
    ) => (
      <TouchableOpacity style={[styles.buttonItem, isDark && styles.buttonItemDark]} onPress={onPress}>
        <View style={styles.buttonContent}>
          <Ionicons name={icon as any} size={24} color={color} style={styles.buttonIcon} />
          <View style={styles.buttonInfo}>
            <Text style={[styles.buttonTitle, isDark && styles.textDark]}>{title}</Text>
            {description && <Text style={[styles.buttonDescription, isDark &&
  styles.descriptionDark]}>{description}</Text>}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color={isDark ? "#999" : "#777"} />
      </TouchableOpacity>
    );

    // Load all settings from storage
    const loadSettings = React.useCallback(async () => {
      try {
        const autoClearUploads = await AsyncStorage.getItem(KEYS.AUTO_CLEAR_UPLOADS);
        const imageQuality = await AsyncStorage.getItem(KEYS.IMAGE_QUALITY);
        const checkDuplicates = await AsyncStorage.getItem(KEYS.CHECK_DUPLICATES);
        const scanTimeout = await AsyncStorage.getItem(KEYS.SCAN_TIMEOUT);

        setSettings({
          autoClearUploads: autoClearUploads === null ? true : autoClearUploads === 'true',
          imageQuality: imageQuality === null ? 0.9 : parseFloat(imageQuality),
          checkDuplicates: checkDuplicates === null ? true : checkDuplicates === 'true',
          darkMode: isDark, // Initialize from theme context
          scanTimeout: scanTimeout === null ? 3000 : parseInt(scanTimeout),
        });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }, [isDark]);

    // Load settings on mount
    useEffect(() => {
      loadSettings();
    }, [loadSettings]);

    // Save a single setting
    const saveSetting = async (key: string, value: any) => {
      try {
        await AsyncStorage.setItem(key, value.toString());
      } catch (error) {
        console.error(`Error saving setting ${key}:`, error);
      }
    };

    // Create special handler for dark mode
    const handleDarkModeChange = (value: boolean) => {
      setSettings(prev => ({ ...prev, darkMode: value }));
      setDarkMode(value); // This updates the app theme
    };

    // Update a boolean setting
    const updateBoolSetting = (key: keyof SettingsState, storageKey: string) => (value: boolean) => {
      setSettings(prev => ({ ...prev, [key]: value }));
      saveSetting(storageKey, value);
    };

    // Update a numeric setting
    const updateNumericSetting = (key: keyof SettingsState, storageKey: string) => (value: number) => {
      setSettings(prev => ({ ...prev, [key]: value }));
      saveSetting(storageKey, value);
    };

    // Disconnect from server
    const disconnectServer = async () => {
      Alert.alert(
        'Confirm Disconnect',
        'Are you sure you want to disconnect from the current PictureFrame server?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: async () => {
              await NetworkService.clearConnection();
              router.navigate('/(tabs)/discover');
            }
          }
        ]
      );
    };

    // Reset all settings
    const resetSettings = () => {
      Alert.alert(
        'Reset Settings',
        'Are you sure you want to reset all settings to default values?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset',
            onPress: async () => {
              const defaultSettings = {
                autoClearUploads: true,
                imageQuality: 0.9,
                checkDuplicates: true,
                darkMode: false,
                scanTimeout: 3000
              };

              try {
                // Reset each setting individually
                await AsyncStorage.setItem(KEYS.AUTO_CLEAR_UPLOADS, 'true');
                await AsyncStorage.setItem(KEYS.IMAGE_QUALITY, '0.9');
                await AsyncStorage.setItem(KEYS.CHECK_DUPLICATES, 'true');
                await AsyncStorage.setItem(THEME_KEYS.DARK_MODE, 'false');
                await AsyncStorage.setItem(KEYS.SCAN_TIMEOUT, '3000');

                setSettings(defaultSettings);
                setDarkMode(false); // Reset theme to light mode
                Alert.alert('Success', 'Settings have been reset to defaults');
              } catch (error) {
                console.error('Error resetting settings:', error);
                Alert.alert('Error', 'Failed to reset settings');
              }
            }
          }
        ]
      );
    };

    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Stack.Screen options={{ title: 'Settings' }} />

        <ScrollView style={isDark ? styles.scrollViewDark : undefined}>
          {/* Server Connection Section */}
          {renderSectionHeader('SERVER CONNECTION')}

          <View style={[styles.serverInfo, isDark && styles.serverInfoDark]}>
            <Ionicons name="server" size={24} color="#007bff" style={styles.serverIcon} />
            <View style={styles.serverDetails}>
              <Text style={[styles.serverLabel, isDark && styles.labelDark]}>Connected to:</Text>
              <Text style={[styles.serverAddress, isDark && styles.textDark]}>
                {serverInfo
                  ? `${serverInfo.ip}:${serverInfo.port}`
                  : 'Not connected'
                }
              </Text>
            </View>
          </View>

          {serverInfo && (
            <TouchableOpacity
              style={[styles.disconnectButton, isDark && styles.disconnectButtonDark]}
              onPress={disconnectServer}
            >
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          )}

          {/* Upload Settings Section */}
          {renderSectionHeader('UPLOAD SETTINGS')}

          {renderSwitchItem(
            'Auto-clear Uploaded Images',
            settings.autoClearUploads,
            updateBoolSetting('autoClearUploads', KEYS.AUTO_CLEAR_UPLOADS),
            'Automatically remove images from the upload list after successful upload'
          )}

          {renderOptionSelector(
            'Image Quality',
            QUALITY_OPTIONS,
            settings.imageQuality,
            updateNumericSetting('imageQuality', KEYS.IMAGE_QUALITY),
            'Higher quality means larger file sizes'
          )}

          {renderSwitchItem(
            'Check for Duplicates',
            settings.checkDuplicates,
            updateBoolSetting('checkDuplicates', KEYS.CHECK_DUPLICATES),
            'Alert when uploading images that may already exist on the server'
          )}

          {/* Network Settings Section */}
          {renderSectionHeader('NETWORK SETTINGS')}

          {renderOptionSelector(
            'Server Scan Timeout',
            TIMEOUT_OPTIONS,
            settings.scanTimeout,
            updateNumericSetting('scanTimeout', KEYS.SCAN_TIMEOUT),
            'Longer timeouts may find more servers but take longer to scan'
          )}

          {/* App Settings Section */}
          {renderSectionHeader('APP SETTINGS')}

          {renderSwitchItem(
            'Dark Mode',
            settings.darkMode,
            handleDarkModeChange,
            'Enable dark theme for the app'
          )}

          {renderButtonItem(
            'Reset Settings',
            'refresh-circle',
            resetSettings,
            'Restore all settings to default values',
            isDark ? '#ff4d4d' : '#dc3545'
          )}

          {/* About Section */}
          {renderSectionHeader('ABOUT')}

          <View style={[styles.aboutContainer, isDark && styles.aboutContainerDark]}>
            <Text style={[styles.appName, isDark && styles.textDark]}>PictureFrame Companion</Text>
            <Text style={[styles.appVersion, isDark && styles.versionDark]}>Version 1.0.0</Text>
            <Text style={[styles.appDescription, isDark && styles.descriptionDark]}>
              A mobile companion app for your PictureFrame digital photo display
            </Text>
          </View>
        </ScrollView>
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
    scrollViewDark: {
      backgroundColor: '#121212',
    },
    sectionHeader: {
      backgroundColor: '#f0f0f0',
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
      marginTop: 10,
    },
    sectionHeaderDark: {
      backgroundColor: '#1e1e1e',
      borderBottomColor: '#333',
    },
    sectionHeaderText: {
      fontSize: 12,
      color: '#666',
      fontWeight: 'bold',
    },
    textDark: {
      color: '#fff',
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'white',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    settingItemDark: {
      backgroundColor: '#1a1a1a',
      borderBottomColor: '#2c2c2c',
    },
    settingInfo: {
      flex: 1,
      marginRight: 10,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
    },
    settingDescription: {
      fontSize: 12,
      color: '#666',
      marginTop: 3,
    },
    descriptionDark: {
      color: '#aaa',
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      maxWidth: '60%',
    },
    optionButton: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: '#ddd',
      marginLeft: 5,
      marginBottom: 5,
      backgroundColor: '#f8f8f8',
    },
    optionButtonDark: {
      borderColor: '#444',
      backgroundColor: '#2a2a2a',
    },
    selectedOption: {
      borderColor: '#007bff',
      backgroundColor: '#e6f2ff',
    },
    selectedOptionDark: {
      borderColor: '#0066cc',
      backgroundColor: '#0a294d',
    },
    optionText: {
      fontSize: 12,
      color: '#555',
    },
    optionTextDark: {
      color: '#ccc',
    },
    selectedOptionText: {
      color: '#007bff',
      fontWeight: '500',
    },
    buttonItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'white',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    buttonItemDark: {
      backgroundColor: '#1a1a1a',
      borderBottomColor: '#2c2c2c',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    buttonIcon: {
      marginRight: 15,
    },
    buttonInfo: {
      flex: 1,
    },
    buttonTitle: {
      fontSize: 16,
      fontWeight: '500',
    },
    buttonDescription: {
      fontSize: 12,
      color: '#666',
      marginTop: 3,
    },
    serverInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    serverInfoDark: {
      backgroundColor: '#1a1a1a',
    },
    serverIcon: {
      marginRight: 15,
    },
    serverDetails: {
      flex: 1,
    },
    serverLabel: {
      fontSize: 14,
      color: '#666',
    },
    labelDark: {
      color: '#aaa',
    },
    serverAddress: {
      fontSize: 18,
      fontWeight: '500',
      marginTop: 2,
    },
    disconnectButton: {
      backgroundColor: '#f8f8f8',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    disconnectButtonDark: {
      backgroundColor: '#2a2a2a',
      borderBottomColor: '#333',
    },
    disconnectText: {
      color: '#dc3545',
      fontWeight: '500',
    },
    aboutContainer: {
      backgroundColor: 'white',
      padding: 20,
      alignItems: 'center',
    },
    aboutContainerDark: {
      backgroundColor: '#1a1a1a',
    },
    appName: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    appVersion: {
      fontSize: 14,
      color: '#666',
      marginBottom: 10,
    },
    versionDark: {
      color: '#aaa',
    },
    appDescription: {
      fontSize: 14,
      color: '#444',
      textAlign: 'center',
      lineHeight: 20,
    },
  });