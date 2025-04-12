import React from 'react';
import { ActivityIndicator, useColorScheme, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

const LoadingScreen = () => {
  const colorScheme = useColorScheme();
  const spinnerColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <View style={styles.container}>
      <ActivityIndicator animating={true} size={35} color={spinnerColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    alignItems: 'center',
  },
});

export default LoadingScreen;