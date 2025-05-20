import React, { createContext, useState, useContext, useEffect } from 'react';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { useColorScheme } from 'react-native';

  // Theme constants
  export const THEME_KEYS = {
    DARK_MODE: 'settings_dark_mode',
  };

  // Define theme types
  export type ThemeType = 'light' | 'dark';

  // Theme context type
  interface ThemeContextType {
    theme: ThemeType;
    isDark: boolean;
    toggleTheme: () => void;
    setDarkMode: (enabled: boolean) => void;
  }

  // Create the context
  const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    isDark: false,
    toggleTheme: () => {},
    setDarkMode: () => {},
  });

  // Custom hook to use the theme context
  export const useTheme = () => useContext(ThemeContext);

  // Theme provider component
  export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setTheme] = useState<ThemeType>('light');

    // Load theme preference from storage
    useEffect(() => {
      const loadTheme = async () => {
        try {
          const storedTheme = await AsyncStorage.getItem(THEME_KEYS.DARK_MODE);
          if (storedTheme !== null) {
            setTheme(storedTheme === 'true' ? 'dark' : 'light');
          } else {
            // Use system preference as default if available
            setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
          }
        } catch (error) {
          console.error('Error loading theme:', error);
        }
      };

      loadTheme();
    }, [systemColorScheme]);

    // Toggle between light and dark theme
    const toggleTheme = async () => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      try {
        await AsyncStorage.setItem(THEME_KEYS.DARK_MODE, newTheme === 'dark' ? 'true' : 'false');
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    };

    // Explicitly set dark mode
    const setDarkMode = async (enabled: boolean) => {
      const newTheme = enabled ? 'dark' : 'light';
      setTheme(newTheme);
      try {
        await AsyncStorage.setItem(THEME_KEYS.DARK_MODE, enabled ? 'true' : 'false');
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    };

    return (
      <ThemeContext.Provider
        value={{
          theme,
          isDark: theme === 'dark',
          toggleTheme,
          setDarkMode
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  };