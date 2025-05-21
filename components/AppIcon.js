import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AppIcon = ({ size = 100, text = 'PFC' }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3b5998',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default AppIcon;