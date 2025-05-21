import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const createTextIcon = (text = 'PFC', size = 100, options = {}) => {
  const {
    backgroundColor = ['#4c669f', '#3b5998', '#192f6a'],
    textColor = '#ffffff',
    borderRadius = 20,
    fontSize = size * 0.45,
    fontWeight = 'bold',
  } = options;

  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: borderRadius,
      }
    ]}>
      <LinearGradient
        colors={backgroundColor}
        style={[
          styles.gradient,
          { borderRadius: borderRadius }
        ]}
      >
        <Text style={[
          styles.text,
          {
            color: textColor,
            fontSize: fontSize,
            fontWeight: fontWeight,
          }
        ]}>
          {text}
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
});

export default createTextIcon;