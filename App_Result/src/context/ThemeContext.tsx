/**
 * Theme Context
 * 
 * Professional theme system with light and dark modes
 * Provides theme state and toggle functionality throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar, Appearance, ColorSchemeName } from 'react-native';

// Theme types
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryDark: string;
  primaryLight: string;
  
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Border colors
  border: string;
  divider: string;
  
  // Status colors
  success: string;
  error: string;
  warning: string;
  info: string;
  
  // Accent colors
  accent: string;
  accentLight: string;
  
  // Special colors
  shadow: string;
  overlay: string;
  disabled: string;
  placeholder: string;
  
  // Gradient colors
  gradientStart: string;
  gradientEnd: string;
  
  // Role-specific colors
  admin: string;
  teacher: string;
  student: string;
  
  // Icon colors
  iconPrimary: string;
  iconSecondary: string;
  iconAccent: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
}

// Light theme colors - Clean, professional, modern
const lightColors: ThemeColors = {
  primary: '#5B7FFF',         // Rich blue - more vibrant than typical indigo
  primaryDark: '#4366E8',
  primaryLight: '#7A9AFF',
  
  background: '#F5F7FA',       // Subtle off-white, not pure gray
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  text: '#1A1F36',            // Deep navy, not pure black
  textSecondary: '#4E5D78',
  textTertiary: '#8792A2',
  
  border: '#DFE3EB',
  divider: '#E8ECF1',
  
  success: '#00BA88',         // Teal-green, distinctive
  error: '#EF4444',
  warning: '#FF8F39',         // Warm orange
  info: '#2196F3',
  
  accent: '#7C3AED',          // Purple with personality
  accentLight: '#A78BFA',
  
  shadow: '#1A1F3610',
  overlay: '#1A1F3680',
  disabled: '#C1C7D0',
  placeholder: '#8792A2',
  
  gradientStart: '#5B7FFF',
  gradientEnd: '#7C3AED',
  
  admin: '#F43F5E',           // Rose red
  teacher: '#3B82F6',
  student: '#00BA88',
  
  iconPrimary: '#1A1F36',
  iconSecondary: '#6B7280',
  iconAccent: '#5B7FFF',
};

// Dark theme colors - Professional, modern, warm (inspired by top apps)
const darkColors: ThemeColors = {
  primary: '#4ECDC4',         // Teal/cyan - fresh and modern
  primaryDark: '#3DB8AF',
  primaryLight: '#6FD9D1',
  
  background: '#1A1D29',       // Deep navy-gray, warm undertones
  surface: '#252936',          // Elevated surface with subtle contrast
  card: '#2D3142',             // Card surface - clear separation
  
  text: '#F5F7FA',            // Crisp white with warmth
  textSecondary: '#C1C7D0',   // Clear secondary text
  textTertiary: '#8B92A8',    // Muted but readable
  
  border: '#3A3F52',          // Visible but elegant borders
  divider: '#32374A',
  
  success: '#4ADE80',         // Fresh green, not neon
  error: '#F87171',           // Warm coral red
  warning: '#FBBF24',         // Rich amber
  info: '#60A5FA',            // Sky blue
  
  accent: '#A78BFA',          // Soft lavender purple
  accentLight: '#C4B5FD',
  
  shadow: '#00000060',
  overlay: '#000000B0',
  disabled: '#4B5366',
  placeholder: '#7B8299',
  
  gradientStart: '#4ECDC4',
  gradientEnd: '#A78BFA',
  
  admin: '#FB7185',           // Rose pink
  teacher: '#60A5FA',         // Sky blue
  student: '#4ADE80',         // Fresh green
  
  iconPrimary: '#F5F7FA',
  iconSecondary: '#9DA4B5',
  iconAccent: '#4ECDC4',
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = '@theme_mode';
const SYSTEM_THEME_KEY = '@use_system_theme';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [loading, setLoading] = useState(true);
  const [useSystemTheme, setUseSystemTheme] = useState(true);

  // Load saved theme preference and system setting on mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (!useSystemTheme) return;
    
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme && useSystemTheme) {
        const newMode = colorScheme === 'dark' ? 'dark' : 'light';
        setThemeMode(newMode);
      }
    });

    return () => subscription.remove();
  }, [useSystemTheme]);

  // Update StatusBar when theme changes
  useEffect(() => {
    StatusBar.setBarStyle(themeMode === 'dark' ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor(themeMode === 'dark' ? darkColors.background : lightColors.surface);
  }, [themeMode]);

  const loadTheme = async () => {
    try {
      const savedUseSystem = await AsyncStorage.getItem(SYSTEM_THEME_KEY);
      const shouldUseSystem = savedUseSystem !== 'false'; // Default to true
      
      if (shouldUseSystem) {
        // Use system theme
        const systemTheme = Appearance.getColorScheme();
        const initialMode = systemTheme === 'dark' ? 'dark' : 'light';
        setThemeMode(initialMode);
        setUseSystemTheme(true);
      } else {
        // Use saved preference
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setThemeMode(savedTheme);
        }
        setUseSystemTheme(false);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      // Fallback to system theme
      const systemTheme = Appearance.getColorScheme();
      const fallbackMode = systemTheme === 'dark' ? 'dark' : 'light';
      setThemeMode(fallbackMode);
    } finally {
      setLoading(false);
    }
  };

  const saveTheme = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      await AsyncStorage.setItem(SYSTEM_THEME_KEY, 'false'); // User made explicit choice
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    setUseSystemTheme(false); // User is manually toggling, disable system theme
    saveTheme(newMode);
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    setUseSystemTheme(false); // User is manually setting, disable system theme
    saveTheme(mode);
  };

  const theme: Theme = {
    mode: themeMode,
    colors: themeMode === 'light' ? lightColors : darkColors,
    isDark: themeMode === 'dark',
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  // Show nothing while loading theme preference
  if (loading) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
