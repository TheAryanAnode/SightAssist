import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '@screens/HomeScreen';
import { LiveModeScreen } from '@screens/LiveModeScreen';
import { OCRScreen } from '@screens/OCRScreen';
import { NavigationScreen } from '@screens/NavigationScreen';
import { MemoryScreen } from '@screens/MemoryScreen';
import { HistoryScreen } from '@screens/HistoryScreen';
import { SettingsScreen } from '@screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  LiveMode: undefined;
  OCR: undefined;
  Navigation: undefined;
  Memory: undefined;
  History: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LiveMode" component={LiveModeScreen} />
      <Stack.Screen name="OCR" component={OCRScreen} />
      <Stack.Screen name="Navigation" component={NavigationScreen} />
      <Stack.Screen name="Memory" component={MemoryScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

