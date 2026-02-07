import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@contexts/ThemeContext';

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'filled' | 'outline';
};

export const PrimaryButton: React.FC<Props> = ({
  label,
  onPress,
  style,
  accessibilityLabel,
  disabled,
  icon,
  variant = 'filled',
}) => {
  const { theme } = useAppTheme();
  const isFilled = variant === 'filled';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isFilled
          ? { backgroundColor: theme.colors.accent }
          : {
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: theme.colors.accent,
            },
        disabled && { opacity: 0.45 },
        !disabled && pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint="Double tap to activate"
    >
      <View style={styles.content}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFilled ? '#FFFFFF' : theme.colors.accent}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.label,
            { color: isFilled ? '#FFFFFF' : theme.colors.accent },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
