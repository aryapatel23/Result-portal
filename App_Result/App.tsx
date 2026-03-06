/**
 * Student Result Portal - Mobile App
 * 
 * Main App Component with Navigation and Authentication
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// Navigation wrapper to access theme
function ThemedNavigationContainer({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  const navigationTheme = theme.isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.error,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.error,
        },
      };

  return <NavigationContainer theme={navigationTheme}>{children}</NavigationContainer>;
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedNavigationContainer>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </ThemedNavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
