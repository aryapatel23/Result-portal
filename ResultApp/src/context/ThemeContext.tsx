import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  cardAlt: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  border: string;
  borderLight: string;
  error: string;
  errorLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
  shadow: string;
  overlay: string;
  tabBar: string;
  tabBarBorder: string;
  inputBg: string;
  skeleton: string;
  gradient: string[];
  gradientAccent: string[];
}

interface Theme {
  isDark: boolean;
  colors: ThemeColors;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const lightColors: ThemeColors = {
  primary: '#0D9488',
  primaryLight: '#F0FDFA',
  primaryDark: '#0F766E',
  accent: '#6366F1',
  accentLight: '#EEF2FF',
  secondary: '#6366F1',
  background: '#F8FAFB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  info: '#3B82F6',
  infoLight: '#EFF6FF',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.4)',
  tabBar: '#FFFFFF',
  tabBarBorder: '#F1F5F9',
  inputBg: '#F8FAFC',
  skeleton: '#E2E8F0',
  gradient: ['#0D9488', '#0F766E'],
  gradientAccent: ['#6366F1', '#4F46E5'],
};

const darkColors: ThemeColors = {
  primary: '#2DD4BF',
  primaryLight: '#0D1F1D',
  primaryDark: '#14B8A6',
  accent: '#A5B4FC',
  accentLight: '#1A1830',
  secondary: '#A5B4FC',
  background: '#0C1117',
  surface: '#141B24',
  card: '#1A2332',
  cardAlt: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textInverse: '#0C1117',
  border: '#1E293B',
  borderLight: '#1E293B',
  error: '#F87171',
  errorLight: '#1F1214',
  success: '#34D399',
  successLight: '#0F1F18',
  warning: '#FBBF24',
  warningLight: '#1F1B0F',
  info: '#60A5FA',
  infoLight: '#0F1520',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.6)',
  tabBar: '#141B24',
  tabBarBorder: '#1E293B',
  inputBg: '#1A2332',
  skeleton: '#1E293B',
  gradient: ['#2DD4BF', '#14B8A6'],
  gradientAccent: ['#A5B4FC', '#818CF8'],
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const theme: Theme = {
    isDark,
    colors: isDark ? darkColors : lightColors,
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
