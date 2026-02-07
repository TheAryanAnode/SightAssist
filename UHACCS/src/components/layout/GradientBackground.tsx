import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@contexts/ThemeContext';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const GradientBackground: React.FC<Props> = ({ children, style }) => {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryAlt]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top + 8, 24),
          paddingBottom: Math.max(insets.bottom + 8, 24),
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
