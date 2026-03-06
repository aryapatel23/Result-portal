/**
 * Splash Screen
 * 
 * Initial loading screen shown while checking authentication
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SplashScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <Text style={styles.icon}>📘</Text>
      <Text style={[styles.title, { color: theme.colors.surface }]}>Student Result Portal</Text>
      <ActivityIndicator size="large" color={theme.colors.surface} style={styles.loader} />
      <Text style={[styles.subtitle, { color: theme.colors.primaryLight }]}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  loader: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
  },
});

export default SplashScreen;
