import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

type AppTheme = {
  isDark: boolean;
  colors: {
    background: string;
    backgroundAlt: string;
    primary: string;
    primaryAlt: string;
    accent: string;
    accentAlt: string;
    accentMuted: string;
    danger: string;
    dangerMuted: string;
    success: string;
    successMuted: string;
    warning: string;
    warningMuted: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    card: string;
    cardElevated: string;
    border: string;
    borderLight: string;
    separator: string;
  };
};

type ThemeContextValue = {
  theme: AppTheme;
  mode: ColorSchemeName | 'system';
  setMode: (mode: ColorSchemeName | 'system') => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const darkTheme: AppTheme = {
  isDark: true,
  colors: {
    background: '#020617',
    backgroundAlt: '#0F172A',
    primary: '#0F172A',
    primaryAlt: '#1E3A8A',
    accent: '#14B8A6',
    accentAlt: '#22D3EE',
    accentMuted: 'rgba(20,184,166,0.12)',
    danger: '#EF4444',
    dangerMuted: 'rgba(239,68,68,0.12)',
    success: '#22C55E',
    successMuted: 'rgba(34,197,94,0.12)',
    warning: '#F59E0B',
    warningMuted: 'rgba(245,158,11,0.12)',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    card: 'rgba(15,23,42,0.80)',
    cardElevated: 'rgba(30,41,59,0.90)',
    border: 'rgba(148,163,184,0.18)',
    borderLight: 'rgba(148,163,184,0.08)',
    separator: 'rgba(148,163,184,0.12)',
  }
};

const lightTheme: AppTheme = {
  isDark: false,
  colors: {
    background: '#F9FAFB',
    backgroundAlt: '#E5E7EB',
    primary: '#1E3A8A',
    primaryAlt: '#3B82F6',
    accent: '#14B8A6',
    accentAlt: '#22D3EE',
    accentMuted: 'rgba(20,184,166,0.08)',
    danger: '#EF4444',
    dangerMuted: 'rgba(239,68,68,0.08)',
    success: '#22C55E',
    successMuted: 'rgba(34,197,94,0.08)',
    warning: '#F59E0B',
    warningMuted: 'rgba(245,158,11,0.08)',
    text: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#94A3B8',
    card: 'rgba(255,255,255,0.92)',
    cardElevated: 'rgba(255,255,255,0.98)',
    border: 'rgba(148,163,184,0.25)',
    borderLight: 'rgba(148,163,184,0.12)',
    separator: 'rgba(148,163,184,0.15)',
  }
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ColorSchemeName | 'system'>('dark');

  const theme = useMemo<AppTheme>(() => {
    const effectiveScheme = mode === 'system' ? systemScheme ?? 'dark' : mode;
    return effectiveScheme === 'dark' ? darkTheme : lightTheme;
  }, [mode, systemScheme]);

  const value = useMemo(
    () => ({
      theme,
      mode,
      setMode
    }),
    [theme, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return ctx;
};

