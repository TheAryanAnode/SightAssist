import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { GradientBackground } from './GradientBackground';
import { useAppTheme } from '@contexts/ThemeContext';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const ScreenContainer: React.FC<Props> = ({ children, style }) => {
  const { theme } = useAppTheme();

  return (
    <GradientBackground>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
          style,
        ]}
      >
        {children}
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
});
