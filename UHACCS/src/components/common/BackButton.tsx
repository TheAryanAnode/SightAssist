import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@contexts/ThemeContext';
import { useSpeech } from '@contexts/SpeechContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/AppNavigator';

type Props = {
  style?: ViewStyle;
};

const MIN_TOUCH_SIZE = 48;

export const BackButton: React.FC<Props> = ({ style }) => {
  const { theme } = useAppTheme();
  const { speak } = useSpeech();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    speak('Go back', { interrupt: true });
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.colors.cardElevated,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      accessibilityHint="Returns to the previous screen or home"
    >
      <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
