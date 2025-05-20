import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';

  export default function TabsLayout() {
    const { isDark } = useTheme();

    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: isDark ? '#0a84ff' : '#007bff',
          tabBarStyle: isDark ? { backgroundColor: '#1a1a1a', borderTopColor: '#333' } :
  undefined,
          tabBarLabelStyle: isDark ? { color: '#fff' } : undefined,
          tabBarInactiveTintColor: isDark ? '#999' : undefined,
          headerStyle: isDark ? { backgroundColor: '#1a1a1a' } : undefined,
          headerTintColor: isDark ? '#fff' : undefined,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="upload"
          options={{
            title: 'Upload',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cloud-upload" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="gallery"
          options={{
            title: 'Gallery',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="images" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="discover" // Changed from "explore" to "discover" to match your route names
          options={{
            title: 'Discover',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wifi" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="setting" // Changed from "settings" to "setting" to match your route names
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="edit"
          options={{
            title: 'Edit Image',
            href: null, // This hides it from the tab bar
          }}
        />
        <Tabs.Screen
          name="debug"
          options={{
            title: 'Debug',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bug" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    );
  }